import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircleHeart, ScanLine, ListChecks, Siren, AlertTriangle, ArrowRight } from 'lucide-react';
import AppShell from '../components/AppShell';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const QUICK_ACTIONS = [
  { to: '/assistant', label: 'Ask AI Assistant', icon: MessageCircleHeart },
  { to: '/prescriptions', label: 'Analyze Prescription', icon: ScanLine },
  { to: '/wellness', label: 'View Wellness Tasks', icon: ListChecks },
  { to: '/sos', label: 'Emergency SOS', icon: Siren, danger: true }
];

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/dashboard/summary')
      .then((res) => setSummary(res.data))
      .catch(() => setError('Could not load your dashboard right now.'));
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';
  const adherence = summary?.tasks?.adherence;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-8">
        <h1 className="font-display text-3xl font-semibold mb-1">Hi {firstName} 👋</h1>
        <p className="text-slate mb-8">Here's your health overview for today.</p>

        {error && (
          <div className="bg-coral-100 text-coral-600 text-sm rounded-lg px-4 py-3 mb-6">{error}</div>
        )}

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="card p-5">
            <p className="text-xs font-medium text-slate uppercase tracking-wide mb-2">Wellness score</p>
            <p className="font-mono-data text-3xl font-semibold text-teal-700">
              {adherence !== null && adherence !== undefined ? `${adherence}%` : '—'}
            </p>
            <p className="text-xs text-slate mt-1">
              {summary ? `${summary.tasks.completed} of ${summary.tasks.total} tasks done` : 'Loading…'}
            </p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-medium text-slate uppercase tracking-wide mb-2">Prescriptions saved</p>
            <p className="font-mono-data text-3xl font-semibold text-ink">
              {summary ? summary.prescriptionCount : '—'}
            </p>
            <p className="text-xs text-slate mt-1">Analyzed with on-device OCR</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-medium text-slate uppercase tracking-wide mb-2">Emergency contacts</p>
            <p className="font-mono-data text-3xl font-semibold text-ink">
              {summary ? summary.contactCount : '—'}
            </p>
            <p className="text-xs text-slate mt-1">Ready for SOS mode</p>
          </div>
        </div>

        <h2 className="font-semibold text-lg mb-3">Quick actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {QUICK_ACTIONS.map(({ to, label, icon: Icon, danger }) => (
            <Link
              key={to}
              to={to}
              className={`card p-4 flex items-center gap-3 hover:shadow-sm transition-shadow ${
                danger ? 'hover:border-coral-500' : 'hover:border-teal-500'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  danger ? 'bg-coral-100 text-coral-600' : 'bg-teal-100 text-teal-700'
                }`}
              >
                <Icon size={18} />
              </div>
              <span className="text-sm font-medium">{label}</span>
              <ArrowRight size={14} className="ml-auto text-slate-light" />
            </Link>
          ))}
        </div>

        <h2 className="font-semibold text-lg mb-3">What needs your attention?</h2>
        <div className="card divide-y divide-line">
          {summary && summary.attention.length === 0 && (
            <p className="p-5 text-sm text-slate">Nothing needs attention right now — nice work.</p>
          )}
          {summary?.attention.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-4">
              <AlertTriangle size={16} className="text-amber-600 shrink-0" />
              <p className="text-sm text-ink-soft">{item.text}</p>
            </div>
          ))}
          {!summary && !error && <p className="p-5 text-sm text-slate">Loading…</p>}
        </div>

        <p className="text-xs text-slate-light mt-8 text-center">
          Vera Health provides informational support only and does not replace professional medical advice.
        </p>
      </div>
    </AppShell>
  );
}
