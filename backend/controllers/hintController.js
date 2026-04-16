const Question = require('../models/Question');
const axios = require('axios');

exports.getHint = async (req, res) => {
  try {
    const { questionId, hintLevel = 1 } = req.body;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const level = parseInt(hintLevel);
    if (level < 1 || level > 3) {
      return res.status(400).json({ message: 'hintLevel must be 1, 2, or 3' });
    }

    // Try to use existing hints from question data
    if (question.hints && question.hints.length >= level) {
      return res.json({ hint: question.hints[level - 1], level, source: 'stored' });
    }

    // Otherwise generate via AI engine
    const pyEngineUrl = req.app.get('PY_ENGINE_URL') || 'http://localhost:5000';
    const levelDescriptions = {
      1: 'Give a very small conceptual hint — just point toward the approach, no code.',
      2: 'Give a moderate hint — suggest the algorithm or data structure to use.',
      3: 'Give a detailed explanation — walk through the approach step by step, optionally with pseudocode.'
    };

    try {
      const response = await axios.post(`${pyEngineUrl}/generate-hint`, {
        question: question.title,
        description: question.description,
        level: levelDescriptions[level]
      }, { timeout: 10000 });

      return res.json({ hint: response.data.hint, level, source: 'ai' });
    } catch (aiError) {
      // Fallback static hints
      const fallbacks = {
        1: 'Think about what data structure best suits this problem.',
        2: 'Consider the time complexity requirements. Can you solve this in O(n) or O(n log n)?',
        3: `Break the problem into smaller steps: understand the input, identify the pattern, choose your data structure, then implement step by step.`
      };
      return res.json({ hint: fallbacks[level], level, source: 'fallback' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
