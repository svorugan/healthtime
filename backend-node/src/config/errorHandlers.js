const multer = require('multer');

const setupErrorHandlers = (app) => {
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
};

module.exports = { setupErrorHandlers };
