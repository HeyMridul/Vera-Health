const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const tasks = db
    .prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY completed ASC, created_at DESC')
    .all(req.userId);
  res.json({ tasks });
});

router.post('/', (req, res) => {
  const { title, category } = req.body || {};
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Task title is required' });
  }
  const info = db
    .prepare('INSERT INTO tasks (user_id, title, category) VALUES (?, ?, ?)')
    .run(req.userId, title.trim(), category || 'general');
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ task });
});

router.patch('/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const completed = req.body?.completed;
  db.prepare('UPDATE tasks SET completed = ? WHERE id = ?').run(completed ? 1 : 0, task.id);
  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(task.id);
  res.json({ task: updated });
});

router.delete('/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  db.prepare('DELETE FROM tasks WHERE id = ?').run(task.id);
  res.json({ success: true });
});

module.exports = router;
