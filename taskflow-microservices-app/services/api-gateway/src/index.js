const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const { createProxyMiddleware } = require('http-proxy-middleware');
const client = require('prom-client');

client.collectDefaultMetrics();

const app = express();
const PORT = 4000;
const JWT_SECRET = 'supersecretkey';

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ service: 'api-gateway', status: 'ok' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(403).json({ message: 'invalid or expired token' });
  }
}

function addUserHeaders(req, res, next) {
  if (req.user) {
    req.headers['x-user-id'] = req.user.sub;
    req.headers['x-user-email'] = req.user.email;
    req.headers['x-user-name'] = req.user.name;
  }
  next();
}

function fixRequestBody(proxyReq, req) {
  if (!req.body || !Object.keys(req.body).length) return;

  const bodyData = JSON.stringify(req.body);
  proxyReq.setHeader('Content-Type', 'application/json');
  proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
  proxyReq.write(bodyData);
}

app.use(
  '/auth',
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/auth': ''
    },
    on: {
      proxyReq: fixRequestBody
    }
  })
);

app.use(
  '/users',
  authenticateToken,
  addUserHeaders,
  createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/users${path}`,
    on: { proxyReq: fixRequestBody }
  })
);

app.use(
  '/tasks',
  authenticateToken,
  addUserHeaders,
  createProxyMiddleware({
    target: process.env.TASK_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/tasks${path}`,
    on: { proxyReq: fixRequestBody }
  })
);

app.use(
  '/projects',
  authenticateToken,
  addUserHeaders,
  createProxyMiddleware({
    target: process.env.PROJECT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/projects${path}`,
    on: { proxyReq: fixRequestBody }
  })
);

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});