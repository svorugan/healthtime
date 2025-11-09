# Admin Login Fix - Node.js Backend

## Status
✅ **The Node.js backend already has the correct implementation!**

The login endpoint in `src/routes/auth.js` properly supports:
- Admin authentication
- Doctor authentication  
- Patient authentication

All return the correct response format:
```json
{
  "access_token": "jwt_token",
  "token_type": "bearer",
  "user_role": "admin|doctor|patient",
  "user_id": "uuid"
}
```

## Frontend Changes Applied
The frontend login pages have been updated to:
1. Make proper API calls to `/api/auth/login`
2. Handle the response correctly
3. Redirect to appropriate dashboards based on role

## Test Credentials

### Admin Login
- **URL**: http://localhost:3000/login/admin
- **Email**: admin@healthtime.com
- **Password**: admin123
- **Expected**: Redirect to `/admin` dashboard

### Doctor Login
- **URL**: http://localhost:3000/login/doctor
- **Email**: (Check sample data)
- **Password**: doctor123
- **Expected**: Redirect to `/doctor` dashboard

### Patient Login
- **URL**: http://localhost:3000/login/patient
- **Email**: (Register new patient first)
- **Password**: (Set during registration)
- **Expected**: Redirect to `/` home page

## Setup Instructions

### 1. Apply Database Migration
```bash
# Connect to PostgreSQL
psql -U your_username -d healthtime

# Run the migration
\i backend-node/migrations/add_patient_password.sql
```

### 2. Start Node.js Backend
```bash
cd backend-node
npm install
npm start
# Backend runs on http://localhost:8000
```

### 3. Start Frontend
```bash
cd frontend
npm install
npm start
# Frontend runs on http://localhost:3000
```

### 4. Load Sample Data (if needed)
```bash
# From the backend folder (Python backend has the sample data)
psql -U your_username -d healthtime -f ../backend/sample_data.sql
```

## Verification Steps

1. **Backend Health Check**:
   ```bash
   curl http://localhost:8000/api/
   ```
   Should return: `{"message": "healthtime Surgery Booking API - PostgreSQL"}`

2. **Test Admin Login**:
   ```bash
   curl -X POST http://localhost:8000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@healthtime.com","password":"admin123"}'
   ```
   Should return token with `user_role: "admin"`

3. **Frontend Test**:
   - Navigate to http://localhost:3000/login/admin
   - Enter credentials
   - Should redirect to admin dashboard

## Troubleshooting

### "Invalid credentials" error
- Verify sample data is loaded
- Check password is correct (admin123)
- Verify backend is running

### Not redirecting after login
- Check browser console for errors
- Verify `REACT_APP_BACKEND_URL` environment variable
- Check network tab for API response

### CORS errors
- Verify backend CORS is configured
- Check `CORS_ORIGINS` environment variable in backend

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://username:password@localhost:5432/healthtime
JWT_SECRET=your-secret-key
JWT_EXPIRATION_HOURS=24
PORT=8000
CORS_ORIGINS=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:8000
```
