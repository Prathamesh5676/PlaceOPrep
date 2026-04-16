const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['achievement', 'streak', 'daily_challenge', 'reminder', 'system'],
    required: true
  },
  title: String,
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  icon: String
}, {
  timestamps: true
});

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
