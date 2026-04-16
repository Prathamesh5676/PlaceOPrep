const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Achievement = require('../models/Achievement');
const fs = require('fs');
const path = require('path');

// Generate access token (15 min for production, 7d for dev convenience)
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'change-me-in-production', {
    expiresIn: '7d'
  });
};

// Generate refresh token (30 days)
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET || 'change-refresh-in-production', {
    expiresIn: '30d'
  });
};

// Initialize achievements for new user
const initializeAchievements = async (userId) => {
  const achievements = [
    { type: 'first_steps', name: 'First Steps', description: 'Complete your first interview', target: 1, icon: '🎯' },
    { type: 'getting_started', name: 'Getting Started', description: 'Complete 5 interviews', target: 5, icon: '🚀' },
    { type: 'practice_perfect', name: 'Practice Makes Perfect', description: 'Complete 10 interviews', target: 10, icon: '💪' },
    { type: 'consistency', name: 'Consistency', description: 'Practice 3 days in a row', target: 3, icon: '🔥' },
    { type: 'week_warrior', name: 'Week Warrior', description: 'Practice 7 days in a row', target: 7, icon: '⚡' },
    { type: 'high_performer', name: 'High Performer', description: 'Score 80% or higher', target: 1, icon: '⭐' },
    { type: 'excellence', name: 'Excellence', description: 'Score 90% or higher', target: 1, icon: '🏆' },
    { type: 'technical_master', name: 'Technical Master', description: 'Complete 5 technical rounds', target: 5, icon: '💻' },
    { type: 'communication_expert', name: 'Communication Expert', description: 'Complete 5 HR rounds', target: 5, icon: '🗣️' },
    { type: 'aptitude_ace', name: 'Aptitude Ace', description: 'Complete 5 aptitude rounds', target: 5, icon: '🧠' },
    { type: 'simulation_champion', name: 'Simulation Champion', description: 'Complete a full simulation', target: 1, icon: '🎖️' },
    { type: 'time_warrior', name: 'Time Warrior', description: 'Practice for 10 hours', target: 600, icon: '⏰' }
  ];

  await Achievement.insertMany(achievements.map(ach => ({ ...ach, userId })));
};

// Register
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      email,
      password,
      name,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    });

    await Skill.create({ userId: user._id });

    try {
      await initializeAchievements(user._id);
    } catch (achErr) {
      if (achErr.code !== 11000) throw achErr;
    }

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await User.findByIdAndUpdate(user._id, { refreshToken });

    res.status(201).json({
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        gender: user.gender,
        mobileNumber: user.mobileNumber,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await User.findByIdAndUpdate(user._id, { refreshToken });

    res.json({
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        gender: user.gender,
        mobileNumber: user.mobileNumber,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'change-refresh-in-production'
    );

    const user = await User.findById(decoded.userId).select('refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });

    res.json({ token: newToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

// Logout (invalidate refresh token)
exports.logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { refreshToken: null });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Forgot password — generate reset token and send email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: Date.now() + 60 * 60 * 1000 // 1 hour
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&id=${user._id}`;

    // Send email if nodemailer is configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.EMAIL_PORT) || 587,
          secure: false,
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        await transporter.sendMail({
          from: `"PlaceOPrep" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: 'Password Reset Request',
          html: `
            <h2>Password Reset</h2>
            <p>You requested a password reset for your PlaceOPrep account.</p>
            <p>Click the link below to reset your password (valid for 1 hour):</p>
            <a href="${resetUrl}" style="background:#7c3aed;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;">Reset Password</a>
            <p>If you did not request this, please ignore this email.</p>
          `
        });
      } catch (emailErr) {
        console.error('Email send error:', emailErr.message);
      }
    }

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, userId, newPassword } = req.body;

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      _id: userId,
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshToken = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully. Please log in with your new password.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -refreshToken -resetPasswordToken -resetPasswordExpires');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Valid gender values that match the User schema enum
const VALID_GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, gender, mobileNumber } = req.body;

    const updateData = {};
    if (name && name.trim()) updateData.name = name.trim();

    // Only update gender when a valid value is explicitly selected
    if (gender && VALID_GENDERS.includes(gender)) {
      updateData.gender = gender;
    }

    if (mobileNumber !== undefined) updateData.mobileNumber = mobileNumber;

    if (req.file) {
      const currentUser = await User.findById(req.userId);

      if (currentUser.avatar && currentUser.avatar.startsWith('/uploads/')) {
        const oldFilePath = path.join(__dirname, '..', currentUser.avatar);
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error('Error deleting old avatar:', err);
        });
      }

      updateData.avatar = `/uploads/profiles/${req.file.filename}`;
    }

    // Use $set explicitly to avoid Mongoose casting issues
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true, runValidators: false }
    ).select('-password -refreshToken -resetPasswordToken -resetPasswordExpires');

    res.json({ user });
  } catch (error) {
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads/profiles', req.file.filename);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
