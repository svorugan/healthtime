const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { CORS_ORIGINS } = require('./app');

const setupMiddleware = (app) => {
  // Security and logging middleware
  app.use(helmet());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static files from public directory
  app.use(express.static('public'));

  // CORS configuration
  const corsOptions = {
    origin: CORS_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };
  app.use(cors(corsOptions));
};

module.exports = { setupMiddleware };
