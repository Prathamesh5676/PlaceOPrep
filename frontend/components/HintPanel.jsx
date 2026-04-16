import { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import api from '../services/api';

export default function HintPanel({ questionId }) {
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState(0);
  const [hints, setHints] = useState({});
  const [loading, setLoading] = useState(false);

  const getHint = async (requestedLevel) => {
    if (hints[requestedLevel]) return; // already fetched
    setLoading(true);
    try {
      const { data } = await api.post('/hints', { questionId, hintLevel: requestedLevel });
      setHints(prev => ({ ...prev, [requestedLevel]: data.hint }));
    } catch (err) {
      setHints(prev => ({ ...prev, [requestedLevel]: 'Could not load hint. Try again.' }));
    } finally {
      setLoading(false);
    }
  };

  const revealLevel = (l) => {
    setLevel(l);
    getHint(l);
  };

  const levelLabels = { 1: 'Small Hint', 2: 'Bigger Hint', 3: 'Full Explanation' };
  const levelColors = { 1: 'text-green-400', 2: 'text-yellow-400', 3: 'text-orange-400' };

  return (
    <div className="border border-yellow-500/20 rounded-xl bg-yellow-500/5 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-yellow-500/10 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <span className="text-yellow-400 font-medium text-sm">Hints</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-yellow-400" /> : <ChevronDown className="w-4 h-4 text-yellow-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4">
          <div className="flex space-x-2 mb-4">
            {[1, 2, 3].map(l => (
              <button
                key={l}
                onClick={() => revealLevel(l)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors border ${
                  level >= l
                    ? `${levelColors[l]} border-current bg-current/10`
                    : 'text-gray-500 border-gray-700 hover:border-gray-600'
                }`}
              >
                {levelLabels[l]}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex items-center space-x-2 text-gray-400 text-sm py-2">
              <Loader className="w-4 h-4 animate-spin" />
              <span>Loading hint...</span>
            </div>
          )}

          {[1, 2, 3].map(l => hints[l] && level >= l && (
            <div key={l} className={`mb-3 p-3 rounded-lg bg-gray-800 border border-gray-700`}>
              <p className={`text-xs font-medium mb-1 ${levelColors[l]}`}>{levelLabels[l]}</p>
              <p className="text-gray-300 text-sm leading-relaxed">{hints[l]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
