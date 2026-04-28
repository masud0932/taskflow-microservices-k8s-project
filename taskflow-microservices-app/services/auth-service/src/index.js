const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 4001;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'taskflow',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table ready');
  } catch (error) {
    console.error('Database initialization failed:', error.message);
  }
}

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ service: 'auth-service', status: 'ok' });
  } catch (error) {
    res.status(500).json({ service: 'auth-service', status: 'db-error' });
  }
});

app.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'user already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    await pool.query(
      `INSERT INTO users (id, name, email, password_hash)
       VALUES ($1, $2, $3, $4)`,
      [userId, name, email, hashedPassword]
    );

    res.status(201).json({
      id: userId,
      name,
      email
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ message: 'internal server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'invalid credentials' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'invalid credentials' });
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'internal server error' });
  }
});

app.listen(PORT, async () => {
  console.log(`Auth Service running on port ${PORT}`);
  await initDb();
});