const fs = require('fs');
const path = require('path');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const mongoose = require('mongoose');
const errorHandler = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

// Connect to database
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('MongoDB Connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

const app = express();
const server = http.createServer(app);
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
const hasFrontendBuild = fs.existsSync(frontendDistPath);
const configuredFrontendOrigin =
  process.env.FRONTEND_URL ||
  (process.env.RENDER_EXTERNAL_HOSTNAME
    ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`
    : null);
const defaultDevOrigin = 'http://localhost:5173';
const allowedOrigins = [configuredFrontendOrigin, defaultDevOrigin].filter(Boolean);
const resolveCorsOrigin = (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  return callback(new Error('Not allowed by CORS'));
};

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: resolveCorsOrigin,
    methods: ["GET", "POST"]
  }
});

// Make io available to controllers
app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors({
  origin: resolveCorsOrigin,
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join doctor room for real-time updates
  socket.on('joinDoctorRoom', (doctorId) => {
    socket.join(`doctor_${doctorId}`);
    console.log(`Client ${socket.id} joined doctor room: ${doctorId}`);
  });

  // Join patient room for real-time updates
  socket.on('joinPatientRoom', (patientId) => {
    socket.join(`patient_${patientId}`);
    console.log(`Client ${socket.id} joined patient room: ${patientId}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

if (hasFrontendBuild) {
  app.use(express.static(frontendDistPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Frontend build not found'
    });
  });
}

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;
