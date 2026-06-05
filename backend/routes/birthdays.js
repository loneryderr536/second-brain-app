const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

const toBday = (row) => row ? {
  id: row.id, name: row.name, date: row.date,
  year: row.birth_year, lastWished: row.last_wished,
} : null;

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM birthdays ORDER BY name ASC').all().map(toBday));
});

router.post('/', (req, res) => {
  const id = uuidv4();
  const { name, date, year = null } = req.body;
  db.prepare('INSERT INTO birthdays (id,name,date,birth_year) VALUES (?,?,?,?)').run(id, name, date, year);
  res.status(201).json(toBday(db.prepare('SELECT * FROM birthdays WHERE id=?').get(id)));
});

router.put('/:id/wish', (req, res) => {
  const year = String(new Date().getFullYear());
  db.prepare('UPDATE birthdays SET last_wished=? WHERE id=?').run(year, req.params.id);
  res.json(toBday(db.prepare('SELECT * FROM birthdays WHERE id=?').get(req.params.id)));
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM birthdays WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
