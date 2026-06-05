const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

const toEvent = (row) => row ? {
  id: row.id, title: row.title, date: row.date, time: row.time,
  notes: row.notes, createdAt: row.created_at,
  recurrence: row.recurrence, recurrenceEndDate: row.recurrence_end_date,
} : null;

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM events ORDER BY date ASC').all().map(toEvent));
});

router.post('/', (req, res) => {
  const id = uuidv4();
  const { title, date, time = '', notes = '', recurrence = 'none', recurrenceEndDate = null } = req.body;
  db.prepare(`INSERT INTO events (id,title,date,time,notes,created_at,recurrence,recurrence_end_date)
    VALUES (?,?,?,?,?,?,?,?)`).run(id, title, date, time, notes, new Date().toISOString(), recurrence, recurrenceEndDate);
  res.status(201).json(toEvent(db.prepare('SELECT * FROM events WHERE id=?').get(id)));
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM events WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
