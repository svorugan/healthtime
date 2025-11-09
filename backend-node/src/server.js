const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
require('dotenv').config();

const { testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');
const authRoutesCentralized = require('./routes/auth-centralized');
const patientRoutes = require('./routes/patients');
const doctorRoutes = require('./routes/doctors');
const adminRoutes = require('./routes/admin');
const surgeryRoutes = require('./routes/surgeries');
const implantRoutes = require('./routes/implants');
const hospitalRoutes = require('./routes/hospitals');
const bookingRoutes = require('./routes/bookings');
const notificationRoutes = require('./routes/notifications');
const uploadRoutes = require('./routes/uploads');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Root endpoint
app.get('/api', (req, res) => {
  res.json({ message: 'healthtime Surgery Booking API - Node.js with PostgreSQL' });
});

// Routes with /api prefix
// New centralized auth (recommended)
app.use('/api/auth', authRoutesCentralized);
// Old auth routes (kept for backward compatibility)
app.use('/api/auth/legacy', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/surgeons', doctorRoutes); // Alias for doctors
app.use('/api/admin', adminRoutes);
app.use('/api/surgeries', surgeryRoutes);
app.use('/api/implants', implantRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ detail: err.message });
  }
  
  res.status(err.status || 500).json({
    detail: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ detail: 'Endpoint not found' });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log('='.repeat(50));
      console.log('🚀 healthtime API Server Started');
      console.log('='.repeat(50));
      console.log(`📍 Server running on: http://localhost:${PORT}`);
      console.log(`📍 Network access: http://<YOUR_IP>:${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Database: PostgreSQL`);
      console.log(`🔐 CORS Origins: ${process.env.CORS_ORIGINS || '*'}`);
      console.log('='.repeat(50));
      console.log('\n📋 Available endpoints:');
      console.log('  - GET    /api');
      console.log('  - POST   /api/auth/login');
      console.log('  - POST   /api/auth/register/admin');
      console.log('  - POST   /api/auth/register/doctor');
      console.log('  - POST   /api/auth/register/doctor/enhanced');
      console.log('  - POST   /api/patients');
      console.log('  - POST   /api/patients/enhanced');
      console.log('  - POST   /api/upload/insurance');
      console.log('  - POST   /api/upload/medical-document');
      console.log('  - POST   /api/upload/doctor-verification');
      console.log('  - GET    /api/surgeries');
      console.log('  - GET    /api/surgeons');
      console.log('  - GET    /api/implants');
      console.log('  - GET    /api/hospitals');
      console.log('  - POST   /api/bookings');
      console.log('  - GET    /api/bookings/:booking_id');
      console.log('  - GET    /api/admin/doctors/pending');
      console.log('  - PATCH  /api/admin/doctors/:doctor_id/approve');
      console.log('  - PATCH  /api/admin/doctors/:doctor_id/reject');
      console.log('  - GET    /api/admin/patients');
      console.log('  - GET    /api/admin/bookings');
      console.log('  - POST   /api/admin/hospitals');
      console.log('  - DELETE /api/admin/hospitals/:hospital_id');
      console.log('  - POST   /api/admin/implants');
      console.log('  - DELETE /api/admin/implants/:implant_id');
      console.log('\n✅ Server is ready to accept requests!\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT signal received: closing HTTP server');
  process.exit(0);
});

startServer();

module.exports = app;
