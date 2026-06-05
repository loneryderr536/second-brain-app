import { useState } from 'react';
import { useApp } from '../context/AppContext';

function daysUntil(dateStr) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const ev = new Date(dateStr); ev.setHours(0, 0, 0, 0);
  return Math.round((ev - today) / 86400000);
}

export default function EventManager() {
  const { events, addEvent, deleteEvent } = useApp();
  const [form, setForm] = useState({ title: '', date: '', time: '', notes: '', recurrence: 'none' });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    await addEvent(form);
    setForm({ title: '', date: '', time: '', notes: '', recurrence: 'none' });
  }

  const upcoming = events.filter(e => daysUntil(e.date) >= 0).sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = events.filter(e => daysUntil(e.date) < 0);

  return (
    <div>
      <div className="card">
        <div className="card-title">📅 ADD EVENT</div>
        <form onSubmit={handleAdd}>
          <div className="form-row">
            <input className="input" placeholder="EVENT TITLE..." value={form.title} onChange={e => set('title', e.target.value)} style={{ flex: 2 }} />
            <input className="input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            <input className="input" type="time" value={form.time} onChange={e => set('time', e.target.value)} />
          </div>
          <div className="form-row">
            <input className="input" placeholder="NOTES (OPTIONAL)..." value={form.notes} onChange={e => set('notes', e.target.value)} style={{ flex: 1 }} />
            <select className="input" value={form.recurrence} onChange={e => set('recurrence', e.target.value)}>
              <option value="none">🔂 ONCE</option>
              <option value="daily">🔁 DAILY</option>
              <option value="weekly">📅 WEEKLY</option>
              <option value="monthly">🗓 MONTHLY</option>
              <option value="yearly">📆 YEARLY</option>
            </select>
            <button className="btn btn-primary" type="submit">+ ADD</button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-title">📡 UPCOMING ({upcoming.length})</div>
        {upcoming.length === 0
          ? <div className="empty">● NO UPCOMING EVENTS ●</div>
          : upcoming.map(e => {
            const days = daysUntil(e.date);
            return (
              <div key={e.id} className="list-item">
                <div style={{ fontSize: 20 }}>{days === 0 ? '⚡' : '📅'}</div>
                <div className="list-item-info">
                  <div className="list-item-name">
                    {e.recurrence && e.recurrence !== 'none' && <span style={{ color: '#00FFFF', marginRight: 6 }}>🔁</span>}
                    {e.title}
                  </div>
                  <div className="list-item-sub">
                    {e.date}{e.time && ` · ${e.time}`}
                    {e.notes && ` · ${e.notes}`}
                  </div>
                </div>
                <div className={`list-item-badge ${days === 0 ? 'badge-today' : days <= 3 ? 'badge-soon' : ''}`}
                  style={days > 3 ? { color: '#444', border: '1px solid #333', fontSize: 7, padding: '4px 8px', borderRadius: 2 } : {}}>
                  {days === 0 ? 'TODAY' : days === 1 ? 'TOMORROW' : `${days}d`}
                </div>
                <button className="btn btn-danger" onClick={() => deleteEvent(e.id)}>✕</button>
              </div>
            );
          })}
      </div>

      {past.length > 0 && (
        <div className="card" style={{ opacity: 0.5 }}>
          <div className="card-title" style={{ color: '#444' }}>PAST EVENTS ({past.length})</div>
          {past.map(e => (
            <div key={e.id} className="list-item">
              <div className="list-item-info">
                <div className="list-item-name" style={{ color: '#555' }}>{e.title}</div>
                <div className="list-item-sub">{e.date}</div>
              </div>
              <button className="btn btn-danger" onClick={() => deleteEvent(e.id)}>✕</button>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ borderColor: '#333' }}>
        <div className="card-title" style={{ color: '#555' }}>EMAIL REMINDERS</div>
        <div style={{ color: '#555', fontSize: 8, lineHeight: 2.2 }}>
          <div>📧 Email sent <span style={{ color: '#00FFFF' }}>1 day before</span> every event</div>
          <div>📧 Email sent <span style={{ color: '#00FFFF' }}>on the day</span> of every event</div>
          <div>📮 Sent to: <span style={{ color: '#FFD700' }}>yemmyboys@gmail.com</span></div>
        </div>
      </div>
    </div>
  );
}
