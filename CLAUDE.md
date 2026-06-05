# CLAUDE.md — Second Brain App

## Project Overview

A full-stack personal productivity web app with a Pac-Man arcade theme. React frontend + Node.js/Express backend + SQLite database. Runs locally on Mac.

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`
- Database: `backend/second-brain.db` (SQLite)

---

## Project Structure

```
second-brain-app/
├── backend/
│   ├── server.js           ← Express entry point
│   ├── db.js               ← SQLite connection, schema, and JSON migration
│   ├── .env                ← Email credentials (not committed)
│   ├── second-brain.db     ← SQLite database file (auto-created)
│   ├── routes/
│   │   ├── tasks.js        ← CRUD for tasks
│   │   ├── birthdays.js    ← CRUD for birthdays + /wish endpoint
│   │   ├── events.js       ← CRUD for events
│   │   └── points.js       ← Points read + add endpoint + level logic
│   └── services/
│       ├── emailService.js ← Nodemailer functions for birthday/event emails
│       └── cronService.js  ← 3 scheduled jobs (email, recurring reset, birthday reset)
└── frontend/
    ├── src/
    │   ├── App.jsx          ← Root layout, tab navigation, toast
    │   ├── App.css          ← Full Pac-Man theme CSS
    │   ├── index.css        ← Global reset
    │   ├── context/
    │   │   └── AppContext.jsx  ← Global state, all API calls, addPoints logic
    │   └── components/
    │       ├── Dashboard.jsx     ← Home overview: score, today's tasks, upcoming
    │       ├── TaskManager.jsx   ← Task CRUD + filter + recurrence
    │       ├── BirthdayTracker.jsx ← Birthday CRUD + wish button
    │       ├── EventManager.jsx  ← Event CRUD + recurrence
    │       └── PointsPanel.jsx   ← Score, level map, history
    ├── vite.config.js       ← Vite config, proxies /api → localhost:3001
    └── index.html           ← Loads Press Start 2P font from Google Fonts
```

---

## How to Run

```bash
# Terminal 1 — Backend
cd backend && npm start          # production
cd backend && npm run dev        # with nodemon (auto-restart)

# Terminal 2 — Frontend
cd frontend && npm run dev       # starts Vite dev server
```

---

## Environment Variables (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Backend port (default 3001) |
| `EMAIL_USER` | Gmail address to send from |
| `EMAIL_PASS` | Gmail App Password (16-char code from myaccount.google.com/apppasswords) |
| `RECIPIENT_EMAIL` | Email address to receive reminders |

---

## Database

Uses `better-sqlite3` (synchronous API — no callbacks, no promises in route handlers).

**Connection:** `require('../db')` from any route file — returns the `Database` instance.

**Pattern for queries:**
```js
const db = require('../db');

// Read all
db.prepare('SELECT * FROM tasks').all()

// Read one
db.prepare('SELECT * FROM tasks WHERE id=?').get(id)

// Write
db.prepare('INSERT INTO tasks (id,title) VALUES (?,?)').run(id, title)

// Update
db.prepare('UPDATE tasks SET completed=1 WHERE id=?').run(id)

// Delete
db.prepare('DELETE FROM tasks WHERE id=?').run(id)
```

**Schema:** All tables are created in `db.js` using `CREATE TABLE IF NOT EXISTS`. To add a column, add it there AND write a manual `ALTER TABLE` migration inside `db.js` for existing databases.

---

## Adding a New Route

1. Create `backend/routes/myroute.js`
2. Use this pattern:
```js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM mytable').all());
});

module.exports = router;
```
3. Register in `server.js`: `app.use('/api/myroute', require('./routes/myroute'))`
4. Add the table to `db.js` in the `db.exec(...)` block

---

## Adding a New React Component

1. Create `frontend/src/components/MyComponent.jsx`
2. Import context: `import { useApp } from '../context/AppContext'`
3. Add tab in `App.jsx` TABS array: `{ id: 'mine', label: '🎯 MINE' }`
4. Add render: `{tab === 'mine' && <MyComponent />}`

**CSS classes available (from App.css):**
- `.card` — dark blue bordered box
- `.card-title` — cyan section heading
- `.input` — yellow-on-black styled input
- `.btn .btn-primary` — yellow button
- `.btn .btn-danger` — red delete button
- `.form-row` — flex row for form fields
- `.list-item` — row for birthday/event items
- `.task-item` — row for task items
- `.grid-2` — 2-column grid (collapses on mobile)
- `.empty` — centered "nothing here" text

---

## Adding a New Level

Edit the `getLevel()` function in both:
- `backend/routes/points.js`
- `frontend/src/components/PointsPanel.jsx` (LEVELS array)

---

## Changing Point Values

Edit `frontend/src/context/AppContext.jsx`:
- `completeTask()` — task completion points
- `wishBirthday()` — birthday wish points

Edit `backend/routes/points.js`:
- Streak bonus is `+500` every 7 days inside `router.post('/add', ...)`

---

## Cron Jobs

All 3 jobs are in `backend/services/cronService.js`:

| Schedule | What it does |
|----------|-------------|
| `0 8 * * *` | Sends birthday/event email reminders (with `reminder_log` dedup) |
| `0 0 * * *` | Resets recurring tasks (daily/weekly/monthly) |
| `0 0 1 1 *` | New Year's — resets all birthday `last_wished` to null |

To add a new cron job:
```js
cron.schedule('0 12 * * 1', () => {
  // runs every Monday at noon
});
```

---

## Recurrence Logic

Tasks and events have a `recurrence` field: `none | daily | weekly | monthly | yearly`

- **Tasks:** The midnight cron checks all completed recurring tasks and resets `completed=0` + `due_date=today` when their recurrence interval has elapsed since `completed_at`.
- **Events (yearly):** Cron advances the `date` by 1 year when the event date has passed.
- **Birthdays:** Always stored as `MM-DD`, so they naturally recur every year. The `last_wished` field is reset to `null` on January 1st by the cron.

---

## Common Tasks

**Test email sending manually:**
```bash
cd backend
node -e "
require('dotenv').config();
const { sendBirthdayReminder } = require('./services/emailService');
sendBirthdayReminder('Test Person', 1).then(() => console.log('Sent!')).catch(console.error);
"
```

**Inspect the database:**
```bash
cd backend
node -e "
const db = require('./db');
console.log(db.prepare('SELECT * FROM tasks').all());
console.log(db.prepare('SELECT * FROM birthdays').all());
console.log(db.prepare('SELECT * FROM points').get());
setTimeout(() => process.exit(0), 200);
"
```

**Reset all points (for testing):**
```bash
node -e "
const db = require('./db');
db.prepare('UPDATE points SET total=0, streak=0, last_active=NULL WHERE id=1').run();
db.prepare('DELETE FROM point_history').run();
console.log('Points reset');
setTimeout(() => process.exit(0), 200);
"
```
