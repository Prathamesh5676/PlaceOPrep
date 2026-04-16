const Question = require('../models/Question');
const DailyCompletion = require('../models/DailyCompletion');

// Pick a deterministic question for today using date-based seed
const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

exports.getDailyChallenge = async (req, res) => {
  try {
    const today = getTodayString();

    // Rotate difficulty: Mon/Tue=beginner, Wed/Thu=intermediate, Fri/Sat=advanced, Sun=pro
    const dayOfWeek = new Date().getDay();
    const difficulties = ['intermediate', 'beginner', 'beginner', 'intermediate', 'advanced', 'advanced', 'pro'];
    const todayDifficulty = difficulties[dayOfWeek];

    // Deterministic selection: use date string as seed
    const seed = today.replace(/-/g, '');
    const seedNum = parseInt(seed) % 1000;

    // Only pick from coding problems (category: technical OR type: coding)
    // Try matching today's difficulty first, fall back to any coding question
    let codingFilter = { $or: [{ type: 'coding' }, { category: 'technical' }], difficulty: todayDifficulty };
    let count = await Question.countDocuments(codingFilter);

    if (count === 0) {
      // Fall back: any coding question regardless of difficulty
      codingFilter = { $or: [{ type: 'coding' }, { category: 'technical' }] };
      count = await Question.countDocuments(codingFilter);
    }
    if (count === 0) {
      return res.status(404).json({ message: 'No coding questions available for today' });
    }

    const skip = seedNum % count;
    // find().sort().skip().limit(1) is more reliable than findOne().skip()
    const questions = await Question.find(codingFilter).sort({ _id: 1 }).skip(skip).limit(1);
    const question = questions[0] || null;

    // Check if current user already completed today's challenge
    const completion = await DailyCompletion.findOne({ userId: req.userId, date: today });

    res.json({
      question,
      date: today,
      difficulty: todayDifficulty,
      completed: !!completion,
      score: completion ? completion.score : null
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.completeChallenge = async (req, res) => {
  try {
    const today = getTodayString();
    const { questionId, score } = req.body;

    const existing = await DailyCompletion.findOne({ userId: req.userId, date: today });
    if (existing) {
      return res.status(409).json({ message: 'Daily challenge already completed today' });
    }

    const completion = await DailyCompletion.create({
      userId: req.userId,
      date: today,
      questionId,
      score: score || 0
    });

    res.status(201).json({ completion, message: 'Daily challenge completed! +10 bonus points' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getChallengeHistory = async (req, res) => {
  try {
    const completions = await DailyCompletion.find({ userId: req.userId }).sort({ date: -1 }).limit(30);
    res.json({ completions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
