import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Bookmark, Trash2, Code, Brain, MessageSquare, BookOpen, ExternalLink } from 'lucide-react';

const difficultyColor = {
  beginner: 'text-green-400 bg-green-400/10',
  intermediate: 'text-yellow-400 bg-yellow-400/10',
  advanced: 'text-orange-400 bg-orange-400/10',
  pro: 'text-red-400 bg-red-400/10'
};

const categoryIcon = {
  coding: Code,
  technical: Brain,
  hr: MessageSquare,
  aptitude: BookOpen
};

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const { data } = await api.get('/bookmarks');
      setBookmarks(data.bookmarks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (questionId) => {
    try {
      await api.delete(`/bookmarks/${questionId}`);
      setBookmarks(prev => prev.filter(b => b.questionId !== questionId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 mb-8">
        <Bookmark className="w-7 h-7 text-purple-400" />
        <h1 className="text-2xl font-bold text-white">Bookmarks</h1>
        <span className="bg-purple-500/20 text-purple-300 text-sm px-3 py-1 rounded-full">{bookmarks.length}</span>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-20">
          <Bookmark className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No bookmarks yet</p>
          <p className="text-gray-500 text-sm mt-2">Bookmark questions from the Question Bank to save them here.</p>
          <Link to="/question-bank" className="mt-4 inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">
            Browse Questions
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map(b => {
            const Icon = categoryIcon[b.questionCategory] || BookOpen;
            return (
              <div key={b._id} className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 flex items-center justify-between hover:border-purple-500/50 transition-colors">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="bg-purple-500/20 p-2 rounded-lg shrink-0">
                    <Icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">{b.questionTitle || b.questionId}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {b.questionDifficulty && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColor[b.questionDifficulty] || 'text-gray-400 bg-gray-400/10'}`}>
                          {b.questionDifficulty}
                        </span>
                      )}
                      {b.questionCategory && (
                        <span className="text-xs text-gray-500">{b.questionCategory}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4 shrink-0">
                  <Link
                    to={`/coding-editor/${b.questionId}`}
                    className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                    title="Open question"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => removeBookmark(b.questionId)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    title="Remove bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
