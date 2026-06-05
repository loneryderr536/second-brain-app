import { useApp } from '../context/AppContext';

function daysUntilBirthday(dateStr) {
  const today = new Date();
  const [m, d] = dateStr.split('-').map(Number);
  const next = new Date(today.getFullYear(), m - 1, d);
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return Math.round((next - today) / 86400000);
}

function daysUntilEvent(dateStr) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const ev = new Date(dateStr); ev.setHours(0, 0, 0, 0);
  return Math.round((ev - today) / 86400000);
}

export default function Dashboard({ onNavigate }) {
  const { tasks, birthdays, events, points } = useApp();

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => !t.completed && t.dueDate === today);
  const overdueTasks = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today);
  const upcomingBdays = birthdays.filter(b => daysUntilBirthday(b.date) <= 7).sort((a, b) => daysUntilBirthday(a.date) - daysUntilBirthday(b.date));
  const upcomingEvents = events.filter(e => { const d = daysUntilEvent(e.date); return d >= 0 && d <= 7; }).sort((a, b) => new Date(a.date) - new Date(b.date));

  const pct = points.next ? Math.min(100, Math.round(((points.total % 1000) / (points.next - (points.level - 1) * 1000 || 1000)) * 100)) : 100;

  return (
    <div>
      {/* Score card */}
      <div className="card" style={{ borderColor: '#FFD700', boxShadow: '0 0 20px rgba(255,215,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ color: '#888', fontSize: 8, marginBottom: 6 }}>CURRENT LEVEL</div>
            <div style={{ color: '#FFD700', fontSize: 16 }}>LVL {points.level} — {points.title}</div>
            <div style={{ color: '#666', fontSize: 7, marginTop: 4 }}>🔥 {points.streak} day streak</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#888', fontSize: 8 }}>TOTAL SCORE</div>
            <div style={{ color: '#FFD700', fontSize: 28, textShadow: '0 0 15px #FFD700' }}>{String(points.total).padStart(6, '0')}</div>
          </div>
        </div>
        {points.next && (
          <div style={{ marginTop: 14 }}>
            <div style={{ color: '#666', fontSize: 7, marginBottom: 5 }}>
              NEXT LEVEL: {points.total} / {points.next} pts
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${pct}%` }}>
                <span className="progress-pac">ᗤ</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid-2">
        {/* Today's Tasks */}
        <div className="card">
          <div className="card-title">⏰ TODAY'S TASKS ({todayTasks.length})</div>
          {todayTasks.length === 0 && overdueTasks.length === 0
            ? <div className="empty">● ALL CLEAR! ●</div>
            : <>
              {todayTasks.map(t => (
                <div key={t.id} className="task-item">
                  <div className={`priority-dot priority-${t.priority}`} />
                  <span className="task-title">{t.title}</span>
                </div>
              ))}
              {overdueTasks.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ color: '#FF0000', fontSize: 8, marginBottom: 6 }}>👻 OVERDUE ({overdueTasks.length})</div>
                  {overdueTasks.slice(0, 3).map(t => (
                    <div key={t.id} className="task-item">
                      <div className="priority-dot priority-high" />
                      <span className="task-title" style={{ color: '#FF0000' }}>{t.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </>}
          <button className="btn btn-primary" style={{ marginTop: 12, width: '100%' }} onClick={() => onNavigate('tasks')}>
            GO TO TASKS →
          </button>
        </div>

        {/* Upcoming */}
        <div className="card">
          <div className="card-title">📡 UPCOMING (7 DAYS)</div>
          {upcomingBdays.length === 0 && upcomingEvents.length === 0
            ? <div className="empty">● NOTHING UPCOMING ●</div>
            : <>
              {upcomingBdays.map(b => {
                const d = daysUntilBirthday(b.date);
                return (
                  <div key={b.id} className="list-item">
                    <div className="list-item-info">
                      <div className="list-item-name">🎂 {b.name}</div>
                      <div className="list-item-sub">{d === 0 ? 'TODAY!' : `in ${d} day${d !== 1 ? 's' : ''}`}</div>
                    </div>
                    <div className={`list-item-badge ${d === 0 ? 'badge-today' : 'badge-soon'}`}>
                      {d === 0 ? '🎉 TODAY' : `${d}d`}
                    </div>
                  </div>
                );
              })}
              {upcomingEvents.map(e => {
                const d = daysUntilEvent(e.date);
                return (
                  <div key={e.id} className="list-item">
                    <div className="list-item-info">
                      <div className="list-item-name">📅 {e.title}</div>
                      <div className="list-item-sub">{e.time || e.date}</div>
                    </div>
                    <div className={`list-item-badge ${d === 0 ? 'badge-today' : 'badge-soon'}`}>
                      {d === 0 ? 'TODAY' : `${d}d`}
                    </div>
                  </div>
                );
              })}
            </>}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid-2">
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ color: '#888', fontSize: 8, marginBottom: 8 }}>ACTIVE TASKS</div>
          <div style={{ color: '#00FFFF', fontSize: 32 }}>{tasks.filter(t => !t.completed).length}</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ color: '#888', fontSize: 8, marginBottom: 8 }}>TASKS CLEARED</div>
          <div style={{ color: '#FFD700', fontSize: 32 }}>{tasks.filter(t => t.completed).length}</div>
        </div>
      </div>
    </div>
  );
}
