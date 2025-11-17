const authRoutes = require('../routes/auth');
const authRoutesCentralized = require('../routes/auth-centralized');
const patientRoutes = require('../routes/patients');
const doctorRoutes = require('../routes/doctors');
const adminRoutes = require('../routes/admin');
const surgeryRoutes = require('../routes/surgeries');
const implantRoutes = require('../routes/implants');
const hospitalRoutes = require('../routes/hospitals');
const bookingRoutes = require('../routes/bookings');
const notificationRoutes = require('../routes/notifications');
const uploadRoutes = require('../routes/uploads');
const apiDocsRoutes = require('../routes/api-docs');

const setupRoutes = (app) => {
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
  app.use('/api/docs', apiDocsRoutes);
};

module.exports = { setupRoutes };
