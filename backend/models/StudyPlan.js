const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  day: Number,
  title: String,
  description: String,
  type: { type: String, enum: ['coding', 'aptitude', 'hr', 'technical', 'general'] },
  difficulty: String,
  completed: { type: Boolean, default: false },
  completedAt: Date
}, { _id: false });

const studyPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planType: {
    type: String,
    enum: ['7day', '14day', '30day'],
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tasks: [taskSchema],
  completedTasks: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

studyPlanSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
