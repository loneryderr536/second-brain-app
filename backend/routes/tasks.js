const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

const toTask = (row) => row ? {
  id: row.id, title: row.title, priority: row.priority,
  dueDate: row.due_date, completed: row.completed === 1,
  completedAt: row.completed_at, createdAt: row.created_at,
  recurrence: row.recurrence, recurrenceEndDate: row.recurrence_end_date,
} : null;

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all().map(toTask));
});

router.post('/', (req, res) => {
  const id = uuidv4();
  const { title, priority = 'medium', dueDate = null, recurrence = 'none', recurrenceEndDate = null } = req.body;
  db.prepare(`INSERT INTO tasks (id,title,priority,due_date,completed,created_at,recurrence,recurrence_end_date)
    VALUES (?,?,?,?,0,?,?,?)`).run(id, title, priority, dueDate, new Date().toISOString(), recurrence, recurrenceEndDate);
  res.status(201).json(toTask(db.prepare('SELECT * FROM tasks WHERE id=?').get(id)));
});

router.put('/:id', (req, res) => {
  const { completed, title, priority, dueDate } = req.body;
  const task = db.prepare('SELECT * FROM tasks WHERE id=?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Not found' });
  db.prepare(`UPDATE tasks SET
    completed=COALESCE(?,completed), completed_at=COALESCE(?,completed_at),
    title=COALESCE(?,title), priority=COALESCE(?,priority), due_date=COALESCE(?,due_date)
    WHERE id=?`).run(
    completed !== undefined ? (completed ? 1 : 0) : null,
    completed ? new Date().toISOString() : null,
    title ?? null, priority ?? null, dueDate ?? null,
    req.params.id
  );
  res.json(toTask(db.prepare('SELECT * FROM tasks WHERE id=?').get(req.params.id)));
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM tasks WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
