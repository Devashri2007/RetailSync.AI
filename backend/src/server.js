const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Attach Socket.IO to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(
  cors({
    origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'RetailSync AI - Primary Node/Express Service',
    database: 'MongoDB Connected',
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/identity', require('./routes/identityRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/returns', require('./routes/returnRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/action-center', require('./routes/actionCenterRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[Error] ${err.stack || err.message}`);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log(`[Socket.IO Client Connected] ID: ${socket.id}`);

  socket.on('join_role_room', (role) => {
    socket.join(`role:${role}`);
    console.log(`Socket ${socket.id} joined room role:${role}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO Client Disconnected] ID: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`[RetailSync AI Server] Running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});

module.exports = { app, server, io };
