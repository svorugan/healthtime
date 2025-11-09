# healthtime Backend - Node.js

Node.js/Express backend for the healthtime healthcare platform, converted from Python/FastAPI. This backend maintains the same API endpoints and database schema for seamless frontend compatibility.

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT with bcrypt
- **File Upload**: Multer
- **Security**: Helmet, CORS

## Features

- ✅ Multi-role authentication (Admin, Doctor, Patient)
- ✅ Enhanced patient registration with medical history
- ✅ Doctor registration with approval workflow
- ✅ Surgery booking system
- ✅ Hospital and implant management
- ✅ File upload for insurance and medical documents
- ✅ JWT-based authentication
- ✅ Same API endpoints as Python backend

## Prerequisites

- Node.js v18 or higher
- PostgreSQL 15+
- npm or yarn

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/healthtime
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   CORS_ORIGINS=http://localhost:3000
   PORT=8000
   NODE_ENV=development
   ```

3. **Set up the database**:
   - Ensure PostgreSQL is running
   - Create the database if it doesn't exist:
     ```sql
     CREATE DATABASE healthtime;
     ```
   - Run the database schema from the parent backend folder:
     ```bash
     psql -U postgres -d healthtime -f ../backend/database_schema.sql
     ```
   - Optionally, load sample data:
     ```bash
     psql -U postgres -d healthtime -f ../backend/sample_data.sql
     ```

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:8000`

## API Endpoints

All endpoints are prefixed with `/api`

### Authentication
- `POST /api/auth/login` - Login (admin/doctor/patient)
- `POST /api/auth/register/admin` - Register admin
- `POST /api/auth/register/doctor` - Register doctor (basic)
- `POST /api/auth/register/doctor/enhanced` - Register doctor (enhanced)

### Patients
- `POST /api/patients` - Create patient (basic)
- `POST /api/patients/enhanced` - Create patient (enhanced)
- `GET /api/patients/:patient_id` - Get patient by ID (requires auth)
- `POST /api/patients/complete-profile` - Complete patient profile
- `POST /api/patients/:patient_id/insurance-upload` - Upload insurance (legacy)

### File Uploads
- `POST /api/upload/insurance` - Upload insurance documents
- `POST /api/upload/medical-document` - Upload medical documents
- `POST /api/upload/doctor-verification` - Upload doctor verification documents

### Doctors/Surgeons
- `GET /api/surgeons` - Get all approved surgeons (with filters)
- `GET /api/doctors/:doctor_id` - Get doctor by ID
- `GET /api/admin/doctors/pending` - Get pending doctors (admin only)
- `PATCH /api/admin/doctors/:doctor_id/approve` - Approve doctor (admin only)
- `PATCH /api/admin/doctors/:doctor_id/reject` - Reject doctor (admin only)

### Surgeries
- `GET /api/surgeries` - Get all surgeries
- `GET /api/surgeries/:surgery_id` - Get surgery by ID

### Implants
- `GET /api/implants` - Get all implants (with filters)
- `GET /api/implants/:implant_id` - Get implant by ID

### Hospitals
- `GET /api/hospitals` - Get all hospitals
- `GET /api/hospitals/:hospital_id` - Get hospital by ID

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:booking_id` - Get booking by ID
- `GET /api/bookings/patient/:patient_id` - Get patient bookings (requires auth)

### Admin
- `GET /api/admin/patients` - Get all patients (admin only)
- `GET /api/admin/bookings` - Get all bookings (admin only)
- `POST /api/admin/hospitals` - Create hospital (admin only)
- `DELETE /api/admin/hospitals/:hospital_id` - Delete hospital (admin only)
- `POST /api/admin/implants` - Create implant (admin only)
- `DELETE /api/admin/implants/:implant_id` - Delete implant (admin only)

## Project Structure

```
backend-node/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── models/
│   │   ├── index.js             # Model exports and relationships
│   │   ├── Patient.js           # Patient model
│   │   ├── Doctor.js            # Doctor model
│   │   ├── AdminUser.js         # Admin model
│   │   ├── Surgery.js           # Surgery model
│   │   ├── Implant.js           # Implant model
│   │   ├── Hospital.js          # Hospital model
│   │   ├── Booking.js           # Booking model
│   │   ├── PatientMedicalHistory.js
│   │   └── PatientVitalSigns.js
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── patients.js          # Patient routes
│   │   ├── doctors.js           # Doctor routes
│   │   ├── admin.js             # Admin routes
│   │   ├── surgeries.js         # Surgery routes
│   │   ├── implants.js          # Implant routes
│   │   ├── hospitals.js         # Hospital routes
│   │   └── bookings.js          # Booking routes
│   ├── middleware/
│   │   └── auth.js              # Authentication middleware
│   ├── utils/
│   │   ├── auth.js              # Auth utilities (hash, verify, JWT)
│   │   └── helpers.js           # Helper functions
│   └── server.js                # Main server file
├── .env                         # Environment variables
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore file
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## Database Models

The Node.js backend uses the same PostgreSQL database schema as the Python backend:

- **patients** - Patient information with medical history
- **patient_medical_history** - Detailed medical history records
- **patient_vital_signs** - Vital signs tracking
- **doctors** - Doctor/surgeon profiles
- **admin_users** - Admin accounts
- **surgeries** - Available surgical procedures
- **implants** - Medical implants catalog
- **hospitals** - Hospital database
- **bookings** - Surgery bookings

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Token expiration: 24 hours

## Error Handling

The API returns errors in the following format:

```json
{
  "detail": "Error message here"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Helmet.js for security headers
- CORS configuration
- Input validation using express-validator

## Differences from Python Backend

While maintaining the same API endpoints and functionality, this Node.js implementation:

1. Uses Sequelize ORM instead of SQLAlchemy
2. Uses Express.js instead of FastAPI
3. Uses Multer for file uploads instead of FastAPI's UploadFile
4. Maintains the same endpoint structure for frontend compatibility
5. Returns the same response formats

## Development

### Adding New Routes

1. Create a new route file in `src/routes/`
2. Import required models and middleware
3. Define your routes
4. Export the router
5. Import and use in `src/server.js`

### Adding New Models

1. Create a new model file in `src/models/`
2. Define the model using Sequelize
3. Add relationships in `src/models/index.js`
4. Export the model

## Testing

```bash
npm test
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists and credentials are correct

### Port Already in Use
- Change PORT in .env
- Or kill the process using the port

### CORS Issues
- Update CORS_ORIGINS in .env
- Ensure frontend URL is included

## License

MIT

## Support

For issues or questions, please contact the development team.
