const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: true
  },
  tags: [String],
  isFlashcard: {
    type: Boolean,
    default: false
  },
  flashcardBack: String // answer/explanation side for flashcard mode
}, {
  timestamps: true
});

noteSchema.index({ userId: 1, questionId: 1 });
noteSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Note', noteSchema);
