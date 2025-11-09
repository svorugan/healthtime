# Authentication & Authorization Middleware - Quick Reference

## Import Middleware

```javascript
const { authenticate, optionalAuthenticate } = require('./middleware/authenticate');
const { authorize, authorizeOwner, authorizeRoleOwner, isAdmin, isDoctor, isPatient } = require('./middleware/authorize');
```

## Common Patterns

### 1. Public Routes (No Auth Required)

```javascript
// Login, registration, public info
router.post('/auth/login', loginController);
router.get('/surgeries', getSurgeries);
router.get('/hospitals', getHospitals);
```

### 2. Authenticated Routes (Any Logged-in User)

```javascript
// Any authenticated user can access
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
```

### 3. Admin Only Routes

```javascript
// Only admins can access
router.get('/admin/users', authenticate, authorize('admin'), getAllUsers);
router.post('/admin/approve-doctor/:id', authenticate, authorize('admin'), approveDoctor);
router.delete('/admin/users/:id', authenticate, authorize('admin'), deleteUser);
```

### 4. Doctor Only Routes

```javascript
// Only doctors can access
router.get('/doctor/dashboard', authenticate, authorize('doctor'), getDoctorDashboard);
router.put('/doctor/availability', authenticate, authorize('doctor'), updateAvailability);
router.get('/doctor/patients', authenticate, authorize('doctor'), getDoctorPatients);
```

### 5. Patient Only Routes

```javascript
// Only patients can access
router.post('/bookings', authenticate, authorize('patient'), createBooking);
router.get('/patient/medical-history', authenticate, authorize('patient'), getMedicalHistory);
```

### 6. Multiple Roles Allowed

```javascript
// Patients and doctors can access
router.get('/bookings', authenticate, authorize('patient', 'doctor'), getBookings);

// Doctors and admins can access
router.get('/patients/:id', authenticate, authorize('doctor', 'admin'), getPatientDetails);

// All authenticated users
router.get('/notifications', authenticate, authorize('admin', 'doctor', 'patient'), getNotifications);
```

### 7. Resource Ownership (User Can Only Access Their Own Data)

```javascript
// Patient can only update their own profile, admins can update any
router.put('/patients/:id', 
  authenticate, 
  authorize('patient', 'admin'), 
  authorizeOwner('id'), 
  updatePatient
);

// Doctor can only update their own profile
router.put('/doctors/:id', 
  authenticate, 
  authorize('doctor', 'admin'), 
  authorizeOwner('id'), 
  updateDoctor
);
```

### 8. Resource Ownership with Body Parameters

```javascript
// Check patient_id in request body
router.post('/medical-records', 
  authenticate, 
  authorize('patient', 'admin'), 
  authorizeOwner('patient_id', 'body'), 
  createMedicalRecord
);
```

### 9. Role-Specific Ownership

```javascript
// Patients see their bookings, doctors see bookings assigned to them
router.get('/bookings/:id', 
  authenticate, 
  authorizeRoleOwner({
    patient: 'patient_id',
    doctor: 'doctor_id'
  }), 
  getBookingDetails
);
```

### 10. Optional Authentication

```javascript
// Attach user info if logged in, but don't require it
router.get('/doctors', optionalAuthenticate, getDoctors);

// In controller, check if user is authenticated
const getDoctors = async (req, res) => {
  const doctors = await Doctor.findAll();
  
  // Show more details if user is logged in
  if (req.user) {
    return res.json({ doctors, detailed: true });
  }
  
  return res.json({ doctors, detailed: false });
};
```

## Route Handler Examples

### Using Role Checks in Controllers

```javascript
const { isAdmin, isDoctor, isPatient } = require('./middleware/authorize');

// Example 1: Different logic based on role
router.get('/bookings', authenticate, async (req, res) => {
  try {
    let bookings;
    
    if (isAdmin(req)) {
      // Admins see all bookings
      bookings = await Booking.findAll();
    } else if (isDoctor(req)) {
      // Doctors see their bookings
      bookings = await Booking.findAll({ where: { doctor_id: req.userId } });
    } else if (isPatient(req)) {
      // Patients see their bookings
      bookings = await Booking.findAll({ where: { patient_id: req.userId } });
    }
    
    return res.json(bookings);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Example 2: Conditional field access
router.get('/patients/:id', authenticate, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Admins see everything, doctors see limited info
    if (isAdmin(req)) {
      return res.json(patient);
    } else {
      // Remove sensitive fields for doctors
      const { password, insurance_number, ...patientData } = patient.toJSON();
      return res.json(patientData);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
```

### Complex Authorization Logic

```javascript
// Example: Booking access control
router.get('/bookings/:id', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: ['patient', 'doctor', 'surgery', 'hospital']
    });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check access rights
    const hasAccess = 
      isAdmin(req) || 
      (isPatient(req) && booking.patient_id === req.userId) ||
      (isDoctor(req) && booking.doctor_id === req.userId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    return res.json(booking);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
```

## Real-World Route Examples

### Patient Routes

```javascript
const router = require('express').Router();
const { authenticate } = require('../middleware/authenticate');
const { authorize, authorizeOwner } = require('../middleware/authorize');

// Get all patients (admin only)
router.get('/', authenticate, authorize('admin'), getAllPatients);

// Get patient by ID (patient themselves, their doctors, or admin)
router.get('/:id', authenticate, authorize('patient', 'doctor', 'admin'), getPatient);

// Create patient (public - registration)
router.post('/', createPatient);

// Update patient (patient themselves or admin)
router.put('/:id', authenticate, authorize('patient', 'admin'), authorizeOwner('id'), updatePatient);

// Delete patient (admin only)
router.delete('/:id', authenticate, authorize('admin'), deletePatient);

// Patient's medical history (patient themselves or their doctor)
router.get('/:id/medical-history', authenticate, authorize('patient', 'doctor', 'admin'), getMedicalHistory);

// Patient's bookings (patient themselves or admin)
router.get('/:id/bookings', authenticate, authorize('patient', 'admin'), authorizeOwner('id'), getPatientBookings);

module.exports = router;
```

### Doctor Routes

```javascript
const router = require('express').Router();
const { authenticate } = require('../middleware/authenticate');
const { authorize, authorizeOwner } = require('../middleware/authorize');

// Get all doctors (public with limited info, admin sees all)
router.get('/', getDoctors);

// Get doctor by ID (public)
router.get('/:id', getDoctor);

// Create doctor (public - registration)
router.post('/', createDoctor);

// Update doctor (doctor themselves or admin)
router.put('/:id', authenticate, authorize('doctor', 'admin'), authorizeOwner('id'), updateDoctor);

// Approve doctor (admin only)
router.put('/:id/approve', authenticate, authorize('admin'), approveDoctor);

// Doctor's availability (doctor themselves)
router.get('/:id/availability', authenticate, authorize('doctor', 'admin'), authorizeOwner('id'), getAvailability);
router.put('/:id/availability', authenticate, authorize('doctor', 'admin'), authorizeOwner('id'), updateAvailability);

// Doctor's bookings (doctor themselves or admin)
router.get('/:id/bookings', authenticate, authorize('doctor', 'admin'), authorizeOwner('id'), getDoctorBookings);

module.exports = router;
```

### Booking Routes

```javascript
const router = require('express').Router();
const { authenticate } = require('../middleware/authenticate');
const { authorize, authorizeRoleOwner } = require('../middleware/authorize');

// Get all bookings (role-specific filtering in controller)
router.get('/', authenticate, authorize('patient', 'doctor', 'admin'), getAllBookings);

// Get booking by ID (patient, doctor, or admin)
router.get('/:id', authenticate, authorize('patient', 'doctor', 'admin'), getBooking);

// Create booking (patient only)
router.post('/', authenticate, authorize('patient'), createBooking);

// Update booking status (doctor or admin)
router.put('/:id/status', authenticate, authorize('doctor', 'admin'), updateBookingStatus);

// Cancel booking (patient who created it or admin)
router.delete('/:id', authenticate, authorize('patient', 'admin'), cancelBooking);

module.exports = router;
```

### Admin Routes

```javascript
const router = require('express').Router();
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');

// All admin routes require admin role
router.use(authenticate, authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboard);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUser);
router.put('/users/:id/activate', activateUser);
router.put('/users/:id/deactivate', deactivateUser);

// Doctor approval
router.get('/doctors/pending', getPendingDoctors);
router.put('/doctors/:id/approve', approveDoctor);
router.put('/doctors/:id/reject', rejectDoctor);

// System settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;
```

## Error Handling

The middleware automatically returns appropriate error responses:

- **401 Unauthorized**: No token or invalid token
- **403 Forbidden**: Valid token but insufficient permissions
- **500 Internal Server Error**: Server-side error

Example error responses:

```json
// 401 - No authentication
{
  "error": "Authentication required",
  "message": "No token provided"
}

// 403 - Wrong role
{
  "error": "Forbidden",
  "message": "Access denied. Required role: admin. Your role: patient"
}

// 403 - Not resource owner
{
  "error": "Forbidden",
  "message": "You do not have permission to access this resource"
}
```

## Testing with cURL

```bash
# Login to get token
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.access_token')

# Use token in requests
curl -X GET http://localhost:8000/api/admin/users \
  -H "Authorization: Bearer $TOKEN"
```

## Best Practices

1. ✅ Always use `authenticate` before `authorize`
2. ✅ Use `authorize` for role checking, not manual `if` statements
3. ✅ Use `authorizeOwner` for resource ownership checks
4. ✅ Keep authorization logic in middleware, not controllers
5. ✅ Use descriptive error messages
6. ✅ Log authorization failures for security auditing
7. ✅ Test all permission combinations
8. ✅ Document which roles can access each endpoint
