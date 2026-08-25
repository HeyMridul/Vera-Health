import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PulseMark from '../components/PulseMark';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../lib/api';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <PulseMark className="w-10 h-5 text-teal-600" />
          <span className="font-display text-xl font-semibold">Vera Health</span>
        </Link>

        <div className="card p-7">
          <h1 className="font-display text-2xl font-semibold mb-1">Create your account</h1>
          <p className="text-sm text-slate mb-6">Takes less than a minute.</p>

          {error && (
            <div className="bg-coral-100 text-coral-600 text-sm rounded-lg px-3 py-2 mb-4" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-ink-soft mb-1.5">
                Full name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-line rounded-lg px-3 py-2.5 text-sm focus:border-teal-500 outline-none"
                placeholder="Jordan Rivera"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-soft mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-line rounded-lg px-3 py-2.5 text-sm focus:border-teal-500 outline-none"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink-soft mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-line rounded-lg px-3 py-2.5 text-sm focus:border-teal-500 outline-none"
                placeholder="At least 6 characters"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white rounded-lg py-2.5 font-medium hover:bg-teal-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-700 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
