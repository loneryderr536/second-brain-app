import { useState } from 'react';
import { useApp } from '../context/AppContext';

function daysUntil(dateStr) {
  const today = new Date();
  const [m, d] = dateStr.split('-').map(Number);
  const next = new Date(today.getFullYear(), m - 1, d);
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return Math.round((next - today) / 86400000);
}

export default function BirthdayTracker() {
  const { birthdays, addBirthday, wishBirthday, deleteBirthday } = useApp();
  const [form, setForm] = useState({ name: '', date: '', year: '' });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.date) return;
    const [, m, d] = form.date.split('-');
    await addBirthday({ name: form.name, date: `${m}-${d}`, year: form.year || null });
    setForm({ name: '', date: '', year: '' });
  }

  const sorted = [...birthdays].sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
  const currentYear = String(new Date().getFullYear());

  return (
    <div>
      <div className="card">
        <div className="card-title">🎂 ADD BIRTHDAY</div>
        <form onSubmit={handleAdd}>
          <div className="form-row">
            <input className="input" placeholder="PERSON'S NAME..." value={form.name} onChange={e => set('name', e.target.value)} />
            <input className="input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            <button className="btn btn-primary" type="submit">+ ADD</button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-title">🎉 BIRTHDAYS ({birthdays.length})</div>
        {sorted.length === 0
          ? <div className="empty">● NO BIRTHDAYS ADDED YET ●</div>
          : sorted.map(b => {
            const days = daysUntil(b.date);
            const wished = b.lastWished === currentYear;
            return (
              <div key={b.id} className={`list-item ${wished ? 'wished' : ''}`}>
                <div style={{ fontSize: 20 }}>{days === 0 ? '🎂' : days <= 7 ? '🎈' : '👤'}</div>
                <div className="list-item-info">
                  <div className="list-item-name">{b.name}</div>
                  <div className="list-item-sub">
                    {days === 0 ? '🎉 TODAY!' : days === 1 ? 'TOMORROW!' : `in ${days} days`}
                    {wished && ' · ✓ WISHED'}
                  </div>
                </div>
                <div className={`list-item-badge ${days === 0 ? 'badge-today' : days <= 7 ? 'badge-soon' : ''}`}
                  style={days > 7 ? { color: '#444', border: '1px solid #333', fontSize: 7, padding: '4px 8px', borderRadius: 2 } : {}}>
                  {days === 0 ? '🎉 TODAY' : `${days}d`}
                </div>
                {!wished && (
                  <button className="btn btn-wish" onClick={() => wishBirthday(b.id)}>
                    🎂 WISH
                  </button>
                )}
                <button className="btn btn-danger" onClick={() => deleteBirthday(b.id)}>✕</button>
              </div>
            );
          })}
      </div>

      <div className="card" style={{ borderColor: '#333' }}>
        <div className="card-title" style={{ color: '#555' }}>EMAIL REMINDERS</div>
        <div style={{ color: '#555', fontSize: 8, lineHeight: 2.2 }}>
          <div>📧 Email sent <span style={{ color: '#FFB8FF' }}>1 day before</span> every birthday</div>
          <div>📧 Email sent <span style={{ color: '#FFB8FF' }}>on the day</span> of every birthday</div>
          <div>🎂 Click WISH after wishing → <span style={{ color: '#00FFFF' }}>+200 pts</span></div>
        </div>
      </div>
    </div>
  );
}
