import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const [profileRes, tasksRes, projectsRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/tasks'),
        api.get('/projects')
      ]);
      setProfile(profileRes.data);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
    };

    loadData().catch(console.error);
  }, []);

  return (
    <div className="page">
      <div className="grid">
        <div className="card">
          <h3>User</h3>
          <p>{profile?.name}</p>
          <p>{profile?.email}</p>
        </div>
        <div className="card">
          <h3>Total Tasks</h3>
          <p>{tasks.length}</p>
        </div>
        <div className="card">
          <h3>Total Projects</h3>
          <p>{projects.length}</p>
        </div>
      </div>
    </div>
  );
}