const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const rows = db
    .prepare('SELECT id, extracted_text, medicines_json, created_at, image_data FROM prescriptions WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.userId);
  res.json({ prescriptions: rows });
});

router.post('/', (req, res) => {
  const { imageData, extractedText, medicines } = req.body || {};
  if (!imageData) {
    return res.status(400).json({ error: 'An image is required' });
  }
  const info = db
    .prepare('INSERT INTO prescriptions (user_id, image_data, extracted_text, medicines_json) VALUES (?, ?, ?, ?)')
    .run(req.userId, imageData, extractedText || '', JSON.stringify(medicines || []));

  const saved = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ prescription: saved });
});

router.delete('/:id', (req, res) => {
  const row = db.prepare('SELECT id FROM prescriptions WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!row) return res.status(404).json({ error: 'Prescription not found' });
  db.prepare('DELETE FROM prescriptions WHERE id = ?').run(row.id);
  res.json({ success: true });
});

module.exports = router;
