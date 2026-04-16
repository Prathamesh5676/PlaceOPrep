import { useState, useEffect } from 'react';
import api from '../services/api';
import { CalendarClock, Plus, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const statusIcon = {
  upcoming: <Clock className="w-4 h-4 text-blue-400" />,
  completed: <CheckCircle className="w-4 h-4 text-green-400" />,
  cancelled: <X className="w-4 h-4 text-gray-400" />,
  missed: <AlertCircle className="w-4 h-4 text-red-400" />
};

const statusColor = {
  upcoming: 'border-blue-500/30 bg-blue-500/5',
  completed: 'border-green-500/30 bg-green-500/5',
  cancelled: 'border-gray-600 opacity-60',
  missed: 'border-red-500/30 bg-red-500/5'
};

export default function Scheduler() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('upcoming');
  const [form, setForm] = useState({ type: 'technical', difficulty: 'intermediate', scheduledAt: '', title: '', notes: '' });

  useEffect(() => { fetchSchedules(); }, [filter]);

  const fetchSchedules = async () => {
    try {
      const { data } = await api.get(`/schedule?status=${filter}`);
      setInterviews(data.interviews);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const schedule = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/schedule', form);
      setInterviews(prev => [data.interview, ...prev]);
      setShowForm(false);
      setForm({ type: 'technical', difficulty: 'intermediate', scheduledAt: '', title: '', notes: '' });
    } catch (err) { alert(err.response?.data?.message || 'Error scheduling interview'); }
  };

  const cancel = async (id) => {
    try {
      await api.delete(`/schedule/${id}`);
      setInterviews(prev => prev.map(i => i._id === id ? { ...i, status: 'cancelled' } : i));
    } catch (err) { console.error(err); }
  };

  const minDateTime = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <CalendarClock className="w-7 h-7 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Interview Scheduler</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /><span>Schedule</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={schedule} className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Schedule New Interview</h3>
            <button type="button" onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Interview Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                {['technical', 'hr', 'aptitude', 'general', 'full_simulation'].map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Difficulty</label>
              <select value={form.difficulty} onChange={e => setForm(p => ({ ...p, difficulty: e.target.value }))}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                {['beginner', 'intermediate', 'advanced', 'pro'].map(d => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Date & Time</label>
              <input type="datetime-local" value={form.scheduledAt} min={minDateTime}
                onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value }))}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Title (optional)</label>
              <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Google mock round 1"
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-gray-400 text-sm mb-1 block">Notes (optional)</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Any notes for this session..."
              className="w-full bg-gray-700 text-white rounded-lg p-3 text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <button type="submit" className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors font-medium">
            Schedule Interview
          </button>
        </form>
      )}

      <div className="flex space-x-2 mb-6">
        {['upcoming', 'completed', 'cancelled', 'missed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${filter === s ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-t-4 border-purple-500"></div></div>
      ) : interviews.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <CalendarClock className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p>No {filter} interviews</p>
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map(iv => (
            <div key={iv._id} className={`border rounded-xl p-4 transition-all ${statusColor[iv.status]}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {statusIcon[iv.status]}
                  <div>
                    <p className="text-white font-medium">{iv.title || `${iv.type} Interview`}</p>
                    <p className="text-gray-400 text-sm">{new Date(iv.scheduledAt).toLocaleString()} · {iv.difficulty}</p>
                    {iv.notes && <p className="text-gray-500 text-xs mt-1">{iv.notes}</p>}
                  </div>
                </div>
                {iv.status === 'upcoming' && (
                  <button onClick={() => cancel(iv._id)} className="text-gray-500 hover:text-red-400 transition-colors p-2">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
