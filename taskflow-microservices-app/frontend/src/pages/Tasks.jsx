import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });

  const loadTasks = async () => {
    const res = await api.get('/tasks');
    setTasks(res.data);
  };

  useEffect(() => {
    loadTasks().catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/tasks', form);
    setForm({ title: '', description: '' });
    loadTasks();
  };

  return (
    <div className="page">
      <div className="card">
        <h2>Tasks</h2>
        <form onSubmit={handleSubmit} className="stack">
          <input
            placeholder="Task title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <button type="submit">Add Task</button>
        </form>
      </div>

      <div className="card">
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <strong>{task.title}</strong> — {task.status}
              <br />
              <span>{task.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}