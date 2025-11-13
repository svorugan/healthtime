# Healthtime Doctor API - Postman Testing Guide

## 📋 Table of Contents
1. [Setup Instructions](#setup-instructions)
2. [Collection Overview](#collection-overview)
3. [Testing Workflow](#testing-workflow)
4. [Sample Data](#sample-data)
5. [Common Issues](#common-issues)

---

## 🚀 Setup Instructions

### Step 1: Import Collection
1. Open Postman
2. Click **Import** button (top left)
3. Select `Doctor_API_Collection.postman_collection.json`
4. Collection will appear in your workspace

### Step 2: Configure Environment Variables
The collection uses the following variables:
- `base_url`: Default is `http://localhost:8000/api`
- `auth_token`: Auto-populated after login
- `doctor_id`: Auto-populated after doctor login

To modify base URL:
1. Click on collection name
2. Go to **Variables** tab
3. Update `base_url` value if your server runs on different port

### Step 3: Start Your Server
```bash
cd backend-node
npm start
```
Server should be running on `http://localhost:8000`

---

## 📦 Collection Overview

### Folder Structure

#### 1. **Authentication** (4 requests)
- Login as Admin
- Login as Doctor
- Register Doctor

#### 2. **Public Endpoints** (4 requests)
- Get All Approved Surgeons
- Get Surgeons by Location
- Get Doctor by ID
- Get Doctor's Surgeries

#### 3. **Doctor Protected Endpoints** (6 requests)
- Update Doctor Profile
- Update Doctor Availability
- Update Doctor Surgery Types
- Get Doctor's Bookings
- Get Doctor's Schedule
- Get Doctor's Patients

#### 4. **Admin Endpoints** (3 requests)
- Get Pending Doctors
- Approve Doctor
- Reject Doctor

#### 5. **File Upload** (1 request)
- Upload Doctor Verification Document

---

## 🧪 Testing Workflow

### Scenario 1: Register and Approve New Doctor

#### Step 1: Register a New Doctor
**Endpoint:** `POST /api/auth/register/doctor`

**Sample Request Body:**
```json
{
  "email": "dr.sharma@healthtime.com",
  "password": "doctor123",
  "full_name": "Dr. Rajesh Sharma",
  "phone": "+91-9876543210",
  "primary_specialization": "Orthopedic Surgery",
  "medical_council_number": "MCI-12345-2015",
  "medical_council_state": "Maharashtra",
  "experience_years": 15,
  "consultation_fee": 1500,
  "bio": "Experienced orthopedic surgeon specializing in joint replacement",
  "location": "Mumbai, Maharashtra",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001"
}
```

**Expected Response:**
```json
{
  "message": "Doctor registered successfully",
  "user_id": "uuid-here",
  "email": "dr.sharma@healthtime.com",
  "role": "doctor",
  "status": "pending"
}
```

#### Step 2: Login as Admin
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "admin@healthtime.com",
  "password": "admin123",
  "role": "admin"
}
```

**Note:** Token is automatically saved to collection variable `auth_token`

#### Step 3: Get Pending Doctors
**Endpoint:** `GET /api/doctors/admin/pending`

**Headers:**
- `Authorization: Bearer {{auth_token}}`

**Expected Response:**
```json
[
  {
    "id": "doctor-uuid",
    "full_name": "Dr. Rajesh Sharma",
    "email": "dr.sharma@healthtime.com",
    "phone": "+91-9876543210",
    "specialization": "Orthopedic Surgery",
    "medical_council_number": "MCI-12345-2015",
    "experience_years": 15,
    "consultation_fee": 1500,
    "bio": "Experienced orthopedic surgeon..."
  }
]
```

#### Step 4: Approve Doctor
**Endpoint:** `PATCH /api/doctors/admin/:doctor_id/approve`

Replace `:doctor_id` with actual UUID from previous response.

**Expected Response:**
```json
{
  "message": "Doctor approved successfully"
}
```

---

### Scenario 2: Doctor Profile Management

#### Step 1: Login as Doctor
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "dr.sharma@healthtime.com",
  "password": "doctor123",
  "role": "doctor"
}
```

**Note:** Both `auth_token` and `doctor_id` are automatically saved.

#### Step 2: Update Profile
**Endpoint:** `PUT /api/doctors/:doctor_id`

**Request Body:**
```json
{
  "bio": "Updated bio with more details",
  "consultation_fee": 2000,
  "surgery_fee": 150000,
  "followup_fee": 800,
  "google_reviews_link": "https://g.page/dr-sharma-reviews",
  "website_url": "https://drsharma.com",
  "linkedin_url": "https://linkedin.com/in/dr-rajesh-sharma",
  "languages_spoken": ["English", "Hindi", "Marathi"]
}
```

#### Step 3: Update Availability
**Endpoint:** `PUT /api/doctors/:doctor_id/availability`

**Request Body:**
```json
{
  "online_consultation": true,
  "in_person_consultation": true,
  "emergency_services": false,
  "online_status": true
}
```

---

### Scenario 3: Public Doctor Search

#### Step 1: Get All Approved Surgeons
**Endpoint:** `GET /api/doctors/surgeons`

**No authentication required**

**Expected Response:**
```json
[
  {
    "id": "uuid",
    "full_name": "Dr. Rajesh Sharma",
    "specialization": "Orthopedic Surgery",
    "experience_years": 15,
    "post_masters_years": 10,
    "training_type": "Fellowship",
    "fellowships": 2,
    "procedures_completed": 1200,
    "online_consultation": true,
    "location": "Mumbai, Maharashtra",
    "rating": 4.8,
    "image_url": null,
    "surgeries": []
  }
]
```

#### Step 2: Filter by Location
**Endpoint:** `GET /api/doctors/surgeons?location=Mumbai`

**Query Parameters:**
- `location`: City or state name (case-insensitive)

#### Step 3: Get Specific Doctor
**Endpoint:** `GET /api/doctors/:doctor_id`

Replace `:doctor_id` with actual UUID.

---

### Scenario 4: File Upload

#### Upload Verification Document
**Endpoint:** `POST /api/doctors/upload/verification`

**Request Type:** `form-data`

**Form Fields:**
- `file`: Select file (PDF, JPEG, PNG)
- `doctor_id`: UUID of doctor
- `document_type`: One of:
  - `medical_degree`
  - `postgraduate_degree`
  - `council_certificate`
  - `photo_id`
  - `indemnity_insurance`
  - `tax_certificate`
  - `hospital_privilege`

**Expected Response:**
```json
{
  "file_url": "https://s3-url-here",
  "file_name": "degree.pdf",
  "file_size": 1024000,
  "upload_date": "2024-01-15T10:30:00.000Z",
  "file_type": "application/pdf"
}
```

---

## 📊 Sample Data

### Complete Doctor Registration Data

```json
{
  "email": "dr.patel@healthtime.com",
  "password": "doctor123",
  "full_name": "Dr. Priya Patel",
  "phone": "+91-9876543211",
  "date_of_birth": "1985-08-22",
  "gender": "Female",
  "primary_specialization": "Cardiothoracic Surgery",
  "secondary_specializations": ["Minimally Invasive Surgery", "Cardiac Transplant"],
  "medical_council_number": "MCI-67890-2018",
  "medical_council_state": "Gujarat",
  "license_expiry_date": "2027-06-30",
  "experience_years": 10,
  "post_masters_years": 5,
  "bio": "Specialized in minimally invasive cardiac procedures",
  "consultation_fee": 2000,
  "surgery_fee": 350000,
  "followup_fee": 1000,
  "training_type": "Fellowship",
  "fellowships": 1,
  "procedures_completed": 650,
  "google_reviews_link": "https://g.page/dr-patel-reviews",
  "website_url": "https://drpriyapatel.com",
  "linkedin_url": "https://linkedin.com/in/dr-priya-patel",
  "online_consultation": true,
  "in_person_consultation": true,
  "emergency_services": true,
  "location": "Ahmedabad, Gujarat",
  "clinic_address": "456, Heart Care Center, Satellite Road",
  "city": "Ahmedabad",
  "state": "Gujarat",
  "pincode": "380015",
  "languages_spoken": ["English", "Hindi", "Gujarati"]
}
```

### More Sample Doctors
See `Sample_Doctor_Data.json` for additional sample data including:
- 3 complete doctor profiles
- Update profile examples
- Availability update examples
- Admin credentials
- Document type references

---

## 🔧 Common Issues

### Issue 1: 401 Unauthorized
**Cause:** Missing or expired authentication token

**Solution:**
1. Run login request first
2. Verify token is saved in collection variables
3. Check Authorization header format: `Bearer {{auth_token}}`

### Issue 2: 403 Forbidden
**Cause:** Insufficient permissions for the endpoint

**Solution:**
- Admin endpoints require admin login
- Doctor endpoints require doctor login with matching doctor_id
- Verify you're logged in with correct role

### Issue 3: 404 Not Found
**Cause:** Invalid doctor_id or endpoint URL

**Solution:**
1. Verify `doctor_id` variable is set correctly
2. Check endpoint URL matches server routes
3. Ensure doctor exists in database

### Issue 4: 500 Internal Server Error
**Cause:** Server-side error or database issue

**Solution:**
1. Check server console logs
2. Verify database is running
3. Check request body format matches schema
4. Ensure all required fields are provided

### Issue 5: File Upload Fails
**Cause:** Invalid file type or size

**Solution:**
- Allowed types: JPEG, PNG, PDF
- Max size: 10MB
- Use `form-data` not `raw` JSON
- Verify S3 credentials are configured

---

## 📝 Testing Checklist

### Public Endpoints
- [ ] Get all surgeons without authentication
- [ ] Filter surgeons by location
- [ ] Get specific doctor details
- [ ] Get doctor's surgery types

### Authentication
- [ ] Register new doctor
- [ ] Login as doctor
- [ ] Login as admin
- [ ] Verify token is saved

### Doctor Operations
- [ ] Update profile information
- [ ] Update availability settings
- [ ] Update surgery types
- [ ] View own bookings
- [ ] View schedule
- [ ] View patients list

### Admin Operations
- [ ] View pending doctors
- [ ] Approve doctor
- [ ] Reject doctor

### File Operations
- [ ] Upload medical degree
- [ ] Upload council certificate
- [ ] Upload photo ID
- [ ] Upload other documents

---

## 🎯 Quick Start Commands

### Test Full Workflow
1. **Register Doctor** → Authentication → Register Doctor
2. **Login Admin** → Authentication → Login as Admin
3. **Approve Doctor** → Admin Endpoints → Approve Doctor
4. **Login Doctor** → Authentication → Login as Doctor
5. **Update Profile** → Doctor Protected → Update Doctor Profile
6. **Get Surgeons** → Public Endpoints → Get All Approved Surgeons

---

## 📞 Support

For issues or questions:
- Check server logs: `backend-node/logs/`
- Review API documentation: `/api/docs`
- Verify database connection
- Check environment variables in `.env`

---

## 🔗 Related Files
- `Doctor_API_Collection.postman_collection.json` - Postman collection
- `Sample_Doctor_Data.json` - Sample data for testing
- `backend-node/src/routes/doctors.js` - API implementation
- `backend-node/src/models/Doctor.js` - Doctor model schema
