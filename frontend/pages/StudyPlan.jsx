import { useState, useEffect } from 'react';
import api from '../services/api';
import { Map, CheckCircle, Circle, Target, X, Lock, CalendarClock, Trophy } from 'lucide-react';

const planInfo = {
  '7day':  { label: '7-Day Sprint',    desc: 'Quick intensive preparation before an interview',         color: 'from-blue-600 to-cyan-600' },
  '14day': { label: '14-Day Prep',     desc: 'Balanced preparation covering all topics systematically', color: 'from-purple-600 to-blue-600' },
  '30day': { label: '30-Day Complete', desc: 'Thorough preparation from basics to advanced',            color: 'from-pink-600 to-purple-600' }
};

const typeColor = {
  coding:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
  aptitude:  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  hr:        'bg-green-500/10 text-green-400 border-green-500/20',
  technical: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  general:   'bg-gray-500/10 text-gray-400 border-gray-500/20'
};

export default function StudyPlan() {
  const [plan, setPlan] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [completing, setCompleting] = useState(null);

  useEffect(() => {
    fetchPlan();

    // Refresh today's tasks at midnight so the new day's tasks appear automatically
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight - now;
    const timer = setTimeout(() => fetchTodayTasks(), msUntilMidnight);
    return () => clearTimeout(timer);
  }, []);

  const fetchPlan = async () => {
    try {
      const [planRes, todayRes] = await Promise.all([
        api.get('/study-plans/active'),
        api.get('/study-plans/today')
      ]);
      setPlan(planRes.data.plan);
      setTodayTasks(todayRes.data.tasks || []);
      setCurrentDay(todayRes.data.currentDay || 1);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchTodayTasks = async () => {
    try {
      const res = await api.get('/study-plans/today');
      setTodayTasks(res.data.tasks || []);
      setCurrentDay(res.data.currentDay || 1);
    } catch (err) { /* silent */ }
  };

  const startPlan = async (planType) => {
    setCreating(true);
    try {
      const { data } = await api.post('/study-plans', { planType });
      setPlan(data.plan);
      const todayRes = await api.get('/study-plans/today');
      setTodayTasks(todayRes.data.tasks || []);
      setCurrentDay(todayRes.data.currentDay || 1);
    } catch (err) { console.error(err); }
    finally { setCreating(false); }
  };

  const completeTask = async (task) => {
    setCompleting(task.title);
    try {
      const { data } = await api.post('/study-plans/complete-task', {
        taskDay: task.day,
        taskTitle: task.title
      });
      setPlan(data.plan);
      // Mark the task done in local state — no re-fetch needed
      setTodayTasks(prev =>
        prev.map(t => t.title === task.title && t.day === task.day ? { ...t, completed: true } : t)
      );
    } catch (err) { console.error(err); }
    finally { setCompleting(null); }
  };

  const cancelPlan = async () => {
    if (!confirm('Cancel your current study plan?')) return;
    try {
      await api.delete('/study-plans/cancel');
      setPlan(null);
      setTodayTasks([]);
    } catch (err) { console.error(err); }
  };

  // Sliding window within today's tasks:
  // The first uncompleted task is the active one (has Mark Done).
  // Everything after it is shown but locked/dimmed.
  // Completed tasks are hidden — the window slides forward as you complete each one.
  const firstUncompleted = todayTasks.findIndex(t => !t.completed);
  const allTodayDone = todayTasks.length > 0 && firstUncompleted === -1;

  // Visible = from firstUncompleted onward (up to 4). Completed tasks are removed from view.
  const windowTasks = firstUncompleted === -1
    ? []
    : todayTasks.slice(firstUncompleted);          // all remaining of today

  const planTotalDays = plan
    ? Math.max(...plan.tasks.map(t => t.day))
    : 0;

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-500" />
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 mb-8">
        <Map className="w-7 h-7 text-purple-400" />
        <h1 className="text-2xl font-bold text-white">Study Plan</h1>
      </div>

      {!plan ? (
        /* ── Plan picker ── */
        <div>
          <p className="text-gray-400 mb-8">
            Choose a study plan to start your structured interview preparation journey.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(planInfo).map(([key, info]) => (
              <div key={key} className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all">
                <div className={`bg-gradient-to-r ${info.color} p-5`}>
                  <h3 className="text-xl font-bold text-white">{info.label}</h3>
                </div>
                <div className="p-5">
                  <p className="text-gray-400 text-sm mb-6">{info.desc}</p>
                  <button
                    onClick={() => startPlan(key)}
                    disabled={creating}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2 rounded-lg transition-colors font-medium"
                  >
                    {creating ? 'Starting…' : 'Start Plan'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">

          {/* ── Progress bar ── */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{planInfo[plan.planType]?.label}</h2>
                <p className="text-gray-400 text-sm">
                  Day {currentDay} of {planTotalDays} · Started {new Date(plan.startDate).toLocaleDateString()}
                </p>
              </div>
              <button onClick={cancelPlan} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${plan.tasks.length > 0 ? (plan.completedTasks / plan.tasks.length) * 100 : 0}%` }}
                />
              </div>
              <span className="text-gray-400 text-sm shrink-0">
                {plan.completedTasks}/{plan.tasks.length}
              </span>
            </div>
          </div>

          {/* ── Today's tasks (sliding window) ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <CalendarClock className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">
                  Day {currentDay} Tasks
                </h3>
              </div>
              <span className="text-xs text-gray-500">
                {todayTasks.filter(t => t.completed).length}/{todayTasks.length} done today
              </span>
            </div>

            {todayTasks.length === 0 ? (
              <div className="text-center py-10 text-gray-500 bg-gray-800/50 rounded-2xl border border-gray-700">
                No tasks scheduled for today.
              </div>
            ) : allTodayDone ? (
              /* All today's tasks done */
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
                <Trophy className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-green-400 text-xl font-bold">Day {currentDay} Complete!</p>
                <p className="text-green-600 text-sm mt-1">
                  Come back tomorrow for Day {currentDay + 1}'s tasks.
                </p>
                <div className="flex items-center justify-center space-x-2 mt-4 text-gray-500 text-xs">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Next tasks unlock at midnight</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {windowTasks.map((task, i) => {
                  const isActive = i === 0; // only the first uncompleted task is actionable
                  const isCompleting = completing === task.title;

                  return (
                    <div
                      key={`${task.day}-${task.title}`}
                      className={`flex items-center justify-between rounded-xl p-4 border transition-all duration-300 ${
                        isActive
                          ? 'bg-gray-800 border-purple-500/60 shadow-md shadow-purple-500/10'
                          : 'bg-gray-800/40 border-gray-700/40 opacity-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {isActive
                          ? <Circle className="w-5 h-5 text-purple-400 shrink-0" />
                          : <Lock className="w-4 h-4 text-gray-600 shrink-0" />
                        }
                        <div>
                          <div className="flex items-center space-x-2 mb-0.5">
                            <p className={`font-medium text-sm ${isActive ? 'text-white' : 'text-gray-500'}`}>
                              {task.title}
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColor[task.type] || typeColor.general}`}>
                              {task.type}
                            </span>
                          </div>
                          <p className="text-gray-500 text-xs">{task.description}</p>
                        </div>
                      </div>

                      {isActive && (
                        <button
                          onClick={() => completeTask(task)}
                          disabled={!!completing}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shrink-0 ml-4"
                        >
                          {isCompleting ? '…' : 'Mark Done'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── All tasks reference ── */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-white">All Tasks</h3>
            </div>
            <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
              {plan.tasks.map((task, i) => (
                <div key={i} className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm ${task.completed ? 'opacity-40' : ''}`}>
                  {task.completed
                    ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    : <Circle className="w-4 h-4 text-gray-600 shrink-0" />}
                  <span className="text-gray-600 text-xs w-10 shrink-0">Day {task.day}</span>
                  <span className={task.completed ? 'text-gray-600 line-through' : 'text-gray-300'}>
                    {task.title}
                  </span>
                  {!task.completed && (
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${typeColor[task.type] || typeColor.general}`}>
                      {task.type}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
