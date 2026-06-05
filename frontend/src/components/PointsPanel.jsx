import { useApp } from '../context/AppContext';

const LEVELS = [
  { level: 1, title: 'Ghost', min: 0, icon: '👻' },
  { level: 2, title: 'Blinky', min: 1000, icon: '🔴' },
  { level: 3, title: 'Power Pellet', min: 2000, icon: '⚡' },
  { level: 4, title: 'Cherry', min: 3000, icon: '🍒' },
  { level: 5, title: 'Pac-Man', min: 4000, icon: '🟡' },
  { level: 10, title: 'Ms. Pac-Man', min: 9000, icon: '👑' },
];

export default function PointsPanel() {
  const { points, tasks } = useApp();

  const currentLevel = LEVELS.filter(l => points.total >= l.min).pop();
  const nextLevel = LEVELS.find(l => l.min > points.total);
  const pct = nextLevel ? Math.round(((points.total - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100) : 100;

  return (
    <div>
      {/* Big score */}
      <div className="card" style={{ textAlign: 'center', borderColor: '#FFD700', boxShadow: '0 0 30px rgba(255,215,0,0.4)' }}>
        <div style={{ color: '#888', fontSize: 8, marginBottom: 8 }}>TOTAL SCORE</div>
        <div style={{ color: '#FFD700', fontSize: 42, textShadow: '0 0 20px #FFD700', letterSpacing: 4 }}>
          {String(points.total).padStart(6, '0')}
        </div>
        <div style={{ color: '#FFB8FF', fontSize: 14, marginTop: 10 }}>
          {currentLevel.icon} LEVEL {currentLevel.level} — {currentLevel.title.toUpperCase()}
        </div>
        <div style={{ color: '#666', fontSize: 8, marginTop: 6 }}>
          🔥 STREAK: {points.streak} DAYS
        </div>

        {nextLevel && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7, color: '#666', marginBottom: 6 }}>
              <span>{points.total} PTS</span>
              <span>NEXT: {nextLevel.title} ({nextLevel.min} PTS)</span>
            </div>
            <div className="progress-bar" style={{ height: 16 }}>
              <div className="progress-fill" style={{ width: `${pct}%` }}>
                <span className="progress-pac" style={{ fontSize: 16 }}>ᗤ</span>
              </div>
            </div>
            <div style={{ color: '#888', fontSize: 7, marginTop: 4 }}>{nextLevel.min - points.total} PTS TO LEVEL UP</div>
          </div>
        )}
      </div>

      {/* Level progression */}
      <div className="card">
        <div className="card-title">🏆 LEVEL PROGRESSION</div>
        {LEVELS.map(l => (
          <div key={l.level} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
            borderBottom: '1px solid #0d0d2b', opacity: points.total >= l.min ? 1 : 0.3,
          }}>
            <div style={{ fontSize: 20 }}>{l.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: points.total >= l.min ? '#FFD700' : '#555', fontSize: 9 }}>
                LVL {l.level} — {l.title}
              </div>
              <div style={{ color: '#666', fontSize: 7 }}>{l.min.toLocaleString()} pts</div>
            </div>
            {points.total >= l.min && <span style={{ color: '#00ff00', fontSize: 9 }}>✓ UNLOCKED</span>}
          </div>
        ))}
      </div>

      {/* Recent history */}
      <div className="card">
        <div className="card-title">📜 RECENT ACTIVITY</div>
        {points.history?.length === 0
          ? <div className="empty">● NO ACTIVITY YET ●</div>
          : points.history?.slice(0, 10).map((h, i) => (
            <div key={i} className="history-item">
              <span style={{ color: '#FFD700', fontSize: 9 }}>+{h.points}</span>
              <span className="history-action">{h.action}</span>
              <span className="history-date">{new Date(h.date).toLocaleDateString()}</span>
            </div>
          ))}
      </div>

      {/* Stats */}
      <div className="grid-2">
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ color: '#888', fontSize: 7, marginBottom: 8 }}>TASKS COMPLETED</div>
          <div style={{ color: '#00FFFF', fontSize: 28 }}>{tasks.filter(t => t.completed).length}</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ color: '#888', fontSize: 7, marginBottom: 8 }}>LONGEST STREAK</div>
          <div style={{ color: '#FFD700', fontSize: 28 }}>{points.streak} 🔥</div>
        </div>
      </div>
    </div>
  );
}
