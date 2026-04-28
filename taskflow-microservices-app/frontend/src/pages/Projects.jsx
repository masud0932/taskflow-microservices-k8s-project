import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });

  const loadProjects = async () => {
    const res = await api.get('/projects');
    setProjects(res.data);
  };

  useEffect(() => {
    loadProjects().catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/projects', form);
    setForm({ name: '', description: '' });
    loadProjects();
  };

  return (
    <div className="page">
      <div className="card">
        <h2>Projects</h2>
        <form onSubmit={handleSubmit} className="stack">
          <input
            placeholder="Project name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <button type="submit">Add Project</button>
        </form>
      </div>

      <div className="card">
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <strong>{project.name}</strong>
              <br />
              <span>{project.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}