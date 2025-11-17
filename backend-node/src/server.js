const express = require('express');
const { PORT } = require('./config/app');
const { testConnection } = require('./config/database');
const { setupMiddleware } = require('./config/middleware');
const { setupRoutes } = require('./config/routes');
const { setupErrorHandlers } = require('./config/errorHandlers');
const { logServerInfo } = require('./utils/serverInfo');

const app = express();

// Setup application
setupMiddleware(app);
setupRoutes(app);
setupErrorHandlers(app);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    app.listen(PORT, '0.0.0.0', () => {
      logServerInfo();
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
