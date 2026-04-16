import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Zap, CheckCircle, Clock, Calendar, ChevronRight, Lightbulb, Code2, TestTube } from 'lucide-react';

// Map JSON difficulty (Easy/Medium/Hard) + internal (beginner/intermediate/advanced)
const difficultyColor = {
  Easy: 'text-green-400 bg-green-400/10 border-green-400/20',
  Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  Hard: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  beginner: 'text-green-400 bg-green-400/10 border-green-400/20',
  intermediate: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  advanced: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  pro: 'text-red-400 bg-red-400/10 border-red-400/20'
};

// Deterministic pick: same question all day, changes at midnight
const getDailyIndex = (count) => {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return seed % count;
};

// Transform a raw JSON question into the same shape CodingProblems uses
const transformQuestion = (q, index) => ({
  _id: q.id || `question-${index}`,
  jsonIndex: index,
  title: q.title,
  description: q.description,
  difficulty: q.difficulty,
  topics: q.topics || [],
  examples: q.examples || [],
  constraints: q.constraints || [],
  testCases: q.test_cases?.map(tc => ({
    input: JSON.stringify(tc.input),
    expectedOutput: JSON.stringify(tc.output),
    explanation: ''
  })) || q.examples?.map(ex => {
    if (ex.input !== undefined && ex.output !== undefined) {
      return { input: JSON.stringify(ex.input), expectedOutput: JSON.stringify(ex.output), explanation: ex.explanation || '' };
    }
    // old example_text format
    const text = ex.example_text || '';
    let input = '', expectedOutput = '';
    if (text.includes('Input:') && text.includes('Output:')) {
      input = text.split('Input:')[1]?.split('Output:')[0]?.trim() || '';
      const outPart = text.split('Output:')[1]?.trim() || '';
      expectedOutput = outPart.split('Explanation:')[0]?.trim() || outPart;
    }
    return { input, expectedOutput, explanation: text };
  }) || [],
  boilerplateCode: q.starter_code || q.code_snippets || {},
  hints: q.hints || [],
  company: q.companies || q.company || [],
  points: q.points || 10,
  timeLimit: q.time_limit || q.timeLimit || null
});

function Countdown() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center space-x-2 text-gray-400">
      <Clock className="w-4 h-4" />
      <span className="font-mono text-sm">New question in {timeLeft}</span>
    </div>
  );
}

export default function DailyChallenge() {
  const [question, setQuestion] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [status, setStatus] = useState({ completed: false, score: null });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHints, setShowHints] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadDailyChallenge();
  }, []);

  const loadDailyChallenge = async () => {
    try {
      // 1. Load from the same JSON file CodingProblems uses
      const res = await fetch('/merged_problems.json');
      const data = await res.json();
      const rawQuestions = data.questions || [];

      if (rawQuestions.length === 0) {
        setLoading(false);
        return;
      }

      const transformed = rawQuestions.map((q, i) => transformQuestion(q, i));
      setAllQuestions(transformed);

      // 2. Pick today's question deterministically
      const idx = getDailyIndex(transformed.length);
      setQuestion(transformed[idx]);

      // 3. Check completion status from backend (ignore backend's question field)
      try {
        const apiRes = await api.get('/daily-challenge');
        setStatus({ completed: apiRes.data.completed || false, score: apiRes.data.score });
      } catch (_) { /* non-critical */ }

      // 4. Load history
      try {
        const histRes = await api.get('/daily-challenge/history');
        setHistory(histRes.data.completions || []);
      } catch (_) { /* silent */ }

    } catch (err) {
      console.error('Failed to load daily challenge:', err);
    } finally {
      setLoading(false);
    }
  };

  const openInEditor = () => {
    if (!question) return;
    // Pass only lightweight context — never send full question arrays through state
    navigate(`/coding-editor/${question._id}`, {
      state: {
        fromDailyChallenge: true,
        difficulty: 'all',
        category: 'all',
        questionIndex: 0,
        totalQuestions: 1,
        filteredQuestions: [{ _id: question._id, title: question.title }]
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Zap className="w-7 h-7 text-yellow-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Daily Challenge</h1>
            <p className="text-gray-500 text-sm">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        <Countdown />
      </div>

      {question ? (
        <div className="space-y-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
            {/* Banner */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-xs uppercase tracking-widest mb-1">Today's Coding Problem</p>
                <h2 className="text-2xl font-bold text-white">{question.title}</h2>
              </div>
              {status.completed && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              )}
            </div>

            <div className="p-6 space-y-5">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs px-3 py-1 rounded-full border font-medium ${difficultyColor[question.difficulty] || 'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}>
                  {question.difficulty}
                </span>
                {question.topics.slice(0, 3).map(t => (
                  <span key={t} className="text-xs px-2 py-1 rounded-full border border-blue-400/20 bg-blue-400/10 text-blue-400">{t}</span>
                ))}
                {question.timeLimit && (
                  <span className="text-xs px-3 py-1 rounded-full border border-gray-600 bg-gray-700 text-gray-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3 inline mr-1" />{question.timeLimit} min
                  </span>
                )}
                {question.points > 0 && (
                  <span className="text-xs px-3 py-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 text-yellow-400">
                    +{question.points} pts
                  </span>
                )}
                {question.company?.length > 0 && (
                  <span className="text-xs text-gray-500">{question.company.slice(0, 3).join(' · ')}</span>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Problem Statement</h3>
                <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">
                  {question.description}
                </p>
              </div>

              {/* Constraints */}
              {question.constraints?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Constraints</h3>
                  <ul className="space-y-1">
                    {question.constraints.map((c, i) => (
                      <li key={i} className="text-gray-400 text-xs font-mono bg-gray-900 px-3 py-1.5 rounded">• {c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Examples from example_text */}
              {question.examples?.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <TestTube className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Examples</h3>
                  </div>
                  <div className="space-y-2">
                    {question.examples.slice(0, 3).map((ex, i) => (
                      <div key={i} className="bg-gray-900 rounded-lg px-4 py-3 text-xs font-mono text-gray-300 whitespace-pre-line">
                        {ex.example_text || (ex.input !== undefined
                          ? `Input: ${JSON.stringify(ex.input)}\nOutput: ${JSON.stringify(ex.output)}${ex.explanation ? '\nExplanation: ' + ex.explanation : ''}`
                          : '')}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hints */}
              {question.hints?.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowHints(h => !h)}
                    className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors"
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span>{showHints ? 'Hide Hints' : `Show Hints (${question.hints.length})`}</span>
                  </button>
                  {showHints && (
                    <ul className="mt-2 space-y-2 pl-1">
                      {question.hints.map((hint, i) => (
                        <li key={i} className="text-gray-400 text-sm flex items-start space-x-2">
                          <span className="text-yellow-500 shrink-0 mt-0.5">•</span>
                          <span dangerouslySetInnerHTML={{ __html: hint }} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* CTA */}
              {status.completed ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <div>
                      <p className="text-green-400 font-semibold">Challenge Completed!</p>
                      <p className="text-green-600 text-sm">Score: {status.score}%</p>
                    </div>
                  </div>
                  <button
                    onClick={openInEditor}
                    className="flex items-center space-x-2 text-green-400 hover:text-green-300 text-sm transition-colors"
                  >
                    <Code2 className="w-4 h-4" />
                    <span>View in Editor</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={openInEditor}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3.5 rounded-xl font-semibold transition-all"
                >
                  <Code2 className="w-5 h-5" />
                  <span>Open in Code Editor</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">No challenge available. Make sure questions are loaded.</div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-white">Recent History</h3>
          </div>
          <div className="space-y-2">
            {history.map(h => (
              <div key={h._id} className="flex items-center justify-between bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3">
                <span className="text-gray-300 text-sm">{h.date}</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">{h.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
