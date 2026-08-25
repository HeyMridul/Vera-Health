import { useEffect, useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import AppShell from '../components/AppShell';
import api, { getErrorMessage } from '../lib/api';

const CATEGORIES = ['general', 'hydration', 'medication', 'activity', 'sleep', 'appointment'];

export default function Wellness() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/tasks')
      .then((res) => setTasks(res.data.tasks))
      .catch(() => setError('Could not load your wellness tasks.'))
      .finally(() => setLoading(false));
  }, []);

  const completedCount = tasks.filter((t) => t.completed).length;
  const score = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  async function handleAdd(e) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const res = await api.post('/tasks', { title, category });
      setTasks((prev) => [res.data.task, ...prev]);
      setTitle('');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function toggleTask(task) {
    const optimistic = { ...task, completed: task.completed ? 0 : 1 };
    setTasks((prev) => prev.map((t) => (t.id === task.id ? optimistic : t)));
    try {
      await api.patch(`/tasks/${task.id}`, { completed: !task.completed });
    } catch (err) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      setError(getErrorMessage(err));
    }
  }

  async function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await api.delete(`/tasks/${id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-5 md:px-8 py-8">
        <h1 className="font-display text-2xl font-semibold mb-1">Wellness Tasks</h1>
        <p className="text-sm text-slate mb-6">Small daily health habits, tracked in one place.</p>

        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink-soft">Today's completion</span>
            <span className="font-mono-data font-semibold text-teal-700">{score}%</span>
          </div>
          <div className="h-2 rounded-full bg-paper-dim overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${score}%` }} />
          </div>
        </div>

        {error && <div className="bg-coral-100 text-coral-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2 mb-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Drink 8 glasses of water"
            className="flex-1 border border-line rounded-lg px-3 py-2.5 text-sm focus:border-teal-500 outline-none"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-line rounded-lg px-3 py-2.5 text-sm focus:border-teal-500 outline-none bg-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-teal-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus size={16} /> Add
          </button>
        </form>

        {loading && <p className="text-sm text-slate">Loading…</p>}
        {!loading && tasks.length === 0 && (
          <div className="card p-8 text-center text-sm text-slate">No tasks yet — add your first one above.</div>
        )}

        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="card p-3.5 flex items-center gap-3">
              <button
                onClick={() => toggleTask(task)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  task.completed ? 'bg-teal-600 border-teal-600 text-white' : 'border-line text-transparent'
                }`}
                aria-label={task.completed ? 'Mark as not done' : 'Mark as done'}
              >
                <Check size={14} />
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${task.completed ? 'line-through text-slate-light' : 'text-ink-soft'}`}>
                  {task.title}
                </p>
                <span className="text-xs text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">{task.category}</span>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-slate-light hover:text-coral-600"
                aria-label="Delete task"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
