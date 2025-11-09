const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ detail: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ detail: 'Token expired' });
    }
    return res.status(401).json({ detail: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ detail: 'Admin access required' });
  }
  next();
};

const requireDoctor = (req, res, next) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ detail: 'Doctor access required' });
  }
  next();
};

const requirePatient = (req, res, next) => {
  if (req.user.role !== 'patient') {
    return res.status(403).json({ detail: 'Patient access required' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireDoctor,
  requirePatient
};
