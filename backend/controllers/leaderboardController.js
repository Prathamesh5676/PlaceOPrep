const User = require('../models/User');
const Submission = require('../models/Submission');
const Session = require('../models/Session');

exports.getLeaderboard = async (req, res) => {
  try {
    const { period = 'alltime', limit = 20 } = req.query;

    let dateFilter = {};
    if (period === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { createdAt: { $gte: weekAgo } };
    } else if (period === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { createdAt: { $gte: monthAgo } };
    }

    // Aggregate scores from sessions
    const sessionAgg = await Session.aggregate([
      { $match: { completed: true, ...dateFilter } },
      {
        $group: {
          _id: '$userId',
          totalSessions: { $sum: 1 },
          totalScore: { $sum: '$score' },
          avgScore: { $avg: '$score' }
        }
      }
    ]);

    // Aggregate solved problems from submissions
    const submissionAgg = await Submission.aggregate([
      { $match: { status: 'accepted', ...dateFilter } },
      { $group: { _id: '$userId', problemsSolved: { $sum: 1 } } }
    ]);

    const submissionMap = {};
    submissionAgg.forEach(s => { submissionMap[s._id.toString()] = s.problemsSolved; });

    // Combine and sort
    const leaderboardData = sessionAgg.map(s => ({
      userId: s._id,
      totalSessions: s.totalSessions,
      totalScore: Math.round(s.totalScore),
      avgScore: Math.round(s.avgScore),
      problemsSolved: submissionMap[s._id.toString()] || 0,
      rank: 0
    }));

    leaderboardData.sort((a, b) => b.avgScore - a.avgScore || b.problemsSolved - a.problemsSolved);
    leaderboardData.forEach((item, i) => { item.rank = i + 1; });

    // Fetch user details for top N
    const topN = leaderboardData.slice(0, parseInt(limit));
    const userIds = topN.map(t => t.userId);
    const users = await User.find({ _id: { $in: userIds } }).select('name avatar currentStreak');

    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });

    const result = topN.map(item => {
      const u = userMap[item.userId.toString()] || {};
      return {
        rank: item.rank,
        userId: item.userId,
        name: u.name || 'Anonymous',
        avatar: u.avatar || '',
        streak: u.currentStreak || 0,
        avgScore: item.avgScore,
        totalSessions: item.totalSessions,
        problemsSolved: item.problemsSolved
      };
    });

    // Find current user's rank
    const myRankData = leaderboardData.find(l => l.userId.toString() === req.userId.toString());
    const myRank = myRankData ? myRankData.rank : null;

    res.json({ leaderboard: result, myRank, period });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
