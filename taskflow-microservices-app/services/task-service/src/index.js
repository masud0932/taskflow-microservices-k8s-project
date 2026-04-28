const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const amqp = require('amqplib');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 4003;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const QUEUE_NAME = 'task-events';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'taskflow',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

let channel;

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: false });
    console.log('Connected to RabbitMQ from task-service');
  } catch (error) {
    console.error('RabbitMQ connection failed:', error.message);
  }
}

async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Tasks table ready');
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
    res.json({ service: 'task-service', status: 'ok' });
  } catch (error) {
    res.status(500).json({ service: 'task-service', status: 'db-error' });
  }
});

app.get('/tasks', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks ORDER BY created_at DESC'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get tasks error:', error.message);
    res.status(500).json({ message: 'internal server error' });
  }
});

app.post('/tasks', async (req, res) => {
  try {
    const { title, description, status = 'pending' } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'title is required' });
    }

    const task = {
      id: uuidv4(),
      title,
      description: description || '',
      status,
      created_by: req.headers['x-user-email'] || 'unknown'
    };

    await pool.query(
      `INSERT INTO tasks (id, title, description, status, created_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        task.id,
        task.title,
        task.description,
        task.status,
        task.created_by
      ]
    );

    if (channel) {
      channel.sendToQueue(
        QUEUE_NAME,
        Buffer.from(JSON.stringify({
          type: 'TASK_CREATED',
          payload: task
        }))
      );
    }

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error.message);
    res.status(500).json({ message: 'internal server error' });
  }
});

app.put('/tasks/:id', async (req, res) => {
  try {
    const { title, description, status } = req.body;

    const result = await pool.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status)
       WHERE id = $4
       RETURNING *`,
      [title, description, status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update task error:', error.message);
    res.status(500).json({ message: 'internal server error' });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Delete task error:', error.message);
    res.status(500).json({ message: 'internal server error' });
  }
});

app.listen(PORT, async () => {
  console.log(`Task Service running on port ${PORT}`);
  await initDb();
  await connectRabbitMQ();
});