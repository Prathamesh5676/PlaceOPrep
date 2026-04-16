const Bookmark = require('../models/Bookmark');

exports.addBookmark = async (req, res) => {
  try {
    const { questionId, questionTitle, questionDifficulty, questionCategory } = req.body;

    const bookmark = await Bookmark.create({
      userId: req.userId,
      questionId,
      questionTitle,
      questionDifficulty,
      questionCategory
    });

    res.status(201).json({ bookmark, message: 'Question bookmarked' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Already bookmarked' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.removeBookmark = async (req, res) => {
  try {
    const { questionId } = req.params;
    const result = await Bookmark.findOneAndDelete({ userId: req.userId, questionId });

    if (!result) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    res.json({ message: 'Bookmark removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ bookmarks });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.checkBookmark = async (req, res) => {
  try {
    const { questionId } = req.params;
    const bookmark = await Bookmark.findOne({ userId: req.userId, questionId });
    res.json({ isBookmarked: !!bookmark });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
