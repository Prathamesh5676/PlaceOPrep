const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionId: {
    type: String,
    required: true
  },
  questionTitle: String,
  questionDifficulty: String,
  questionCategory: String
}, {
  timestamps: true
});

bookmarkSchema.index({ userId: 1, questionId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
