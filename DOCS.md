# Second Brain — App Documentation

## What Is This?

Second Brain is a personal productivity web app built with a Pac-Man arcade theme. It helps you manage your daily tasks, remember important birthdays, track upcoming events, and stay motivated through a gamified point-reward system — all while looking like a retro arcade game.

The app runs locally on your Mac. No cloud accounts, no subscriptions. Your data stays on your computer.

---

## Features

### 1. Task Manager
Create tasks with a title, priority level, due date, and recurrence pattern.

- **Priority levels:** High (red), Medium (orange), Low (green)
- **Due dates:** Tasks show a warning if overdue
- **Recurrence:**
  - `Once` — standard one-time task
  - `Daily` — resets automatically every midnight
  - `Weekly` — resets on the same day of the week
  - `Monthly` — resets on the same day of the month
- Recurring tasks are marked with a 🔁 icon
- Completing a task earns you points

### 2. Birthday Tracker
Store birthdays of your friends and family (month + day, no year required).

- The app reminds you by email **1 day before** and **on the day**
- Click **WISH** after wishing someone → earns you **+200 points**
- Wish status resets automatically every January 1st for the new year
- Birthdays are sorted by how soon they're coming up

### 3. Event Manager
Add upcoming events (meetings, trips, appointments, celebrations) with a date, time, and optional notes.

- **Recurrence options:** Once, Daily, Weekly, Monthly, Yearly
- Email reminders sent **1 day before** and **on the day**
- Yearly recurring events (like anniversaries) repeat every year automatically
- Recurring events are marked with a 🔁 icon

### 4. Point-Reward System (Gamification)
Every action you complete earns points:

| Action | Points |
|--------|--------|
| Complete any task | +100 |
| Complete task on or before due date | +150 (100 + 50 bonus) |
| Wish someone a happy birthday | +200 |
| 7-day activity streak | +500 bonus |

**Levels:**

| Score | Level | Icon |
|-------|-------|------|
| 0 – 999 | Ghost | 👻 |
| 1,000 – 1,999 | Blinky | 🔴 |
| 2,000 – 2,999 | Power Pellet | ⚡ |
| 3,000 – 3,999 | Cherry | 🍒 |
| 4,000 – 8,999 | Pac-Man | 🟡 |
| 9,000+ | Ms. Pac-Man | 👑 |

A Pac-Man progress bar at the top of the Dashboard shows how close you are to the next level.

### 5. Email Reminders
Automated emails are sent from `yemmyboys@gmail.com` to `yemmyboys@gmail.com` every morning at 8:00 AM.

Emails are sent for:
- Birthdays: 1 day before + on the day
- Events: 1 day before + on the day

The system prevents duplicate emails — if a reminder was already sent for a specific birthday/event on a given date, it won't send again even if the backend restarts.

---

## How to Use It Daily

**Morning routine:**
1. Open the app → go to **Dashboard**
2. Check today's tasks and overdue items
3. Complete tasks → earn points
4. Check upcoming birthdays and events

**Adding a recurring daily habit:**
1. Go to **Tasks**
2. Enter the habit name (e.g., "Morning walk")
3. Set priority, leave due date as today
4. Set recurrence to **Daily**
5. Click + ADD → it resets automatically every midnight

**Adding a birthday:**
1. Go to **Birthdays**
2. Enter the name and their date
3. Save → you'll get emailed before their birthday every year

**Checking your progress:**
1. Go to **Score** tab
2. See your total, level, streak, and full activity history

---

## Email Setup

To enable email reminders, you need a Gmail App Password:

1. Go to **myaccount.google.com → Security**
2. Enable **2-Step Verification** (if not already on)
3. Go to **myaccount.google.com/apppasswords**
4. Create a new App Password → select **Mail**
5. Copy the 16-character code
6. Paste it into `/second-brain-app/backend/.env`:
   ```
   EMAIL_PASS=your_16_char_code_here
   ```
7. Restart the backend

---

## Running the App

You need two terminal windows open:

**Terminal 1 — Backend:**
```bash
cd ~/second-brain-app/backend
npm start
```
You should see: `Second Brain backend running on port 3001`

**Terminal 2 — Frontend:**
```bash
cd ~/second-brain-app/frontend
npm run dev
```
Then open **http://localhost:5173** in your browser.

---

## Data & Storage

All data is stored in a local SQLite database file at:
```
~/second-brain-app/backend/second-brain.db
```

**Tables:**
- `tasks` — all tasks with recurrence settings
- `birthdays` — birthday entries
- `events` — events with recurrence
- `points` + `point_history` — score and activity log
- `reminder_log` — tracks which emails were already sent

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Custom CSS (Pac-Man arcade theme) |
| Font | Press Start 2P (Google Fonts) |
| Backend | Node.js + Express |
| Database | SQLite via better-sqlite3 |
| Email | Nodemailer + Gmail SMTP |
| Scheduler | node-cron (3 jobs) |

---

## Cron Jobs (Automatic Tasks)

| Schedule | Job |
|----------|-----|
| Every day at 8:00 AM | Check birthdays and events → send emails |
| Every day at midnight | Reset recurring tasks (daily/weekly/monthly) |
| January 1st at midnight | Reset all birthday "wished" status for new year |
