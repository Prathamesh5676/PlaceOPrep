const mongoose = require('mongoose');

const dailyCompletionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  questionId: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

dailyCompletionSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyCompletion', dailyCompletionSchema);
