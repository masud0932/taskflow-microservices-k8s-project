const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const amqp = require('amqplib');

const app = express();
const PORT = process.env.PORT || 4005;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const QUEUE_NAME = 'task-events';

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ service: 'notification-service', status: 'ok' });
});

async function consumeMessages() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: false });

    console.log('Notification Service is waiting for messages...');

    channel.consume(QUEUE_NAME, (msg) => {
      if (msg) {
        const event = JSON.parse(msg.content.toString());
        console.log('Notification received event:', event);
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error('RabbitMQ consumer connection failed:', error.message);
  }
}

app.listen(PORT, async () => {
  console.log(`Notification Service running on port ${PORT}`);
  await consumeMessages();
});