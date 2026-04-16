const Session = require('../models/Session');
const User = require('../models/User');
const Question = require('../models/Question');
const Skill = require('../models/Skill');
const Achievement = require('../models/Achievement');

// Helper function to update achievements (fixed: correct progress tracking)
const updateAchievements = async (userId, type, score) => {
  const user = await User.findById(userId);
  if (!user) return;

  // first_steps: only unlock once (when totalInterviews becomes 1)
  if (user.totalInterviews === 1) {
    await Achievement.findOneAndUpdate(
      { userId, type: 'first_steps' },
      { progress: 1, unlocked: true, unlockedAt: new Date() }
    );
  }

  // getting_started: 5 interviews
  await Achievement.findOneAndUpdate(
    { userId, type: 'getting_started' },
    { progress: user.totalInterviews }
  );
  if (user.totalInterviews >= 5) {
    await Achievement.findOneAndUpdate(
      { userId, type: 'getting_started' },
      { unlocked: true, unlockedAt: new Date() }
    );
  }

  // practice_perfect: 10 interviews
  await Achievement.findOneAndUpdate(
    { userId, type: 'practice_perfect' },
    { progress: user.totalInterviews }
  );
  if (user.totalInterviews >= 10) {
    await Achievement.findOneAndUpdate(
      { userId, type: 'practice_perfect' },
      { unlocked: true, unlockedAt: new Date() }
    );
  }

  // consistency: 3-day streak
  await Achievement.findOneAndUpdate(
    { userId, type: 'consistency' },
    { progress: user.currentStreak }
  );
  if (user.currentStreak >= 3) {
    await Achievement.findOneAndUpdate(
      { userId, type: 'consistency' },
      { unlocked: true, unlockedAt: new Date() }
    );
  }

  // week_warrior: 7-day streak
  await Achievement.findOneAndUpdate(
    { userId, type: 'week_warrior' },
    { progress: user.currentStreak }
  );
  if (user.currentStreak >= 7) {
    await Achievement.findOneAndUpdate(
      { userId, type: 'week_warrior' },
      { unlocked: true, unlockedAt: new Date() }
    );
  }

  // high_performer: score >= 80
  if (score >= 80) {
    await Achievement.findOneAndUpdate(
      { userId, type: 'high_performer' },
      { progress: 1, unlocked: true, unlockedAt: new Date() }
    );
  }

  // excellence: score >= 90
  if (score >= 90) {
    await Achievement.findOneAndUpdate(
      { userId, type: 'excellence' },
      { progress: 1, unlocked: true, unlockedAt: new Date() }
    );
  }

  // category-specific achievements
  const categoryMap = {
    'technical': 'technical_master',
    'hr': 'communication_expert',
    'aptitude': 'aptitude_ace',
    'full_simulation': 'simulation_champion'
  };

  if (categoryMap[type]) {
    const count = await Session.countDocuments({ userId, type, completed: true });
    const target = type === 'full_simulation' ? 1 : 5;

    await Achievement.findOneAndUpdate(
      { userId, type: categoryMap[type] },
      { progress: count }
    );
    if (count >= target) {
      await Achievement.findOneAndUpdate(
        { userId, type: categoryMap[type] },
        { unlocked: true, unlockedAt: new Date() }
      );
    }
  }

  // time_warrior: 600 minutes (10 hours)
  await Achievement.findOneAndUpdate(
    { userId, type: 'time_warrior' },
    { progress: user.practiceTime }
  );
  if (user.practiceTime >= 600) {
    await Achievement.findOneAndUpdate(
      { userId, type: 'time_warrior' },
      { unlocked: true, unlockedAt: new Date() }
    );
  }
};

// Helper function to update skills
const updateSkills = async (userId, type, score) => {
  const skillMap = {
    'technical': 'technical',
    'hr': 'hr',
    'aptitude': 'aptitude',
    'general': 'communication'
  };

  const skillKey = skillMap[type];
  if (!skillKey) return;

  const skill = await Skill.findOne({ userId });
  if (!skill) return;

  const currentValue = skill[skillKey] || 0;
  const newValue = Math.min(100, Math.round((currentValue * 0.7) + (score * 0.3)));

  await Skill.findOneAndUpdate(
    { userId },
    { [skillKey]: newValue, lastUpdated: new Date() }
  );
};

// Start session
exports.startSession = async (req, res) => {
  try {
    const { mode, type, difficulty, questionId } = req.body;
    const sessionType = mode || type;

    let question;
    if (questionId) {
      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(questionId)) {
        return res.status(400).json({ message: 'Invalid question ID' });
      }
      question = await Question.findById(questionId);
    } else {
      const filter = { category: sessionType };
      if (difficulty) filter.difficulty = difficulty;

      const count = await Question.countDocuments(filter);
      const random = Math.floor(Math.random() * count);
      question = await Question.findOne(filter).skip(random);
    }

    if (!question) {
      return res.status(404).json({ message: 'No questions available' });
    }

    const session = await Session.create({
      userId: req.userId,
      type: sessionType,
      difficulty: difficulty || question.difficulty,
      questionId: question._id,
      startTime: new Date(),
      status: 'in_progress'
    });

    res.status(201).json({ session, question });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit session
exports.submitSession = async (req, res) => {
  try {
    const { sessionId, code, language, userAnswer, score } = req.body;

    const session = await Session.findById(sessionId).populate('questionId');
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const endTime = new Date();
    const duration = Math.floor((endTime - session.startTime) / 1000);
    const finalScore = score || 100;
    const durationMinutes = Math.ceil(duration / 60);

    session.code = code;
    session.language = language;
    session.userAnswer = userAnswer;
    session.score = finalScore;
    session.endTime = endTime;
    session.duration = duration;
    session.completed = true;
    session.status = 'completed';
    session.metadata = {
      questionId: session.questionId._id,
      code,
      language,
      runtime: '0 ms',
      testCasesPassed: 0,
      totalTestCases: 0
    };

    await session.save();

    // Update user stats (fixes BUG #7)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const user = await User.findById(req.userId);
    if (user) {
      const lastPractice = user.lastPracticeDate ? new Date(user.lastPracticeDate) : null;
      if (lastPractice) lastPractice.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Update streak
      let newStreak = user.currentStreak || 0;
      if (!lastPractice || lastPractice < yesterday) {
        newStreak = 1; // reset streak
      } else if (lastPractice.getTime() === yesterday.getTime()) {
        newStreak += 1; // extend streak
      }
      // if lastPractice is today, streak stays the same

      const newTotalInterviews = (user.totalInterviews || 0) + 1;
      const newPracticeTime = (user.practiceTime || 0) + durationMinutes;
      const allScores = await Session.find({ userId: req.userId, completed: true }).select('score');
      const totalScore = allScores.reduce((sum, s) => sum + (s.score || 0), 0) + finalScore;
      const newAverage = Math.round(totalScore / (allScores.length + 1));
      const newBestScore = Math.max(user.bestScore || 0, finalScore);

      await User.findByIdAndUpdate(req.userId, {
        totalInterviews: newTotalInterviews,
        practiceTime: newPracticeTime,
        averageScore: newAverage,
        bestScore: newBestScore,
        currentStreak: newStreak,
        lastPracticeDate: new Date()
      });

      // Now update achievements and skills after stats are updated
      await updateAchievements(req.userId, session.type, finalScore);
      await updateSkills(req.userId, session.type, finalScore);
    }

    res.json({ session, score: finalScore, message: 'Session completed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user sessions
exports.getUserSessions = async (req, res) => {
  try {
    const { type, limit = 20, page = 1 } = req.query;
    const filter = { userId: req.userId, completed: true };

    if (type) filter.type = type;

    const sessions = await Session.find(filter)
      .populate('questionId', 'title difficulty category')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Session.countDocuments(filter);

    res.json({ sessions, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get session by ID
exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.userId
    }).populate('questionId');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
