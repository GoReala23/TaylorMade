const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const routes = require('./routes');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const errorHandler = require('./middlewares/errorHandler');
const path = require('path');
require('dotenv').config();

const app = express();

const mongoURI = process.env.MONGO_URI;

// Middleware
app.use(
  cors({
    origin: [
      'https://goreala23.github.io',
      'http://localhost:5000',
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// // Request logging middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : err.message;
  res.status(statusCode).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === 'development' ? err.stack : {},
  });
});

// Serve static files
app.use('/Images', express.static(path.join(__dirname, 'public/Images')));

app.use((req, res, next) => {
  console.log(` ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api', routes);

app.use('/api/cart', cartRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Error handling middleware (single instance)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : err.message;

  res.status(statusCode).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === 'development' ? err.stack : {},
  });
});

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('MongoDB Connected');
    }
  })
  .catch((err) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('MongoDB connection error');
    }
  });
// Server startup
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`Server running on port ${PORT}`)
);

module.exports = app;
