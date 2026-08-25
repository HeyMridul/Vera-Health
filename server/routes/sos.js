const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/contacts', (req, res) => {
  const contacts = db.prepare('SELECT * FROM sos_contacts WHERE user_id = ?').all(req.userId);
  res.json({ contacts });
});

router.post('/contacts', (req, res) => {
  const { name, relation, phone } = req.body || {};
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone number are required' });
  }
  const info = db
    .prepare('INSERT INTO sos_contacts (user_id, name, relation, phone) VALUES (?, ?, ?, ?)')
    .run(req.userId, name.trim(), relation || '', phone.trim());
  const contact = db.prepare('SELECT * FROM sos_contacts WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ contact });
});

router.delete('/contacts/:id', (req, res) => {
  const row = db.prepare('SELECT id FROM sos_contacts WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!row) return res.status(404).json({ error: 'Contact not found' });
  db.prepare('DELETE FROM sos_contacts WHERE id = ?').run(row.id);
  res.json({ success: true });
});

// Simulated emergency trigger — this app has no real SMS/calling infra, so we
// log the event and are explicit with the user that nothing was actually sent.
router.post('/trigger', (req, res) => {
  const info = db
    .prepare("INSERT INTO sos_events (user_id, status) VALUES (?, 'simulated')")
    .run(req.userId);
  const event = db.prepare('SELECT * FROM sos_events WHERE id = ?').get(info.lastInsertRowid);
  res.json({
    event,
    message: 'Emergency mode activated (simulated). No real SMS or call was sent — use the call buttons below for real contact.'
  });
});

router.get('/history', (req, res) => {
  const events = db
    .prepare('SELECT * FROM sos_events WHERE user_id = ? ORDER BY created_at DESC LIMIT 20')
    .all(req.userId);
  res.json({ events });
});

module.exports = router;
