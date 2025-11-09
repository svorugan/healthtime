/**
 * Centralized authorization middleware
 * Handles role-based access control and resource ownership
 */

/**
 * Role-based authorization middleware
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 * 
 * @example
 * router.get('/admin/users', authenticate, authorize('admin'), getAllUsers);
 * router.get('/bookings', authenticate, authorize('patient', 'doctor'), getBookings);
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user || !req.userRole) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'You must be logged in to access this resource' 
      });
    }

    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.userRole}` 
      });
    }

    next();
  };
};

/**
 * Resource ownership authorization middleware
 * Checks if the user owns the resource or is an admin
 * 
 * @param {string} userIdParam - The parameter name containing the user ID (default: 'id')
 * @param {string} source - Where to find the user ID: 'params', 'body', or 'query' (default: 'params')
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Checks if req.params.id matches req.userId or user is admin
 * router.put('/patients/:id', authenticate, authorizeOwner('id'), updatePatient);
 * 
 * // Checks if req.body.patient_id matches req.userId or user is admin
 * router.post('/bookings', authenticate, authorizeOwner('patient_id', 'body'), createBooking);
 */
const authorizeOwner = (userIdParam = 'id', source = 'params') => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user || !req.userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'You must be logged in to access this resource' 
      });
    }

    // Admins can access any resource
    if (req.userRole === 'admin') {
      return next();
    }

    // Get the resource user ID from the specified source
    let resourceUserId;
    switch (source) {
      case 'params':
        resourceUserId = req.params[userIdParam];
        break;
      case 'body':
        resourceUserId = req.body[userIdParam];
        break;
      case 'query':
        resourceUserId = req.query[userIdParam];
        break;
      default:
        return res.status(500).json({ 
          error: 'Server error',
          message: 'Invalid authorization configuration' 
        });
    }

    // Check if the resource user ID matches the authenticated user ID
    if (resourceUserId !== req.userId) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'You do not have permission to access this resource' 
      });
    }

    next();
  };
};

/**
 * Role-specific resource ownership middleware
 * Checks ownership based on role-specific ID fields
 * 
 * @param {Object} roleFields - Mapping of roles to their ID field names
 * @returns {Function} Express middleware function
 * 
 * @example
 * // For bookings: patients check patient_id, doctors check doctor_id
 * router.get('/bookings/:id', authenticate, authorizeRoleOwner({
 *   patient: 'patient_id',
 *   doctor: 'doctor_id'
 * }), getBooking);
 */
const authorizeRoleOwner = (roleFields) => {
  return async (req, res, next) => {
    // Check if user is authenticated
    if (!req.user || !req.userId || !req.userRole) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'You must be logged in to access this resource' 
      });
    }

    // Admins can access any resource
    if (req.userRole === 'admin') {
      return next();
    }

    // Check if the user's role has a field mapping
    const fieldName = roleFields[req.userRole];
    if (!fieldName) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Your role does not have access to this resource' 
      });
    }

    // Store the field name for use in the route handler
    req.ownershipField = fieldName;

    next();
  };
};

/**
 * Check if user has any of the specified roles
 * @param {string} role - Role to check
 * @param {...string} additionalRoles - Additional roles to check
 * @returns {boolean}
 */
const hasRole = (req, role, ...additionalRoles) => {
  const roles = [role, ...additionalRoles];
  return req.userRole && roles.includes(req.userRole);
};

/**
 * Check if user is admin
 * @returns {boolean}
 */
const isAdmin = (req) => {
  return req.userRole === 'admin';
};

/**
 * Check if user is doctor
 * @returns {boolean}
 */
const isDoctor = (req) => {
  return req.userRole === 'doctor';
};

/**
 * Check if user is patient
 * @returns {boolean}
 */
const isPatient = (req) => {
  return req.userRole === 'patient';
};

/**
 * Check if user is hospital
 * @returns {boolean}
 */
const isHospital = (req) => {
  return req.userRole === 'hospital';
};

/**
 * Check if user is implant
 * @returns {boolean}
 */
const isImplant = (req) => {
  return req.userRole === 'implant';
};

module.exports = {
  authorize,
  authorizeOwner,
  authorizeRoleOwner,
  hasRole,
  isAdmin,
  isDoctor,
  isPatient,
  isHospital,
  isImplant
};
