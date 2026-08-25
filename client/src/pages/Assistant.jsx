import { useEffect, useRef, useState } from 'react';
import { Send, Trash2, Siren, Mic, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import PulseMark from '../components/PulseMark';
import api, { getErrorMessage } from '../lib/api';

const SpeechRecognitionAPI =
  typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
const speechSupported = Boolean(SpeechRecognitionAPI);
const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

const SUGGESTIONS = [
  'What should I do if I have a fever?',
  'I\u2019ve been sleeping poorly lately.',
  'What preventive checkups should I consider?',
  'Explain what paracetamol is used for.'
];

export default function Assistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState('');
  const [showEmergencyBanner, setShowEmergencyBanner] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  function speak(text) {
    if (!ttsSupported || !voiceOn) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }

  function toggleListening() {
    if (!speechSupported) return;

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      sendMessage(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setError('Couldn\u2019t access the microphone. Check your browser permissions.');
    };

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  useEffect(() => {
    api
      .get('/chat')
      .then((res) => setMessages(res.data.messages))
      .catch(() => setError('Could not load conversation history.'))
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  async function sendMessage(text) {
    const trimmed = (text ?? input).trim();
    if (!trimmed || sending) return;

    setError('');
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: trimmed, created_at: new Date().toISOString() }]);
    setSending(true);

    try {
      const res = await api.post('/chat', { message: trimmed });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.reply, created_at: new Date().toISOString() }
      ]);
      setShowEmergencyBanner(Boolean(res.data.emergency));
      speak(res.data.reply);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  async function clearChat() {
    try {
      await api.delete('/chat');
      setMessages([]);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-5 md:px-8 py-8 flex flex-col h-[calc(100vh-56px)] md:h-screen">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-display text-2xl font-semibold">AI Health Assistant</h1>
            <p className="text-sm text-slate">Informational support — not a replacement for a doctor.</p>
          </div>
          <div className="flex items-center gap-1">
            {ttsSupported && (
              <button
                onClick={() => {
                  if (voiceOn) window.speechSynthesis.cancel();
                  setVoiceOn((v) => !v);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  voiceOn ? 'text-teal-700 bg-teal-100' : 'text-slate hover:bg-paper-dim'
                }`}
                aria-label={voiceOn ? 'Turn off spoken replies' : 'Turn on spoken replies'}
                title={voiceOn ? 'Spoken replies on' : 'Spoken replies off'}
              >
                {voiceOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            )}
            <button
              onClick={clearChat}
              className="text-slate hover:text-coral-600 p-2 rounded-lg hover:bg-coral-100 transition-colors"
              aria-label="Clear conversation"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {showEmergencyBanner && (
          <div className="bg-coral-100 border border-coral-500/30 rounded-lg p-4 mb-4 flex items-center gap-3">
            <Siren className="text-coral-600 shrink-0" size={20} />
            <p className="text-sm text-coral-600 flex-1">
              This may be a medical emergency. Please seek immediate care.
            </p>
            <Link to="/sos" className="text-sm font-semibold text-coral-600 underline whitespace-nowrap">
              Open SOS
            </Link>
          </div>
        )}

        <div className="flex-1 overflow-y-auto card p-4 md:p-6 mb-4 space-y-4">
          {loadingHistory && <p className="text-sm text-slate text-center py-8">Loading conversation…</p>}

          {!loadingHistory && messages.length === 0 && (
            <div className="text-center py-8">
              <PulseMark className="w-16 h-8 text-teal-300 mx-auto mb-3" />
              <p className="text-sm text-slate mb-4">Ask me anything about symptoms, medications, or wellness.</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-xs bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full hover:bg-teal-100 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-teal-600 text-white rounded-br-sm'
                    : 'bg-paper-dim text-ink-soft rounded-bl-sm'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="bg-paper-dim rounded-2xl rounded-bl-sm px-4 py-3">
                <PulseMark className="w-10 h-4 text-teal-500" animate />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {error && <p className="text-sm text-coral-600 mb-2">{error}</p>}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={listening ? 'Listening…' : 'Type a health question…'}
            className="flex-1 border border-line rounded-full px-4 py-2.5 text-sm focus:border-teal-500 outline-none"
          />
          {speechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                listening
                  ? 'bg-coral-500 text-white animate-pulse'
                  : 'bg-paper-dim text-slate hover:bg-teal-100 hover:text-teal-700'
              }`}
              aria-label={listening ? 'Stop recording' : 'Speak your question'}
            >
              <Mic size={16} />
            </button>
          )}
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="bg-teal-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-teal-700 disabled:opacity-50 transition-colors shrink-0"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </AppShell>
  );
}
