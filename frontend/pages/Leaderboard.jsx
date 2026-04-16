import { useState, useEffect } from 'react';
import api from '../services/api';
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react';

export default function Leaderboard() {
  const [data, setData] = useState({ leaderboard: [], myRank: null });
  const [period, setPeriod] = useState('alltime');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get(`/leaderboard?period=${period}&limit=50`);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const rankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-gray-500 font-bold text-sm w-5 text-center">#{rank}</span>;
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Trophy className="w-7 h-7 text-yellow-400" />
          <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
        </div>
        <div className="flex space-x-2">
          {['alltime', 'weekly', 'monthly'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === p ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              {p === 'alltime' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {data.myRank && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6 flex items-center space-x-3">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <p className="text-purple-300">Your rank: <span className="font-bold text-white">#{data.myRank}</span></p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-500"></div>
        </div>
      ) : data.leaderboard.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No data yet. Complete some sessions to appear here!</div>
      ) : (
        <div className="space-y-2">
          {data.leaderboard.map((user) => (
            <div
              key={user.userId}
              className={`flex items-center space-x-4 p-4 rounded-xl border transition-colors ${user.rank <= 3 ? 'bg-gray-800 border-yellow-500/30' : 'bg-gray-800/50 border-gray-700'}`}
            >
              <div className="w-8 flex justify-center shrink-0">{rankIcon(user.rank)}</div>
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                alt={user.name}
                className="w-10 h-10 rounded-full shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{user.name}</p>
                <p className="text-xs text-gray-500">{user.streak} day streak</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-white font-bold">{user.avgScore}%</p>
                <p className="text-xs text-gray-500">{user.problemsSolved} solved</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
