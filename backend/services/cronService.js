const cron = require('node-cron');
const db = require('../db');
const { sendBirthdayReminder, sendEventReminder } = require('./emailService');

function getDaysUntilBirthday(dateStr) {
  const today = new Date();
  const [month, day] = dateStr.split('-').map(Number);
  const next = new Date(today.getFullYear(), month - 1, day);
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return Math.round((next - today) / (1000 * 60 * 60 * 24));
}

function getDaysUntilEvent(dateStr) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const ev = new Date(dateStr); ev.setHours(0, 0, 0, 0);
  return Math.round((ev - today) / (1000 * 60 * 60 * 24));
}

function addDays(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function addMonths(dateStr, n) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + n);
  return d.toISOString().split('T')[0];
}

function addYears(dateStr, n) {
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + n);
  return d.toISOString().split('T')[0];
}

// Daily at 8:00 AM — send email reminders (with duplicate prevention)
cron.schedule('0 8 * * *', async () => {
  console.log('[CRON] Running daily reminder check...');
  const today = new Date().toISOString().split('T')[0];

  const birthdays = db.prepare('SELECT * FROM birthdays').all();
  for (const b of birthdays) {
    const days = getDaysUntilBirthday(b.date);
    if (days === 0 || days === 1) {
      const reminderDate = days === 0 ? today : addDays(today, 1);
      const alreadySent = db.prepare(
        'SELECT id FROM reminder_log WHERE entity_type=? AND entity_id=? AND reminder_date=?'
      ).get('birthday', b.id, reminderDate);
      if (alreadySent) continue;
      try {
        await sendBirthdayReminder(b.name, days);
        db.prepare('INSERT INTO reminder_log (entity_type,entity_id,reminder_date,sent_at) VALUES (?,?,?,?)').run(
          'birthday', b.id, reminderDate, new Date().toISOString()
        );
        console.log(`[CRON] Birthday reminder sent for ${b.name}`);
      } catch (e) {
        console.error(`[CRON] Birthday reminder failed for ${b.name}:`, e.message);
      }
    }
  }

  const events = db.prepare('SELECT * FROM events').all();
  for (const ev of events) {
    const days = getDaysUntilEvent(ev.date);
    if (days === 0 || days === 1) {
      const alreadySent = db.prepare(
        'SELECT id FROM reminder_log WHERE entity_type=? AND entity_id=? AND reminder_date=?'
      ).get('event', ev.id, ev.date);
      if (alreadySent) continue;
      try {
        await sendEventReminder(ev, days);
        db.prepare('INSERT INTO reminder_log (entity_type,entity_id,reminder_date,sent_at) VALUES (?,?,?,?)').run(
          'event', ev.id, ev.date, new Date().toISOString()
        );
        console.log(`[CRON] Event reminder sent for "${ev.title}"`);
      } catch (e) {
        console.error(`[CRON] Event reminder failed for "${ev.title}":`, e.message);
      }
    }
  }
});

// Midnight — reset recurring tasks
cron.schedule('0 0 * * *', () => {
  console.log('[CRON] Running recurring task reset...');
  const today = new Date().toISOString().split('T')[0];
  const recurring = db.prepare("SELECT * FROM tasks WHERE recurrence != 'none' AND completed = 1").all();

  for (const task of recurring) {
    if (task.recurrence_end_date && today > task.recurrence_end_date) continue;

    let shouldReset = false;
    const completedDate = task.completed_at ? task.completed_at.split('T')[0] : null;
    if (!completedDate || completedDate >= today) continue;

    if (task.recurrence === 'daily') {
      shouldReset = true;
    } else if (task.recurrence === 'weekly') {
      const lastDow = new Date(completedDate).getDay();
      const todayDow = new Date(today).getDay();
      shouldReset = lastDow === todayDow;
    } else if (task.recurrence === 'monthly') {
      const lastDay = new Date(completedDate).getDate();
      const todayDay = new Date(today).getDate();
      shouldReset = lastDay === todayDay;
    }

    if (shouldReset) {
      db.prepare('UPDATE tasks SET completed=0, completed_at=NULL, due_date=? WHERE id=?').run(today, task.id);
      console.log(`[CRON] Reset recurring task: "${task.title}" (${task.recurrence})`);
    }
  }
});

// Jan 1st at midnight — reset all birthday lastWished for new year
cron.schedule('0 0 1 1 *', () => {
  db.prepare('UPDATE birthdays SET last_wished=NULL').run();
  console.log('[CRON] New year — reset all birthday wishes');
});

console.log('[CRON] Schedulers started: email reminders (8AM), recurring resets (midnight), birthday reset (Jan 1)');
