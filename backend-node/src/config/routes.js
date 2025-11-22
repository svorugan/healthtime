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

// New routes for complete schema v2
const hospitalAvailabilityRoutes = require('../routes/hospital-availability');
const doctorAvailabilityRoutes = require('../routes/doctor-availability');
const reviewRoutes = require('../routes/reviews');
const testimonialRoutes = require('../routes/testimonials');
const serviceTileRoutes = require('../routes/service-tiles');
const featuredContentRoutes = require('../routes/featured-content');
const featureConfigurationRoutes = require('../routes/feature-configurations');
const otpLogRoutes = require('../routes/otp-logs');
const commissionAgreementRoutes = require('../routes/commission-agreements');
const commissionTransactionRoutes = require('../routes/commission-transactions');
const landingPageAnalyticsRoutes = require('../routes/landing-page-analytics');

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

  // New routes for complete schema v2
  app.use('/api/hospital-availability', hospitalAvailabilityRoutes);
  app.use('/api/doctor-availability', doctorAvailabilityRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/testimonials', testimonialRoutes);
  app.use('/api/service-tiles', serviceTileRoutes);
  app.use('/api/featured-content', featuredContentRoutes);
  app.use('/api/feature-configurations', featureConfigurationRoutes);
  app.use('/api/otp-logs', otpLogRoutes);
  app.use('/api/commission-agreements', commissionAgreementRoutes);
  app.use('/api/commission-transactions', commissionTransactionRoutes);
  app.use('/api/landing-page-analytics', landingPageAnalyticsRoutes);
};

module.exports = { setupRoutes };
