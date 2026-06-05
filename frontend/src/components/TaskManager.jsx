import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function TaskManager() {
  const { tasks, addTask, completeTask, deleteTask } = useApp();
  const [form, setForm] = useState({ title: '', priority: 'medium', dueDate: '', recurrence: 'none' });
  const [filter, setFilter] = useState('all');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    await addTask(form);
    setForm({ title: '', priority: 'medium', dueDate: '', recurrence: 'none' });
  }

  const today = new Date().toISOString().split('T')[0];
  const filtered = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'done') return t.completed;
    if (filter === 'overdue') return !t.completed && t.dueDate && t.dueDate < today;
    return true;
  });

  return (
    <div>
      {/* Add task form */}
      <div className="card">
        <div className="card-title">👻 ADD NEW TASK</div>
        <form onSubmit={handleAdd}>
          <div className="form-row">
            <input
              className="input"
              placeholder="TASK TITLE..."
              value={form.title}
              onChange={e => set('title', e.target.value)}
              style={{ flex: 2 }}
            />
            <select className="input" value={form.priority} onChange={e => set('priority', e.target.value)}>
              <option value="high">🔴 HIGH</option>
              <option value="medium">🟠 MEDIUM</option>
              <option value="low">🟢 LOW</option>
            </select>
            <input
              className="input"
              type="date"
              value={form.dueDate}
              onChange={e => set('dueDate', e.target.value)}
            />
            <select className="input" value={form.recurrence} onChange={e => set('recurrence', e.target.value)}>
              <option value="none">🔂 ONCE</option>
              <option value="daily">🔁 DAILY</option>
              <option value="weekly">📅 WEEKLY</option>
              <option value="monthly">🗓 MONTHLY</option>
            </select>
            <button className="btn btn-primary" type="submit">+ ADD</button>
          </div>
        </form>
      </div>

      {/* Filters */}
      <div className="section-actions">
        {['all', 'active', 'done', 'overdue'].map(f => (
          <button
            key={f}
            className={`btn ${filter === f ? 'btn-primary' : ''}`}
            style={filter !== f ? { background: 'transparent', color: '#666', border: '2px solid #333' } : {}}
            onClick={() => setFilter(f)}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="card">
        <div className="card-title">TASKS ({filtered.length})</div>
        {filtered.length === 0
          ? <div className="empty">● NO TASKS HERE ●</div>
          : filtered.map(t => {
            const isOverdue = !t.completed && t.dueDate && t.dueDate < today;
            return (
              <div key={t.id} className={`task-item ${t.completed ? 'done' : ''}`}>
                <div className={`priority-dot priority-${t.priority}`} />
                <span className="task-title">
                  {t.recurrence && t.recurrence !== 'none' && <span style={{ color: '#00FFFF', marginRight: 6 }}>🔁</span>}
                  {t.title}
                </span>
                {t.dueDate && (
                  <span className={`due-tag ${isOverdue ? 'overdue' : ''}`}>
                    {isOverdue ? '⚠ ' : ''}{t.dueDate}
                  </span>
                )}
                {!t.completed && (
                  <button className="btn btn-success" onClick={() => completeTask(t.id)}>✓</button>
                )}
                {t.completed && <span style={{ color: '#00ff00', fontSize: 9 }}>✓ DONE</span>}
                <button className="btn btn-danger" onClick={() => deleteTask(t.id)}>✕</button>
              </div>
            );
          })}
      </div>

      {/* Points guide */}
      <div className="card" style={{ borderColor: '#333' }}>
        <div className="card-title" style={{ color: '#555' }}>POINT GUIDE</div>
        <div style={{ color: '#555', fontSize: 8, lineHeight: 2.2 }}>
          <div>✓ Complete any task → <span style={{ color: '#00FFFF' }}>+100 pts</span></div>
          <div>⚡ Complete before due date → <span style={{ color: '#00FFFF' }}>+50 bonus</span></div>
          <div>🔥 7-day activity streak → <span style={{ color: '#FFD700' }}>+500 bonus</span></div>
        </div>
      </div>
    </div>
  );
}
