import { useEffect, useState } from 'react';
import { Siren, Phone, Plus, Trash2, X } from 'lucide-react';
import AppShell from '../components/AppShell';
import api, { getErrorMessage } from '../lib/api';

export default function SOS() {
  const [contacts, setContacts] = useState([]);
  const [confirming, setConfirming] = useState(false);
  const [activated, setActivated] = useState(false);
  const [activationMessage, setActivationMessage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: '', relation: '', phone: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/sos/contacts')
      .then((res) => setContacts(res.data.contacts))
      .catch(() => setError('Could not load emergency contacts.'));
  }, []);

  async function handleAddContact(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    try {
      const res = await api.post('/sos/contacts', form);
      setContacts((prev) => [...prev, res.data.contact]);
      setForm({ name: '', relation: '', phone: '' });
      setShowAddForm(false);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleDeleteContact(id) {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    try {
      await api.delete(`/sos/contacts/${id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleActivate() {
    setConfirming(false);
    try {
      const res = await api.post('/sos/trigger');
      setActivated(true);
      setActivationMessage(res.data.message);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-5 md:px-8 py-8">
        <h1 className="font-display text-2xl font-semibold mb-1">Emergency SOS</h1>
        <p className="text-sm text-slate mb-6">
          For a real emergency, call your local emergency number immediately.
        </p>

        {error && <div className="bg-coral-100 text-coral-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

        {!activated ? (
          <div className="card p-8 text-center mb-8 border-coral-500/30">
            <div className="w-16 h-16 rounded-full bg-coral-100 text-coral-600 flex items-center justify-center mx-auto mb-4">
              <Siren size={28} />
            </div>
            <h2 className="font-semibold text-lg mb-2">Activate emergency mode</h2>
            <p className="text-sm text-slate mb-5 max-w-sm mx-auto">
              This surfaces your emergency contacts for quick calling. It requires confirmation so it's never triggered by accident.
            </p>
            <button
              onClick={() => setConfirming(true)}
              className="bg-coral-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-coral-600 transition-colors"
            >
              Activate SOS
            </button>
          </div>
        ) : (
          <div className="card p-6 mb-8 border-coral-500/30">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2 text-coral-600 font-semibold">
                <Siren size={20} /> Emergency mode active
              </div>
              <button onClick={() => setActivated(false)} className="text-slate hover:text-ink" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-ink-soft mb-5">{activationMessage}</p>

            <div className="space-y-2">
              {contacts.length === 0 && (
                <p className="text-sm text-slate">No emergency contacts saved. Add one below.</p>
              )}
              {contacts.map((c) => (
                <a
                  key={c.id}
                  href={`tel:${c.phone}`}
                  className="flex items-center gap-3 bg-coral-100 rounded-lg px-4 py-3 hover:bg-coral-100/80 transition-colors"
                >
                  <Phone size={18} className="text-coral-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink">{c.name}</p>
                    <p className="text-xs text-slate">{c.relation || 'Contact'} &middot; {c.phone}</p>
                  </div>
                  <span className="text-xs font-semibold text-coral-600">Call</span>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Emergency contacts</h2>
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="text-sm font-medium text-teal-700 flex items-center gap-1 hover:underline"
          >
            <Plus size={15} /> Add contact
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddContact} className="card p-4 mb-4 space-y-3">
            <div className="grid sm:grid-cols-3 gap-2">
              <input
                required
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border border-line rounded-lg px-3 py-2 text-sm focus:border-teal-500 outline-none"
              />
              <input
                placeholder="Relation (e.g. Parent)"
                value={form.relation}
                onChange={(e) => setForm({ ...form, relation: e.target.value })}
                className="border border-line rounded-lg px-3 py-2 text-sm focus:border-teal-500 outline-none"
              />
              <input
                required
                placeholder="Phone number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="border border-line rounded-lg px-3 py-2 text-sm focus:border-teal-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-teal-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Save contact
            </button>
          </form>
        )}

        <div className="space-y-2">
          {contacts.map((c) => (
            <div key={c.id} className="card p-3.5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{c.name}</p>
                <p className="text-xs text-slate">{c.relation || 'Contact'} &middot; {c.phone}</p>
              </div>
              <a href={`tel:${c.phone}`} className="text-teal-700 hover:text-teal-800" aria-label={`Call ${c.name}`}>
                <Phone size={16} />
              </a>
              <button
                onClick={() => handleDeleteContact(c.id)}
                className="text-slate-light hover:text-coral-600"
                aria-label={`Remove ${c.name}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {confirming && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <Siren className="text-coral-600 mx-auto mb-3" size={32} />
            <h3 className="font-semibold text-lg mb-2">Activate emergency mode?</h3>
            <p className="text-sm text-slate mb-6">
              This is a simulated demo action — no real SMS or call is sent automatically. Use the call buttons for real contact.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 border border-line rounded-lg py-2.5 text-sm font-medium hover:bg-paper-dim transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleActivate}
                className="flex-1 bg-coral-500 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-coral-600 transition-colors"
              >
                Yes, activate
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
