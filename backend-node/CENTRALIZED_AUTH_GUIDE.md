# Centralized Authentication System Guide

## Overview

This guide explains the new centralized authentication and authorization system for healthtime. The system uses a unified `users` table for authentication with role-based access control.

## Architecture

### Database Structure

```
users (Authentication)
├── id (UUID)
├── email (unique)
├── password (hashed)
├── role (admin/doctor/patient)
├── is_active
├── email_verified
└── security fields

patients (Profile)          doctors (Profile)           admin_users (Profile)
├── id                      ├── id                      ├── id
├── user_id (FK)           ├── user_id (FK)            ├── user_id (FK)
└── patient fields         └── doctor fields           └── admin fields
```

### Key Components

1. **User Model** (`src/models/User.js`)
   - Centralized authentication
   - Role management
   - Account security (lockout, failed attempts)

2. **Authentication Middleware** (`src/middleware/authenticate.js`)
   - JWT token verification
   - User session management
   - Account status checks

3. **Authorization Middleware** (`src/middleware/authorize.js`)
   - Role-based access control
   - Resource ownership validation
   - Permission checking

4. **Centralized Auth Routes** (`src/routes/auth-centralized.js`)
   - Unified login endpoint
   - Role-specific registration
   - Profile management

## Migration Steps

### Step 1: Create Users Table

```bash
# Run the migration SQL script
psql -U your_username -d your_database -f backend-node/migrations/create_users_table.sql
```

This creates:
- `users` table with authentication fields
- Foreign key columns in profile tables
- Necessary indexes and triggers

### Step 2: Migrate Existing Data

```bash
# Backup your database first!
pg_dump -U your_username your_database > backup.sql

# Run the data migration
psql -U your_username -d your_database -f backend-node/migrations/migrate_existing_users.sql
```

This migrates:
- All admin users → users table with role='admin'
- All doctors → users table with role='doctor'
- All patients (with passwords) → users table with role='patient'

### Step 3: Update Application Code

#### Option A: Switch to New Routes (Recommended)

Update your server to use the new centralized auth routes:

```javascript
// In src/server.js or app.js
const authRoutes = require('./routes/auth-centralized');
app.use('/api/auth', authRoutes);
```

#### Option B: Keep Both Systems During Transition

```javascript
// Old routes (keep for backward compatibility)
const authRoutesOld = require('./routes/auth');
app.use('/api/auth/legacy', authRoutesOld);

// New centralized routes
const authRoutes = require('./routes/auth-centralized');
app.use('/api/auth', authRoutes);
```

## Usage Examples

### 1. Login (All User Types)

```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user_role": "patient",
  "user_id": "uuid",
  "email": "user@example.com"
}
```

### 2. Register Patient

```javascript
POST /api/auth/register/patient
Content-Type: application/json

{
  "email": "patient@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "date_of_birth": "1990-01-01",
  "gender": "male",
  // ... other patient fields
}
```

### 3. Register Doctor

```javascript
POST /api/auth/register/doctor
Content-Type: application/json

{
  "email": "doctor@example.com",
  "password": "password123",
  "full_name": "Dr. Jane Smith",
  "primary_specialization": "Cardiology",
  "medical_council_number": "MCI12345",
  "phone": "+1234567890",
  "experience_years": 10,
  "consultation_fee": 500
}
```

### 4. Protected Routes with Middleware

```javascript
const { authenticate } = require('./middleware/authenticate');
const { authorize } = require('./middleware/authorize');

// Require authentication only
router.get('/profile', authenticate, getProfile);

// Require admin role
router.get('/admin/users', authenticate, authorize('admin'), getAllUsers);

// Allow multiple roles
router.get('/bookings', authenticate, authorize('patient', 'doctor'), getBookings);

// Check resource ownership
const { authorizeOwner } = require('./middleware/authorize');
router.put('/patients/:id', authenticate, authorize('patient', 'admin'), authorizeOwner('id'), updatePatient);
```

### 5. Role Checking in Route Handlers

```javascript
const { isAdmin, isDoctor, isPatient } = require('./middleware/authorize');

router.get('/bookings/:id', authenticate, async (req, res) => {
  const booking = await Booking.findByPk(req.params.id);
  
  // Admins can see all bookings
  if (isAdmin(req)) {
    return res.json(booking);
  }
  
  // Doctors can see their bookings
  if (isDoctor(req) && booking.doctor_id === req.userId) {
    return res.json(booking);
  }
  
  // Patients can see their bookings
  if (isPatient(req) && booking.patient_id === req.userId) {
    return res.json(booking);
  }
  
  return res.status(403).json({ error: 'Forbidden' });
});
```

## Security Features

### 1. Account Lockout

After 5 failed login attempts, the account is locked for 15 minutes.

```javascript
// Automatically handled in User model
user.incrementFailedAttempts(); // Called on failed login
user.resetFailedAttempts();     // Called on successful login
user.isAccountLocked();          // Check if account is locked
```

### 2. JWT Token Security

Tokens include:
- User ID
- User role
- Expiration time (configurable in JWT_SECRET)

### 3. Password Hashing

All passwords are hashed using bcrypt with salt rounds.

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Login for all user types | No |
| POST | `/api/auth/register/admin` | Register admin user | No |
| POST | `/api/auth/register/patient` | Register patient | No |
| POST | `/api/auth/register/doctor` | Register doctor | No |
| GET | `/api/auth/me` | Get current user profile | Yes |

## Middleware Reference

### authenticate

Verifies JWT token and attaches user info to request.

```javascript
const { authenticate } = require('./middleware/authenticate');

// Adds to request:
// - req.user (User object)
// - req.userId (UUID)
// - req.userRole (string)
// - req.userEmail (string)
```

### authorize(...roles)

Checks if user has one of the specified roles.

```javascript
const { authorize } = require('./middleware/authorize');

// Admin only
authorize('admin')

// Patient or Doctor
authorize('patient', 'doctor')

// All roles
authorize('admin', 'doctor', 'patient')
```

### authorizeOwner(paramName, source)

Checks if user owns the resource or is admin.

```javascript
const { authorizeOwner } = require('./middleware/authorize');

// Check if req.params.id matches req.userId
authorizeOwner('id')

// Check if req.body.patient_id matches req.userId
authorizeOwner('patient_id', 'body')

// Check if req.query.user_id matches req.userId
authorizeOwner('user_id', 'query')
```

## Testing

### Test Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### Test Protected Route

```bash
curl -X GET http://localhost:8000/api/patients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Rollback

If you need to rollback the migration:

```bash
psql -U your_username -d your_database -f backend-node/migrations/rollback_users_table.sql
```

**Warning:** This will delete the users table. Make sure you have a backup!

## Best Practices

1. **Always use middleware** for authentication and authorization
2. **Never check roles manually** in route handlers (use middleware)
3. **Use transactions** when creating user + profile
4. **Validate input** using express-validator
5. **Log authentication events** for security auditing
6. **Keep JWT_SECRET secure** and rotate regularly
7. **Use HTTPS** in production for token transmission

## Troubleshooting

### Issue: "User not found" after migration

**Solution:** Check if the user exists in the users table:
```sql
SELECT * FROM users WHERE email = 'user@example.com';
```

### Issue: "Account locked" message

**Solution:** Reset failed attempts:
```sql
UPDATE users SET failed_login_attempts = 0, account_locked_until = NULL WHERE email = 'user@example.com';
```

### Issue: Token expired

**Solution:** Login again to get a new token. Consider implementing token refresh.

## Next Steps

1. ✅ Run database migrations
2. ✅ Test login with existing users
3. ✅ Update frontend to use new auth endpoints
4. ✅ Apply middleware to all protected routes
5. ⬜ Implement password reset functionality
6. ⬜ Add email verification
7. ⬜ Implement token refresh
8. ⬜ Add audit logging

## Support

For issues or questions, refer to:
- Database schema: `migrations/create_users_table.sql`
- Model definition: `src/models/User.js`
- Middleware: `src/middleware/authenticate.js` and `authorize.js`
- Routes: `src/routes/auth-centralized.js`
