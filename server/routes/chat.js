const express = require('express');
const axios = require('axios');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const GROQ_KEY = process.env.GROQ_KEY || '';
const OPENAI_KEY = process.env.OPENAI_KEY || '';

const EMERGENCY_KEYWORDS = [
  'chest pain', "can't breathe", 'cannot breathe', 'severe bleeding', 'suicidal',
  'suicide', 'unconscious', 'stroke', 'heart attack', 'severe allergic', 'overdose',
  'not breathing', 'seizure'
];

const SYSTEM_PROMPT = `You are Vera, a friendly and careful AI health assistant inside a healthcare app.
Rules you must always follow:
- You are an assistive tool, NOT a doctor. Never present anything as a confirmed diagnosis.
- Keep answers clear, warm, and concise (short paragraphs or bullet points).
- If symptoms sound urgent or life-threatening, tell the user clearly to seek emergency care immediately and mention this app's SOS feature.
- Never invent specific drug dosages beyond well-known general guidance, and always recommend confirming with a doctor or pharmacist.
- Always end substantive health answers with a short reminder that this is informational, not medical advice.`;

function isEmergency(text) {
  const lower = (text || '').toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
}

function mockReply(message) {
  if (isEmergency(message)) {
    return "This sounds like it could be a medical emergency. Please call your local emergency number right now or use the SOS button in this app. Don't wait — I can't assess emergencies safely over chat.\n\nThis is not medical advice.";
  }
  return `I'm currently running in offline demo mode (no AI provider configured), so here's general guidance:\n\n• Rest and stay hydrated.\n• Monitor your symptoms over the next 24 hours.\n• If symptoms worsen, are severe, or you're unsure, contact a doctor.\n\nFor a real medical assessment, please consult a licensed healthcare professional.\n\nThis is not medical advice.`;
}

async function callGroq(messages) {
  if (!GROQ_KEY) throw new Error('Groq key not configured');
  const res = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    { model: 'llama-3.1-8b-instant', messages },
    { headers: { Authorization: `Bearer ${GROQ_KEY}` }, timeout: 20000 }
  );
  return res.data.choices[0].message.content;
}

async function callOpenAI(messages) {
  if (!OPENAI_KEY) throw new Error('OpenAI key not configured');
  const res = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    { model: 'gpt-4o-mini', messages, max_tokens: 600 },
    { headers: { Authorization: `Bearer ${OPENAI_KEY}` }, timeout: 20000 }
  );
  return res.data.choices[0].message.content;
}

router.get('/', (req, res) => {
  const history = db
    .prepare('SELECT * FROM chat_messages WHERE user_id = ? ORDER BY created_at ASC LIMIT 100')
    .all(req.userId);
  res.json({ messages: history });
});

router.post('/', async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    db.prepare('INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)').run(
      req.userId, 'user', message.trim()
    );

    const recent = db
      .prepare('SELECT role, content FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 10')
      .all(req.userId)
      .reverse();

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...recent.map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
    ];

    let reply;
    let source = 'ai';
    try {
      reply = await callGroq(messages);
    } catch (e1) {
      try {
        reply = await callOpenAI(messages);
      } catch (e2) {
        reply = mockReply(message);
        source = 'demo';
      }
    }

    db.prepare('INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)').run(
      req.userId, 'assistant', reply
    );

    res.json({ reply, source, emergency: isEmergency(message) });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'The assistant is temporarily unavailable. Please try again.' });
  }
});

router.delete('/', (req, res) => {
  db.prepare('DELETE FROM chat_messages WHERE user_id = ?').run(req.userId);
  res.json({ success: true });
});

module.exports = router;
