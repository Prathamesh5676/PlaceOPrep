const mongoose = require('mongoose');

const scheduledInterviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['technical', 'hr', 'aptitude', 'general', 'full_simulation'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'pro'],
    default: 'intermediate'
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  title: String,
  notes: String,
  status: {
    type: String,
    enum: ['upcoming', 'completed', 'cancelled', 'missed'],
    default: 'upcoming'
  },
  reminderSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

scheduledInterviewSchema.index({ userId: 1, scheduledAt: 1 });
scheduledInterviewSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('ScheduledInterview', scheduledInterviewSchema);
