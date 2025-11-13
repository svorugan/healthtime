# Doctor API - Quick Reference Card

## 🔗 Base URL
```
http://localhost:8000/api
```

## 🔐 Authentication Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## 📍 Endpoints Quick Reference

### Public (No Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/doctors/surgeons` | Get all approved surgeons |
| GET | `/doctors/surgeons?location=Mumbai` | Filter by location |
| GET | `/doctors/:doctor_id` | Get doctor details |
| GET | `/doctors/:doctor_id/surgeries` | Get doctor's surgeries |

### Authentication

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/auth/register/doctor` | Doctor details | `user_id`, `email`, `role` |
| POST | `/auth/login` | `email`, `password`, `role` | `access_token`, `user_id` |

### Doctor Protected (Requires Doctor Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/doctors/:doctor_id` | Update profile |
| PUT | `/doctors/:doctor_id/availability` | Update availability |
| PUT | `/doctors/:doctor_id/surgeries` | Update surgery types |
| GET | `/doctors/:doctor_id/bookings` | Get bookings |
| GET | `/doctors/:doctor_id/schedule` | Get schedule |
| GET | `/doctors/:doctor_id/patients` | Get patients |

### Admin Protected (Requires Admin Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | Get all users |
| GET | `/admin/doctors` | Get all doctors |
| GET | `/admin/patients` | Get all patients |
| GET | `/admin/bookings` | Get all bookings |
| GET | `/doctors/admin/pending` | Get pending doctors |
| PATCH | `/doctors/admin/:doctor_id/approve` | Approve doctor |
| PATCH | `/doctors/admin/:doctor_id/reject` | Reject doctor |

### File Upload

| Method | Endpoint | Type | Fields |
|--------|----------|------|--------|
| POST | `/doctors/upload/verification` | form-data | `file`, `doctor_id`, `document_type` |

---

## 🎯 Quick Test Credentials

### Admin
```json
{
  "email": "admin@healthtime.com",
  "password": "admin123",
  "role": "admin"
}
```

### Doctor
```json
{
  "email": "dr.sharma@healthtime.com",
  "password": "doctor123",
  "role": "doctor"
}
```

---

## 📦 Minimal Doctor Registration

```json
{
  "email": "doctor@example.com",
  "password": "password123",
  "full_name": "Dr. John Doe",
  "phone": "+91-9876543210",
  "primary_specialization": "Orthopedic Surgery",
  "medical_council_number": "MCI-12345-2024",
  "medical_council_state": "Maharashtra",
  "experience_years": 10,
  "consultation_fee": 1500,
  "location": "Mumbai, Maharashtra",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001"
}
```

---

## 🔄 Update Profile (Minimal)

```json
{
  "bio": "Updated bio text",
  "consultation_fee": 2000,
  "online_consultation": true
}
```

---

## ⚙️ Update Availability

```json
{
  "online_consultation": true,
  "in_person_consultation": true,
  "emergency_services": false,
  "online_status": true
}
```

---

## 📄 Document Types

- `medical_degree`
- `postgraduate_degree`
- `council_certificate`
- `photo_id`
- `indemnity_insurance`
- `tax_certificate`
- `hospital_privilege`

---

## ⚡ Testing Workflow (5 Steps)

1. **Register Doctor**
   ```
   POST /api/auth/register/doctor
   ```

2. **Login as Admin**
   ```
   POST /api/auth/login
   Body: admin credentials
   ```

3. **Approve Doctor**
   ```
   PATCH /api/doctors/admin/:doctor_id/approve
   Header: Authorization: Bearer <admin_token>
   ```

4. **Login as Doctor**
   ```
   POST /api/auth/login
   Body: doctor credentials
   ```

5. **Update Profile**
   ```
   PUT /api/doctors/:doctor_id
   Header: Authorization: Bearer <doctor_token>
   ```

---

## 🐛 Common Status Codes

| Code | Meaning | Common Cause |
|------|---------|--------------|
| 200 | Success | Request completed |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid data format |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Invalid ID or endpoint |
| 500 | Server Error | Backend issue |

---

## 💡 Pro Tips

1. **Auto-save tokens**: Login requests automatically save tokens to collection variables
2. **Use variables**: `{{doctor_id}}` and `{{auth_token}}` are auto-populated
3. **Test order**: Always login before protected endpoints
4. **Check logs**: Server console shows detailed error messages
5. **File uploads**: Use form-data, not raw JSON

---

## 🔍 Query Parameters

### Get Surgeons
```
?location=Mumbai
?surgery_id=uuid-here
```

### Get Schedule
```
?start_date=2024-01-01
?end_date=2024-12-31
```

---

## 📊 Response Examples

### Success Response
```json
{
  "message": "Doctor approved successfully"
}
```

### Error Response
```json
{
  "detail": "Doctor not found"
}
```

### Doctor List Response
```json
[
  {
    "id": "uuid",
    "full_name": "Dr. Rajesh Sharma",
    "specialization": "Orthopedic Surgery",
    "experience_years": 15,
    "rating": 4.8,
    "location": "Mumbai, Maharashtra"
  }
]
```

---

## 🎨 Postman Tips

### Set Environment Variable
```javascript
pm.collectionVariables.set('auth_token', jsonData.access_token);
```

### Get Environment Variable
```javascript
pm.collectionVariables.get('auth_token');
```

### Pre-request Script (Auto-login)
```javascript
pm.sendRequest({
  url: pm.variables.get('base_url') + '/auth/login',
  method: 'POST',
  header: {'Content-Type': 'application/json'},
  body: {
    mode: 'raw',
    raw: JSON.stringify({
      email: 'admin@healthtime.com',
      password: 'admin123',
      role: 'admin'
    })
  }
}, function (err, res) {
  pm.collectionVariables.set('auth_token', res.json().access_token);
});
```

---

## 📞 Need Help?

1. Check `POSTMAN_TESTING_GUIDE.md` for detailed instructions
2. Review `Sample_Doctor_Data.json` for more examples
3. Check server logs for error details
4. Verify database connection
5. Ensure all environment variables are set

---

**Last Updated:** 2024
**API Version:** 1.0
**Server:** Node.js + PostgreSQL
