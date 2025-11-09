const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Centralized authentication middleware
 * Verifies JWT token and attaches user information to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'No token provided' 
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user in database
    const user = await User.findByPk(decoded.user_id);

    if (!user) {
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'User not found' 
      });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({ 
        error: 'Account inactive',
        message: 'Your account has been deactivated. Please contact support.' 
      });
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      return res.status(403).json({ 
        error: 'Account locked',
        message: 'Your account is temporarily locked due to multiple failed login attempts. Please try again later.' 
      });
    }

    // Attach user information to request
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;
    req.userEmail = user.email;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'The provided token is invalid' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Your session has expired. Please login again.' 
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({ 
      error: 'Authentication error',
      message: 'An error occurred during authentication' 
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't require it
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.user_id);

    if (user && user.is_active && !user.isAccountLocked()) {
      req.user = user;
      req.userId = user.id;
      req.userRole = user.role;
      req.userEmail = user.email;
    }

    next();
  } catch (error) {
    // Silently fail for optional authentication
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate
};
