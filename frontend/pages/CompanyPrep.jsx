import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Code, ChevronRight, Search } from 'lucide-react';

const companyColors = [
  'from-blue-600 to-blue-800', 'from-red-600 to-red-800', 'from-green-600 to-green-800',
  'from-orange-600 to-orange-800', 'from-purple-600 to-purple-800', 'from-pink-600 to-pink-800',
  'from-teal-600 to-teal-800', 'from-yellow-600 to-yellow-800'
];

const difficultyColor = {
  Easy: 'text-green-400 bg-green-400/10',
  Medium: 'text-yellow-400 bg-yellow-400/10',
  Hard: 'text-orange-400 bg-orange-400/10',
  beginner: 'text-green-400 bg-green-400/10',
  intermediate: 'text-yellow-400 bg-yellow-400/10',
  advanced: 'text-orange-400 bg-orange-400/10',
  pro: 'text-red-400 bg-red-400/10'
};

export default function CompanyPrep() {
  const [companies, setCompanies] = useState([]);   // [{ name, questionCount }]
  const [allQuestions, setAllQuestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/merged_problems.json')
      .then(r => r.json())
      .then(data => {
        const raw = data.questions || [];

        // Build question list with JSON-based ids
        const transformed = raw.map((q, i) => ({
          _id: q.id != null ? String(q.id) : `question-${i}`,
          title: q.title,
          difficulty: q.difficulty,
          topics: q.topics || [],
          companies: q.companies || q.company || []
        }));
        setAllQuestions(transformed);

        // Aggregate unique companies
        const map = {};
        transformed.forEach(q => {
          q.companies.forEach(c => {
            if (!c) return;
            map[c] = (map[c] || 0) + 1;
          });
        });
        const list = Object.entries(map)
          .map(([name, questionCount]) => ({ name, questionCount }))
          .sort((a, b) => b.questionCount - a.questionCount);
        setCompanies(list);
      })
      .catch(err => console.error('Failed to load questions:', err))
      .finally(() => setLoading(false));
  }, []);

  const selectCompany = (company) => {
    setSelected(company);
    const qs = allQuestions.filter(q => q.companies.includes(company.name));
    setQuestions(qs);
  };

  const openInEditor = (q, index) => {
    navigate(`/coding-editor/${q._id}`, {
      state: {
        fromCompanyPrep: true,
        company: selected?.name,
        difficulty: 'all',
        category: 'all',
        questionIndex: index,
        totalQuestions: questions.length,
        filteredQuestions: questions.map(q => ({ _id: q._id, title: q.title }))
      }
    });
  };

  const filtered = companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-3 mb-8">
        <Building2 className="w-7 h-7 text-purple-400" />
        <h1 className="text-2xl font-bold text-white">Company Prep</h1>
      </div>

      {!selected ? (
        <>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search companies..."
              className="w-full bg-gray-800 border border-gray-700 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              No company data found. Make sure questions have company tags.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((c, i) => (
                <button key={c.name} onClick={() => selectCompany(c)}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-5 text-left hover:border-purple-500/50 hover:scale-105 transition-all">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${companyColors[i % companyColors.length]} flex items-center justify-center mb-3`}>
                    <span className="text-white font-bold text-lg">{c.name[0]?.toUpperCase()}</span>
                  </div>
                  <p className="text-white font-medium text-sm">{c.name}</p>
                  <p className="text-gray-500 text-xs mt-1">{c.questionCount} questions</p>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <button onClick={() => setSelected(null)}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-6">
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span>All Companies</span>
          </button>

          <div className="flex items-center space-x-4 mb-6">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${companyColors[0]} flex items-center justify-center`}>
              <span className="text-white font-bold text-xl">{selected.name[0]?.toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{selected.name}</h2>
              <p className="text-gray-400 text-sm">{questions.length} questions</p>
            </div>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No questions found for this company.</div>
          ) : (
            <div className="space-y-3">
              {questions.map((q, i) => (
                <button key={q._id} onClick={() => openInEditor(q, i)}
                  className="w-full flex items-center justify-between bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-purple-500/50 transition-all text-left">
                  <div className="flex items-center space-x-3">
                    <Code className="w-5 h-5 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-white font-medium">{q.title}</p>
                      {q.topics?.length > 0 && (
                        <p className="text-gray-500 text-xs mt-0.5">{q.topics.slice(0, 3).join(' · ')}</p>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full shrink-0 ml-4 ${difficultyColor[q.difficulty] || 'text-gray-400 bg-gray-400/10'}`}>
                    {q.difficulty}
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
