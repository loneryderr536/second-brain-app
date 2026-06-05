import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || '';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [birthdays, setBirthdays] = useState([]);
  const [events, setEvents] = useState([]);
  const [points, setPoints] = useState({ total: 0, streak: 0, level: 1, title: 'Ghost', next: 1000, history: [] });
  const [toast, setToast] = useState(null);

  const showToast = (msg, pts) => {
    setToast({ msg, pts });
    setTimeout(() => setToast(null), 2500);
  };

  const addPoints = useCallback(async (amount, action) => {
    const res = await fetch(`${API}/api/points/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points: amount, action }),
    });
    const data = await res.json();
    setPoints(data);
    showToast(action, data.earned);
    return data;
  }, []);

  useEffect(() => {
    fetch(`${API}/api/tasks`).then(r => r.json()).then(setTasks);
    fetch(`${API}/api/birthdays`).then(r => r.json()).then(setBirthdays);
    fetch(`${API}/api/events`).then(r => r.json()).then(setEvents);
    fetch(`${API}/api/points`).then(r => r.json()).then(setPoints);
  }, []);

  // Tasks
  async function addTask(task) {
    const res = await fetch(`${API}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    const newTask = await res.json();
    setTasks(prev => [...prev, newTask]);
  }

  async function completeTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task || task.completed) return;
    const res = await fetch(`${API}/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    });
    const updated = await res.json();
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
    let pts = 100;
    if (task.dueDate && new Date(task.dueDate) >= new Date()) pts += 50;
    await addPoints(pts, task.dueDate && new Date(task.dueDate) >= new Date()
      ? 'Task done on time! +150'
      : 'Task completed! +100');
  }

  async function deleteTask(id) {
    await fetch(`${API}/api/tasks/${id}`, { method: 'DELETE' });
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  // Birthdays
  async function addBirthday(b) {
    const res = await fetch(`${API}/api/birthdays`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(b),
    });
    const newB = await res.json();
    setBirthdays(prev => [...prev, newB]);
  }

  async function wishBirthday(id) {
    const res = await fetch(`${API}/api/birthdays/${id}/wish`, { method: 'PUT' });
    const updated = await res.json();
    setBirthdays(prev => prev.map(b => b.id === id ? updated : b));
    await addPoints(200, '🎂 Birthday wished! +200');
  }

  async function deleteBirthday(id) {
    await fetch(`${API}/api/birthdays/${id}`, { method: 'DELETE' });
    setBirthdays(prev => prev.filter(b => b.id !== id));
  }

  // Events
  async function addEvent(ev) {
    const res = await fetch(`${API}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ev),
    });
    const newEv = await res.json();
    setEvents(prev => [...prev, newEv]);
  }

  async function deleteEvent(id) {
    await fetch(`${API}/api/events/${id}`, { method: 'DELETE' });
    setEvents(prev => prev.filter(e => e.id !== id));
  }

  return (
    <AppContext.Provider value={{
      tasks, birthdays, events, points, toast,
      addTask, completeTask, deleteTask,
      addBirthday, wishBirthday, deleteBirthday,
      addEvent, deleteEvent,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
