# Quick Start Guide - healthtime Node.js Backend

This guide will help you get the Node.js backend up and running quickly.

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js v18+ installed (`node --version`)
- ✅ PostgreSQL 15+ installed and running
- ✅ npm installed (`npm --version`)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd backend-node
npm install
```

This will install all required packages including Express, Sequelize, bcrypt, JWT, and more.

### 2. Configure Environment

The `.env` file has been created with default values. Update it if needed:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/healthtime
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGINS=http://localhost:3000
PORT=8000
NODE_ENV=development
```

**Important**: Update the database password in `DATABASE_URL` to match your PostgreSQL setup.

### 3. Database Setup

The database schema is already created in the parent `backend` folder. If you haven't set it up yet:

```bash
# Create the database (if not exists)
psql -U postgres -c "CREATE DATABASE healthtime;"

# Run the schema
psql -U postgres -d healthtime -f ../backend/database_schema.sql

# Optional: Load sample data
psql -U postgres -d healthtime -f ../backend/sample_data.sql
```

### 4. Start the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

You should see:
```
==================================================
🚀 healthtime API Server Started
==================================================
📍 Server running on: http://localhost:8000
🌐 Environment: development
📊 Database: PostgreSQL
🔐 CORS Origins: http://localhost:3000
==================================================
```

### 5. Test the API

Open your browser or use curl to test:

```bash
# Test root endpoint
curl http://localhost:8000/api

# Expected response:
# {"message":"healthtime Surgery Booking API - Node.js with PostgreSQL"}
```

### 6. Update Frontend Configuration (if needed)

Your frontend should already be configured to use `http://localhost:8000/api`. If the Python backend was running on a different port, no changes are needed as we're using the same port (8000) and endpoint structure.

## Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution**: 
- Check if PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in `.env`
- Ensure database exists: `psql -U postgres -l | grep healthtime`

### Issue: "Port 8000 already in use"
**Solution**:
- Stop the Python backend if it's running
- Or change PORT in `.env` to a different port (e.g., 8001)
- Or kill the process: `npx kill-port 8000`

### Issue: "Module not found"
**Solution**:
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then run `npm install`

### Issue: CORS errors from frontend
**Solution**:
- Ensure CORS_ORIGINS in `.env` includes your frontend URL
- Restart the server after changing `.env`

## Switching from Python to Node.js Backend

If you're switching from the Python backend:

1. **Stop the Python backend**:
   - Press `Ctrl+C` in the terminal running the Python server

2. **Start the Node.js backend**:
   ```bash
   cd backend-node
   npm run dev
   ```

3. **No frontend changes needed**:
   - The Node.js backend uses the same endpoints
   - Same port (8000)
   - Same API structure
   - Same response formats

## Testing Endpoints

### Test Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@healthtime.com","password":"admin123"}'
```

### Test Get Surgeries
```bash
curl http://localhost:8000/api/surgeries
```

### Test Get Hospitals
```bash
curl http://localhost:8000/api/hospitals
```

## Next Steps

1. ✅ Backend is running
2. Start your frontend application
3. Test the complete flow:
   - User registration
   - Login
   - Browse surgeries
   - Book a surgery

## Development Tips

- **Auto-reload**: Use `npm run dev` for automatic server restart on file changes
- **Logs**: Check console output for request logs and errors
- **Database**: Use pgAdmin or psql to inspect database directly
- **API Testing**: Use Postman, Insomnia, or curl for API testing

## Getting Help

- Check `README.md` for detailed documentation
- Review error messages in the console
- Check database logs if connection issues persist
- Ensure all environment variables are set correctly

## Success! 🎉

If you see the server startup message and can access `http://localhost:8000/api`, you're all set! Your Node.js backend is now running and ready to serve your frontend application.
