import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
import BirthdayTracker from './components/BirthdayTracker';
import EventManager from './components/EventManager';
import PointsPanel from './components/PointsPanel';
import './App.css';

const TABS = [
  { id: 'dashboard', label: '🏠 HOME' },
  { id: 'tasks', label: '👻 TASKS' },
  { id: 'birthdays', label: '🎂 BDAYS' },
  { id: 'events', label: '📅 EVENTS' },
  { id: 'points', label: '🏆 SCORE' },
];

function AppInner() {
  const [tab, setTab] = useState('dashboard');
  const { points, toast } = useApp();

  return (
    <div className="app">
      {/* Arcade Header */}
      <header className="header">
        <div className="header-dots">● ● ● ● ● ● ●</div>
        <div className="header-title">
          <span className="pacman-icon">ᗤ</span>
          <span>SECOND BRAIN</span>
          <span className="pacman-icon flip">ᗤ</span>
        </div>
        <div className="header-score">
          <span className="score-label">SCORE</span>
          <span className="score-value">{String(points.total).padStart(6, '0')}</span>
          <span className="level-badge">LVL {points.level} · {points.title}</span>
        </div>
        <div className="header-dots">● ● ● ● ● ● ●</div>
      </header>

      {/* Nav */}
      <nav className="nav">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            className={`nav-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {i > 0 && <span className="nav-dot">●</span>}
            {t.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="main">
        {tab === 'dashboard' && <Dashboard onNavigate={setTab} />}
        {tab === 'tasks' && <TaskManager />}
        {tab === 'birthdays' && <BirthdayTracker />}
        {tab === 'events' && <EventManager />}
        {tab === 'points' && <PointsPanel />}
      </main>

      {/* Toast notification */}
      {toast && (
        <div className="toast">
          <span className="toast-pac">ᗤ</span>
          {toast.msg}
          {toast.pts && <span className="toast-pts"> +{toast.pts} PTS!</span>}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
