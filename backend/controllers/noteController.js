const Note = require('../models/Note');

exports.getNotes = async (req, res) => {
  try {
    const { questionId, isFlashcard } = req.query;
    const filter = { userId: req.userId };
    if (questionId) filter.questionId = questionId;
    if (isFlashcard !== undefined) filter.isFlashcard = isFlashcard === 'true';

    const notes = await Note.find(filter).sort({ createdAt: -1 });
    res.json({ notes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createNote = async (req, res) => {
  try {
    const { questionId, questionTitle, content, tags, isFlashcard, flashcardBack } = req.body;

    const note = await Note.create({
      userId: req.userId,
      questionId,
      questionTitle,
      content,
      tags: tags || [],
      isFlashcard: isFlashcard || false,
      flashcardBack
    });

    res.status(201).json({ note });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { content, tags, isFlashcard, flashcardBack } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { content, tags, isFlashcard, flashcardBack, updatedAt: new Date() },
      { new: true }
    );

    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ note });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const result = await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!result) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
