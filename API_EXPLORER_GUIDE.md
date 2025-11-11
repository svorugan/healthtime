# API Explorer Guide

## Overview

The **API Explorer** is a powerful admin-only feature that provides a comprehensive, interactive interface to explore, test, and document all backend API endpoints in the healthtime platform.

## Features

### 🔍 **Comprehensive API Documentation**
- View all available API endpoints organized by category
- See detailed information about each endpoint including:
  - HTTP method (GET, POST, PUT, PATCH, DELETE)
  - Full path and URL
  - Description
  - Authentication requirements
  - Required roles
  - Request body schema
  - Query parameters
  - Response examples

### 🧪 **Interactive Testing**
- Test any endpoint directly from the browser
- Input custom request bodies in JSON format
- Add authorization tokens
- View real-time responses with status codes
- See formatted JSON responses

### 📋 **Developer Tools**
- Generate cURL commands for any endpoint
- Copy cURL commands to clipboard
- Search and filter endpoints
- Expandable/collapsible categories
- Color-coded HTTP methods

## Access

### Prerequisites
- Must be logged in as an **admin** user
- Valid authentication token required

### How to Access

1. **Login as Admin**
   ```
   POST /api/auth/login
   {
     "email": "admin@healthtime.com",
     "password": "your_password"
   }
   ```

2. **Navigate to Admin Dashboard**
   - After login, go to `/admin` route
   - You'll see the admin dashboard with various management cards

3. **Click on "API Explorer"**
   - Look for the highlighted card with 🔌 icon
   - Click to open the API Explorer interface

## Using the API Explorer

### 1. Browse Endpoints

The API Explorer organizes endpoints into categories:

- **Authentication** - Login, registration endpoints
- **Admin** - Admin-only management endpoints
- **Patients** - Patient management
- **Doctors** - Doctor/surgeon management
- **Surgeries** - Surgery types
- **Bookings** - Booking management
- **Hospitals** - Hospital management
- **Implants** - Implant catalog management
- **Notifications** - Notification system

### 2. Search Endpoints

Use the search box at the top to filter endpoints by:
- Path (e.g., `/admin/doctors`)
- Method (e.g., `GET`, `POST`)
- Description keywords

### 3. View Endpoint Details

Click on any endpoint to see:
- Full URL
- Required roles
- Request body schema
- Query parameters
- Response examples
- cURL command

### 4. Test an Endpoint

1. Click on an endpoint to expand it
2. Scroll to the "Test Endpoint" section
3. Enter request body (if applicable) in JSON format
4. Add authorization token (auto-filled if logged in)
5. Click "🚀 Test Endpoint"
6. View the response with status code and body

### 5. Generate cURL Commands

1. Expand any endpoint
2. Scroll to "cURL Example" section
3. Click "📋 Copy cURL" to copy to clipboard
4. Use in terminal or API testing tools

## API Categories

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register/patient` - Patient registration
- `POST /api/auth/register/doctor` - Doctor registration
- `POST /api/auth/register/hospital` - Hospital registration
- `POST /api/auth/register/implant` - Implant manufacturer registration

### Admin Endpoints (Admin Only)
- `GET /api/admin/doctors` - Get all doctors
- `GET /api/admin/patients` - Get all patients
- `POST /api/admin/doctors` - Create doctor
- `POST /api/admin/patients` - Create patient
- `GET /api/admin/bookings` - Get all bookings
- `PATCH /api/admin/doctors/:doctor_id/approve` - Approve doctor
- `PATCH /api/admin/doctors/:doctor_id/reject` - Reject doctor
- `POST /api/admin/hospitals` - Create hospital
- `DELETE /api/admin/hospitals/:hospital_id` - Delete hospital
- `POST /api/admin/implants` - Create implant
- `DELETE /api/admin/implants/:implant_id` - Delete implant

### Patient Endpoints
- `GET /api/patients/:patient_id` - Get patient details
- `PUT /api/patients/:patient_id` - Update patient
- `GET /api/patients/:patient_id/bookings` - Get patient bookings
- `GET /api/patients/:patient_id/medical-history` - Get medical history
- `POST /api/patients/:patient_id/vital-signs` - Add vital signs

### Doctor Endpoints
- `GET /api/doctors/surgeons` - Get all approved surgeons
- `GET /api/doctors/:doctor_id` - Get doctor details
- `PUT /api/doctors/:doctor_id` - Update doctor profile
- `GET /api/doctors/:doctor_id/bookings` - Get doctor bookings
- `GET /api/doctors/:doctor_id/schedule` - Get doctor schedule
- `PUT /api/doctors/:doctor_id/availability` - Update availability

### Booking Endpoints
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:booking_id` - Get booking details
- `PUT /api/bookings/:booking_id` - Update booking
- `DELETE /api/bookings/:booking_id` - Cancel booking

### Hospital Endpoints
- `GET /api/hospitals` - Get all hospitals
- `GET /api/hospitals/:hospital_id` - Get hospital details
- `PUT /api/hospitals/:hospital_id` - Update hospital
- `GET /api/hospitals/:hospital_id/analytics` - Get analytics

### Implant Endpoints
- `GET /api/implants` - Get all implants
- `GET /api/implants/:implant_id` - Get implant details
- `PUT /api/implants/:implant_id` - Update implant
- `GET /api/implants/:implant_id/analytics` - Get analytics

### Notification Endpoints
- `POST /api/notifications/send` - Send notification (admin only)
- `GET /api/notifications/user/:user_id` - Get user notifications
- `PUT /api/notifications/:notification_id/read` - Mark as read

## Technical Details

### Backend Implementation

**File:** `backend-node/src/routes/api-docs.js`

The API documentation is dynamically generated and served through:
- `GET /api/docs/endpoints` - Returns complete API documentation (admin only)
- `POST /api/docs/test` - Test endpoint placeholder (admin only)

### Frontend Implementation

**File:** `frontend-angular/src/app/features/admin/api-explorer.component.ts`

The API Explorer is a standalone Angular component with:
- Responsive design
- Real-time API testing
- JSON formatting
- Error handling
- cURL generation

### Security

- All API documentation endpoints require admin authentication
- Authorization token must be provided via Bearer token
- Only admin users can access the API Explorer interface
- Test requests use the logged-in user's token

## Example Usage

### Testing a Login Endpoint

1. Navigate to API Explorer
2. Expand "Authentication" category
3. Click on `POST /api/auth/login`
4. In the test section, enter:
   ```json
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```
5. Click "🚀 Test Endpoint"
6. View the response with access token

### Testing an Admin Endpoint

1. Ensure you're logged in as admin
2. Navigate to "Admin" category
3. Click on `GET /api/admin/doctors`
4. Authorization token is auto-filled
5. Click "🚀 Test Endpoint"
6. View list of all doctors

## Troubleshooting

### "Failed to load API documentation"
- **Cause:** Not logged in as admin or invalid token
- **Solution:** Login as admin user first

### "Authentication required"
- **Cause:** Missing or invalid authorization token
- **Solution:** Ensure you're logged in and token is valid

### "Invalid JSON in request body"
- **Cause:** Malformed JSON in test body
- **Solution:** Validate JSON syntax before testing

## Future Enhancements

Potential improvements for the API Explorer:

1. **Request History** - Save and replay previous requests
2. **Collections** - Group related endpoints for batch testing
3. **Environment Variables** - Manage different API environments
4. **Export Documentation** - Generate Swagger/OpenAPI specs
5. **WebSocket Testing** - Support for real-time endpoints
6. **Mock Responses** - Generate mock data for testing
7. **API Metrics** - Track endpoint usage and performance

## Support

For issues or questions about the API Explorer:
- Check the console for detailed error messages
- Verify admin authentication
- Ensure backend server is running
- Check network connectivity

## Related Documentation

- [Backend API Documentation](./backend-node/README.md)
- [Admin Dashboard Guide](./ADMIN_GUIDE.md)
- [Authentication Guide](./AUTH_GUIDE.md)
