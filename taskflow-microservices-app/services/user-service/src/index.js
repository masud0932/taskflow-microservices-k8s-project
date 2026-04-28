const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 4002;

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
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        email VARCHAR(255),
        role VARCHAR(100) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('User profiles table ready');
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
    res.json({ service: 'user-service', status: 'ok' });
  } catch (error) {
    res.status(500).json({ service: 'user-service', status: 'db-error' });
  }
});

app.get('/users/me', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const userEmail = req.headers['x-user-email'];
    const userName = req.headers['x-user-name'];

    if (!userId) {
      return res.status(401).json({ message: 'missing user context' });
    }

    let result = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      await pool.query(
        `INSERT INTO user_profiles (user_id, name, email)
         VALUES ($1, $2, $3)`,
        [userId, userName, userEmail]
      );

      result = await pool.query(
        'SELECT * FROM user_profiles WHERE user_id = $1',
        [userId]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ message: 'internal server error' });
  }
});

app.put('/users/me', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { name, role } = req.body;

    const result = await pool.query(
      `UPDATE user_profiles
       SET name = COALESCE($1, name),
           role = COALESCE($2, role)
       WHERE user_id = $3
       RETURNING *`,
      [name, role, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'profile not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'internal server error' });
  }
});

app.listen(PORT, async () => {
  console.log(`User Service running on port ${PORT}`);
  await initDb();
});