const ScheduledInterview = require('../models/ScheduledInterview');

exports.createSchedule = async (req, res) => {
  try {
    const { type, difficulty, scheduledAt, title, notes } = req.body;

    if (new Date(scheduledAt) <= new Date()) {
      return res.status(400).json({ message: 'Scheduled time must be in the future' });
    }

    const interview = await ScheduledInterview.create({
      userId: req.userId,
      type,
      difficulty: difficulty || 'intermediate',
      scheduledAt: new Date(scheduledAt),
      title: title || `${type} Interview`,
      notes
    });

    res.status(201).json({ interview, message: 'Interview scheduled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSchedules = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { userId: req.userId };
    if (status) filter.status = status;

    // Auto-update missed interviews
    await ScheduledInterview.updateMany(
      { userId: req.userId, status: 'upcoming', scheduledAt: { $lt: new Date() } },
      { status: 'missed' }
    );

    const interviews = await ScheduledInterview.find(filter).sort({ scheduledAt: 1 });
    res.json({ interviews });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.cancelSchedule = async (req, res) => {
  try {
    const interview = await ScheduledInterview.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId, status: 'upcoming' },
      { status: 'cancelled' },
      { new: true }
    );

    if (!interview) return res.status(404).json({ message: 'Scheduled interview not found or already completed' });
    res.json({ interview, message: 'Interview cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUpcoming = async (req, res) => {
  try {
    const next24h = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const interviews = await ScheduledInterview.find({
      userId: req.userId,
      status: 'upcoming',
      scheduledAt: { $gte: new Date(), $lte: next24h }
    }).sort({ scheduledAt: 1 });

    res.json({ interviews });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
