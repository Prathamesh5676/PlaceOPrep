const Notification = require('../models/Notification');
const User = require('../models/User');

// Reusable nodemailer transporter
const getTransporter = () => {
  const nodemailer = require('nodemailer');
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
};

exports.getNotifications = async (req, res) => {
  try {
    const { limit = 20, unreadOnly } = req.query;
    const filter = { userId: req.userId };
    if (unreadOnly === 'true') filter.read = false;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({ userId: req.userId, read: false });

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === 'all') {
      await Notification.updateMany({ userId: req.userId, read: false }, { read: true });
      return res.json({ message: 'All notifications marked as read' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { read: true },
      { new: true }
    );

    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json({ notification });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get notification email settings for the logged-in user
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('email notificationEmail emailNotifications');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      registeredEmail: user.email,
      notificationEmail: user.notificationEmail || '',
      emailNotifications: user.emailNotifications || false
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update notification email settings
exports.updateSettings = async (req, res) => {
  try {
    const { notificationEmail, emailNotifications } = req.body;
    const update = {};
    if (notificationEmail !== undefined) update.notificationEmail = notificationEmail.trim();
    if (emailNotifications !== undefined) update.emailNotifications = Boolean(emailNotifications);

    const user = await User.findByIdAndUpdate(req.userId, { $set: update }, { new: true })
      .select('email notificationEmail emailNotifications');

    res.json({
      registeredEmail: user.email,
      notificationEmail: user.notificationEmail || '',
      emailNotifications: user.emailNotifications || false,
      message: 'Notification settings updated'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a sample notification for testing
exports.createTestNotification = async (req, res) => {
  try {
    const samples = [
      { type: 'achievement', title: 'Achievement Unlocked', message: 'You earned the "First Steps" badge! Complete your first interview.', icon: '🏆' },
      { type: 'streak', title: 'Streak Alert', message: 'You are on a 3-day practice streak! Keep it going.', icon: '🔥' },
      { type: 'daily_challenge', title: 'Daily Challenge', message: "Today's challenge is live: solve the Binary Search problem for bonus points.", icon: '⚡' },
      { type: 'reminder', title: 'Practice Reminder', message: "Don't forget your scheduled mock interview today at 5:00 PM.", icon: '⏰' },
      { type: 'system', title: 'Welcome to PlaceOPrep', message: 'Your account is all set. Start with a Daily Challenge or pick a question from the Question Bank.', icon: '👋' }
    ];
    const pick = samples[Math.floor(Math.random() * samples.length)];
    await Notification.create({ userId: req.userId, ...pick });
    res.json({ message: 'Test notification created', notification: pick });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Internal helper — used by other controllers to create notifications
// Also sends an email if the user has enabled email notifications
exports.createNotification = async (userId, type, title, message, icon) => {
  try {
    await Notification.create({ userId, type, title, message, icon });

    // Send email notification if nodemailer is configured and user has enabled it
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const user = await User.findById(userId).select('email notificationEmail emailNotifications name');
      if (user && user.emailNotifications) {
        const recipient = user.notificationEmail && user.notificationEmail.trim()
          ? user.notificationEmail.trim()
          : user.email;

        try {
          const transporter = getTransporter();
          await transporter.sendMail({
            from: `"PlaceOPrep" <${process.env.EMAIL_USER}>`,
            to: recipient,
            subject: title || 'PlaceOPrep Notification',
            html: `
              <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px">
                <div style="background:linear-gradient(135deg,#7c3aed,#2563eb);border-radius:10px;padding:20px 24px;margin-bottom:20px">
                  <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700">PlaceOPrep</h1>
                  <p style="color:#ddd6fe;margin:4px 0 0;font-size:13px">Interview Preparation Platform</p>
                </div>
                <div style="background:#fff;border-radius:10px;padding:20px 24px;border:1px solid #e5e7eb">
                  <p style="font-size:24px;margin:0 0 8px">${icon || '🔔'}</p>
                  <h2 style="color:#111827;margin:0 0 10px;font-size:18px">${title || 'Notification'}</h2>
                  <p style="color:#374151;font-size:15px;line-height:1.6;margin:0">${message}</p>
                </div>
                <p style="color:#9ca3af;font-size:12px;margin-top:16px;text-align:center">
                  You received this because you enabled email notifications on PlaceOPrep.<br>
                  You can disable them anytime from <strong>Profile → Notification Settings</strong>.
                </p>
              </div>
            `
          });
        } catch (emailErr) {
          console.error('Notification email send error:', emailErr.message);
        }
      }
    }
  } catch (err) {
    // Non-critical, don't crash the caller
    console.error('Notification create error:', err.message);
  }
};
