const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/summary', (req, res) => {
  const userId = req.userId;

  const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ?').all(userId);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const adherence = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : null;

  const prescriptionCount = db
    .prepare('SELECT COUNT(*) as c FROM prescriptions WHERE user_id = ?')
    .get(userId).c;

  const contactCount = db
    .prepare('SELECT COUNT(*) as c FROM sos_contacts WHERE user_id = ?')
    .get(userId).c;

  const lastChat = db
    .prepare("SELECT content, created_at FROM chat_messages WHERE user_id = ? AND role = 'user' ORDER BY created_at DESC LIMIT 1")
    .get(userId);

  const attention = [];
  if (totalTasks > 0 && adherence !== null && adherence < 50) {
    attention.push({ type: 'wellness', text: 'Your wellness task completion is below 50% this period.' });
  }
  if (prescriptionCount === 0) {
    attention.push({ type: 'prescription', text: 'No prescriptions saved yet — upload one to get organized reminders.' });
  }
  if (contactCount === 0) {
    attention.push({ type: 'sos', text: 'You have no emergency contacts set up yet.' });
  }
  const todayIncomplete = tasks.filter((t) => !t.completed).length;
  if (todayIncomplete > 0) {
    attention.push({ type: 'task', text: `You have ${todayIncomplete} pending wellness task${todayIncomplete > 1 ? 's' : ''}.` });
  }

  res.json({
    tasks: { total: totalTasks, completed: completedTasks, adherence },
    prescriptionCount,
    contactCount,
    lastChat,
    attention
  });
});

module.exports = router;
