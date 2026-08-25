import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, MessageCircleHeart, ScanLine, ListChecks, Siren, LogOut } from 'lucide-react';
import PulseMark from './PulseMark';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/assistant', label: 'AI Assistant', icon: MessageCircleHeart },
  { to: '/prescriptions', label: 'Prescriptions', icon: ScanLine },
  { to: '/wellness', label: 'Wellness', icon: ListChecks },
  { to: '/sos', label: 'SOS', icon: Siren, danger: true }
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 border-r border-line bg-white px-5 py-6 shrink-0">
        <div className="flex items-center gap-2 px-2 mb-8">
          <PulseMark className="w-9 h-4 text-teal-600" />
          <span className="font-display text-lg font-semibold text-ink">Vera Health</span>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, danger }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? danger
                      ? 'bg-coral-100 text-coral-600'
                      : 'bg-teal-100 text-teal-700'
                    : danger
                    ? 'text-coral-600 hover:bg-coral-100'
                    : 'text-slate hover:bg-paper-dim hover:text-ink'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="pt-4 border-t border-line">
          <p className="px-2 text-sm font-medium text-ink truncate">{user?.name}</p>
          <p className="px-2 text-xs text-slate truncate mb-3">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate hover:bg-paper-dim hover:text-ink w-full"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-line bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <PulseMark className="w-8 h-4 text-teal-600" />
            <span className="font-display font-semibold">Vera Health</span>
          </div>
          <button onClick={handleLogout} aria-label="Log out" className="text-slate p-1">
            <LogOut size={18} />
          </button>
        </header>

        <main className="flex-1 pb-20 md:pb-0">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-line flex justify-around py-2 z-20">
          {NAV_ITEMS.map(({ to, label, icon: Icon, danger }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium rounded-lg ${
                  isActive
                    ? danger
                      ? 'text-coral-600'
                      : 'text-teal-700'
                    : danger
                    ? 'text-coral-500'
                    : 'text-slate'
                }`
              }
            >
              <Icon size={danger ? 24 : 20} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
