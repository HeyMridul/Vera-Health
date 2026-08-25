import { Link } from 'react-router-dom';
import { MessageCircleHeart, ScanLine, Siren, ListChecks, ShieldCheck } from 'lucide-react';
import PulseMark from '../components/PulseMark';

const FEATURES = [
  {
    icon: MessageCircleHeart,
    title: 'AI Health Assistant',
    body: 'Ask about symptoms, medications, or preventive care and get clear, careful answers — with emergency situations flagged immediately.'
  },
  {
    icon: ScanLine,
    title: 'Prescription Analyzer',
    body: 'Snap a photo of a prescription. On-device OCR pulls out the text so you can save and revisit it any time.'
  },
  {
    icon: ListChecks,
    title: 'Wellness Tracking',
    body: 'Simple daily health tasks with a real completion score, so your dashboard reflects how you\u2019re actually doing.'
  },
  {
    icon: Siren,
    title: 'Emergency SOS',
    body: 'One tap surfaces your emergency contacts with real call links — with a confirmation step so it\u2019s never triggered by accident.'
  }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="flex items-center justify-between max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center gap-2">
          <PulseMark className="w-10 h-5 text-teal-600" />
          <span className="font-display text-xl font-semibold">Vera Health</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-ink-soft hover:text-teal-700 px-3 py-2">
            Log in
          </Link>
          <Link
            to="/signup"
            className="text-sm font-medium bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Get started
          </Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-10 pb-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-block text-xs font-semibold tracking-wide uppercase text-teal-700 bg-teal-100 px-3 py-1 rounded-full mb-6">
            HealthTech · SDG 3 &middot; 5 &middot; 10
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight mb-5">
            One calm place to keep track of your health.
          </h1>
          <p className="text-slate text-lg leading-relaxed mb-8 max-w-lg">
            An AI assistant, prescription memory, wellness tracking, and emergency access —
            connected to one account, not scattered across screens.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/signup"
              className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              Create your account
            </Link>
            <Link
              to="/login"
              className="border border-line px-6 py-3 rounded-lg font-medium hover:border-teal-500 transition-colors"
            >
              I already have one
            </Link>
          </div>
          <p className="text-xs text-slate-light mt-6 max-w-md">
            Vera Health is an informational assistive tool and does not replace professional
            medical advice, diagnosis, or treatment.
          </p>
        </div>

        <div className="card p-8 relative overflow-hidden">
          <PulseMark className="w-full h-16 text-teal-500" animate />
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate">Wellness score</span>
              <span className="font-mono-data font-semibold text-teal-700">82%</span>
            </div>
            <div className="h-2 rounded-full bg-paper-dim overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full" style={{ width: '82%' }} />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="bg-teal-50 rounded-xl p-4">
                <p className="text-xs text-teal-700 font-medium mb-1">Medications tracked</p>
                <p className="font-mono-data text-2xl font-semibold text-teal-900">3</p>
              </div>
              <div className="bg-amber-100 rounded-xl p-4">
                <p className="text-xs text-amber-600 font-medium mb-1">Needs attention</p>
                <p className="font-mono-data text-2xl font-semibold text-ink">1</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="font-display text-2xl font-semibold mb-8">What you get in one account</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="card p-6">
              <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                <Icon size={20} />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-slate leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="card p-8 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
          <div className="flex items-start gap-4">
            <ShieldCheck className="text-teal-600 shrink-0 mt-1" size={28} />
            <div>
              <h3 className="font-semibold mb-1">Privacy-first by design</h3>
              <p className="text-sm text-slate max-w-md">
                Your data is tied to your account, not shared across users, and every AI response
                is clearly labeled as informational — never a diagnosis.
              </p>
            </div>
          </div>
          <Link
            to="/signup"
            className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors whitespace-nowrap"
          >
            Get started free
          </Link>
        </div>
      </section>

      <footer className="border-t border-line py-8 text-center text-xs text-slate-light">
        Vera Health &middot; Hackathon demo build &middot; Not a substitute for professional medical care
      </footer>
    </div>
  );
}
