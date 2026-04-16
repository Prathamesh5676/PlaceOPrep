const Question = require('../models/Question');

exports.getCompanies = async (req, res) => {
  try {
    // Aggregate unique companies from questions
    const result = await Question.aggregate([
      { $unwind: '$company' },
      { $group: { _id: '$company', questionCount: { $sum: 1 } } },
      { $sort: { questionCount: -1 } },
      { $project: { name: '$_id', questionCount: 1, _id: 0 } }
    ]);

    res.json({ companies: result });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCompanyQuestions = async (req, res) => {
  try {
    const { name } = req.params;
    const { difficulty, limit = 20, page = 1 } = req.query;

    const filter = { company: { $in: [name] } };
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.find(filter)
      .select('title difficulty category topics company')
      .sort({ difficulty: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Question.countDocuments(filter);

    res.json({ questions, total, company: name, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCompanyStats = async (req, res) => {
  try {
    const { name } = req.params;

    const byDifficulty = await Question.aggregate([
      { $match: { company: { $in: [name] } } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);

    const byCategory = await Question.aggregate([
      { $match: { company: { $in: [name] } } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({ company: name, byDifficulty, byCategory });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
