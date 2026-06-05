const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'second-brain.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    due_date TEXT,
    completed INTEGER DEFAULT 0,
    completed_at TEXT,
    created_at TEXT NOT NULL,
    recurrence TEXT DEFAULT 'none',
    recurrence_end_date TEXT
  );

  CREATE TABLE IF NOT EXISTS birthdays (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    birth_year INTEGER,
    last_wished TEXT
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    recurrence TEXT DEFAULT 'none',
    recurrence_end_date TEXT
  );

  CREATE TABLE IF NOT EXISTS points (
    id INTEGER PRIMARY KEY DEFAULT 1,
    total INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    last_active TEXT
  );

  CREATE TABLE IF NOT EXISTS point_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    action TEXT NOT NULL,
    points INTEGER NOT NULL,
    running_total INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reminder_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    reminder_date TEXT NOT NULL,
    sent_at TEXT NOT NULL,
    UNIQUE(entity_type, entity_id, reminder_date)
  );
`);

// Seed points row if empty
const pts = db.prepare('SELECT id FROM points WHERE id = 1').get();
if (!pts) db.prepare('INSERT INTO points (id, total, streak) VALUES (1, 0, 0)').run();

// One-time migration from JSON files
function migrateFromJSON() {
  const dataDir = path.join(__dirname, 'data');

  const migrate = (file, tableName, insertFn) => {
    const fp = path.join(dataDir, file);
    const bakFp = fp + '.bak';
    if (!fs.existsSync(fp) || fs.existsSync(bakFp)) return;
    try {
      const data = JSON.parse(fs.readFileSync(fp, 'utf-8'));
      if (!Array.isArray(data) || data.length === 0) return;
      const tx = db.transaction(() => data.forEach(insertFn));
      tx();
      fs.renameSync(fp, bakFp);
      console.log(`[DB] Migrated ${data.length} records from ${file}`);
    } catch (e) {
      console.error(`[DB] Migration failed for ${file}:`, e.message);
    }
  };

  migrate('tasks.json', 'tasks', (t) => {
    db.prepare(`INSERT OR IGNORE INTO tasks (id,title,priority,due_date,completed,completed_at,created_at,recurrence)
      VALUES (?,?,?,?,?,?,?,'none')`).run(
      t.id, t.title, t.priority || 'medium', t.dueDate || null,
      t.completed ? 1 : 0, t.completedAt || null, t.createdAt
    );
  });

  migrate('birthdays.json', 'birthdays', (b) => {
    db.prepare('INSERT OR IGNORE INTO birthdays (id,name,date,birth_year,last_wished) VALUES (?,?,?,?,?)').run(
      b.id, b.name, b.date, b.year || null, b.lastWished || null
    );
  });

  migrate('events.json', 'events', (e) => {
    db.prepare(`INSERT OR IGNORE INTO events (id,title,date,time,notes,created_at,recurrence)
      VALUES (?,?,?,?,?,?,'none')`).run(
      e.id, e.title, e.date, e.time || '', e.notes || '', e.createdAt
    );
  });

  // Migrate points
  const ptsFile = path.join(dataDir, 'points.json');
  const ptsBak = ptsFile + '.bak';
  if (fs.existsSync(ptsFile) && !fs.existsSync(ptsBak)) {
    try {
      const p = JSON.parse(fs.readFileSync(ptsFile, 'utf-8'));
      if (p.total > 0) {
        db.prepare('UPDATE points SET total=?, streak=?, last_active=? WHERE id=1').run(
          p.total, p.streak || 0, p.lastActive || null
        );
        if (Array.isArray(p.history)) {
          const ins = db.prepare('INSERT INTO point_history (date,action,points,running_total) VALUES (?,?,?,?)');
          const tx = db.transaction(() =>
            [...p.history].reverse().forEach(h => ins.run(h.date, h.action, h.points, h.total))
          );
          tx();
        }
        fs.renameSync(ptsFile, ptsBak);
        console.log('[DB] Migrated points data');
      }
    } catch (e) {
      console.error('[DB] Points migration failed:', e.message);
    }
  }
}

migrateFromJSON();
console.log('[DB] SQLite ready →', DB_PATH);

module.exports = db;
