const path = require('path');

// Load environment-specific .env file
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env.development.local';

require('dotenv').config({ 
  path: path.resolve(__dirname, '..', '..', envFile),
  override: false // Don't override existing env vars
});

// Fallback to .env if environment-specific file doesn't exist
require('dotenv').config({ 
  path: path.resolve(__dirname, '..', '..', '.env')
});

module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGINS: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*'
};
