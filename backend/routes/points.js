const express = require('express');
const db = require('../db');

const router = express.Router();

function getLevel(total) {
  if (total >= 9000) return { level: 10, title: 'Ms. Pac-Man', next: null };
  if (total >= 4000) return { level: 5, title: 'Pac-Man', next: 9000 };
  if (total >= 3000) return { level: 4, title: 'Cherry', next: 4000 };
  if (total >= 2000) return { level: 3, title: 'Power Pellet', next: 3000 };
  if (total >= 1000) return { level: 2, title: 'Blinky', next: 2000 };
  return { level: 1, title: 'Ghost', next: 1000 };
}

function getPointsData() {
  const row = db.prepare('SELECT * FROM points WHERE id=1').get();
  const history = db.prepare('SELECT * FROM point_history ORDER BY id DESC LIMIT 50').all()
    .map(h => ({ date: h.date, action: h.action, points: h.points, total: h.running_total }));
  return { ...row, history };
}

function updateStreak(row) {
  const today = new Date().toISOString().split('T')[0];
  const last = row.last_active;
  let streak = row.streak || 0;
  if (!last) {
    streak = 1;
  } else {
    const diff = Math.round((new Date(today) - new Date(last)) / 86400000);
    if (diff === 1) streak += 1;
    else if (diff > 1) streak = 1;
  }
  db.prepare('UPDATE points SET streak=?, last_active=? WHERE id=1').run(streak, today);
  return streak;
}

router.get('/', (req, res) => {
  const data = getPointsData();
  res.json({ ...data, ...getLevel(data.total) });
});

router.post('/add', (req, res) => {
  const { points, action } = req.body;
  const row = db.prepare('SELECT * FROM points WHERE id=1').get();
  const streak = updateStreak(row);

  let earned = points;
  if (streak > 0 && streak % 7 === 0) earned += 500;

  const newTotal = row.total + earned;
  db.prepare('UPDATE points SET total=? WHERE id=1').run(newTotal);
  db.prepare('INSERT INTO point_history (date,action,points,running_total) VALUES (?,?,?,?)').run(
    new Date().toISOString(), action, earned, newTotal
  );

  const data = getPointsData();
  res.json({ ...data, earned, ...getLevel(newTotal) });
});

module.exports = router;
