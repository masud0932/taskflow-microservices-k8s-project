const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 4004;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'taskflow',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Projects table ready');
  } catch (error) {
    console.error('Database initialization failed:', error.message);
  }
}

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ service: 'project-service', status: 'ok' });
  } catch (error) {
    res.status(500).json({ service: 'project-service', status: 'db-error' });
  }
});

app.get('/projects', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM projects ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get projects error:', error.message);
    res.status(500).json({ message: 'internal server error' });
  }
});

app.post('/projects', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'name is required' });
    }

    const project = {
      id: uuidv4(),
      name,
      description: description || '',
      created_by: req.headers['x-user-email'] || 'unknown'
    };

    await pool.query(
      `INSERT INTO projects (id, name, description, created_by)
       VALUES ($1, $2, $3, $4)`,
      [project.id, project.name, project.description, project.created_by]
    );

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error.message);
    res.status(500).json({ message: 'internal server error' });
  }
});

app.put('/projects/:id', async (req, res) => {
  try {
    const { name, description } = req.body;

    const result = await pool.query(
      `UPDATE projects
       SET name = COALESCE($1, name),
           description = COALESCE($2, description)
       WHERE id = $3
       RETURNING *`,
      [name, description, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update project error:', error.message);
    res.status(500).json({ message: 'internal server error' });
  }
});

app.delete('/projects/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Delete project error:', error.message);
    res.status(500).json({ message: 'internal server error' });
  }
});

app.listen(PORT, async () => {
  console.log(`Project Service running on port ${PORT}`);
  await initDb();
});