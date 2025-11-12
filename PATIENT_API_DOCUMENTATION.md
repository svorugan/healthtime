# Patient API Documentation

## Overview
The Patient API now follows a two-step registration process:
1. **Create User** - Creates a user account with email, password, and role='patient'
2. **Create Patient Record** - Creates the patient profile linked to the user via `user_id`

## Authentication Flow

### User Creation + Patient Registration
Both endpoints now accept `email` and `password` in the request body and automatically:
- Hash the password using bcrypt
- Create a user record with role='patient'
- Link the patient record to the user via `user_id`

---

## Endpoints

### 1. Create Patient (Basic)
**POST** `/api/patients`

Creates a user account and basic patient profile.

#### Request Body
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "date_of_birth": "1990-05-15",
  "age": 33,
  "gender": "male",
  "current_address": "123 Main St, City, State 12345",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "+1234567891",
  "insurance_provider": "Blue Cross",
  "insurance_number": "BC123456789"
}
```

#### Required Fields
- `email` (string) - Valid email address
- `password` (string) - Minimum 8 characters recommended
- `full_name` (string)
- `phone` (string)
- `date_of_birth` (date)
- `age` (integer)
- `gender` (string)
- `current_address` (text)
- `emergency_contact_name` (string)
- `emergency_contact_phone` (string)
- `insurance_provider` (string)
- `insurance_number` (string)

#### Response (201 Created)
```json
{
  "id": "uuid-patient-id",
  "user_id": "uuid-user-id",
  "email": "john.doe@example.com",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "age": 33,
  "gender": "male",
  "address": "123 Main St, City, State 12345",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "+1234567891",
  "insurance_provider": "Blue Cross",
  "insurance_number": "BC123456789",
  "insurance_file_uploaded": false,
  "created_at": "2025-11-11T22:52:00.000Z"
}
```

#### Error Responses
- **400 Bad Request** - Missing email or password
  ```json
  { "detail": "Email and password are required" }
  ```
- **400 Bad Request** - Email already exists
  ```json
  { "detail": "User with this email already exists" }
  ```
- **500 Internal Server Error** - Server error
  ```json
  { "detail": "Patient creation failed: [error message]" }
  ```

---

### 2. Create Enhanced Patient
**POST** `/api/patients/enhanced`

Creates a user account and comprehensive patient profile with medical information.

#### Request Body
```json
{
  "email": "jane.smith@example.com",
  "password": "SecurePassword456!",
  "full_name": "Jane Smith",
  "phone": "+1234567892",
  "alternate_phone": "+1234567893",
  "date_of_birth": "1985-08-20",
  "gender": "female",
  "occupation": "Software Engineer",
  "preferred_language": "English",
  "current_address": "456 Oak Ave, City, State 12345",
  "permanent_address": "789 Pine St, City, State 12345",
  "city": "Springfield",
  "state": "Illinois",
  "pincode": "62701",
  "emergency_contact_name": "John Smith",
  "emergency_contact_phone": "+1234567894",
  "emergency_contact_relationship": "Spouse",
  "preferred_communication": "email",
  "insurance_provider": "Aetna",
  "insurance_number": "AET987654321",
  "insurance_plan_type": "PPO",
  "insurance_group_number": "GRP123",
  "policy_holder_name": "Jane Smith",
  "employer_name": "Tech Corp",
  "secondary_insurance_provider": "United Healthcare",
  "secondary_insurance_number": "UHC456789",
  "preferred_payment_method": "insurance",
  "financial_assistance_needed": false,
  "insurance_preauth_status": "pending",
  "blood_group": "O+",
  "height_cm": 165,
  "weight_kg": 60,
  "smoking_status": "never",
  "alcohol_consumption": "occasional",
  "substance_use_history": "None",
  "current_medications": [
    {
      "name": "Lisinopril",
      "dosage": "10mg",
      "frequency": "once daily"
    }
  ],
  "known_allergies": [
    {
      "allergen": "Penicillin",
      "reaction": "Rash"
    }
  ],
  "chronic_conditions": [
    {
      "condition": "Hypertension",
      "diagnosed_date": "2020-01-15"
    }
  ],
  "past_surgeries": [
    {
      "surgery": "Appendectomy",
      "date": "2015-06-10",
      "hospital": "City Hospital"
    }
  ],
  "family_medical_history": [
    {
      "relation": "Mother",
      "condition": "Diabetes Type 2"
    }
  ],
  "chief_complaint": "Knee pain for 6 months",
  "current_symptoms": [
    {
      "symptom": "Knee pain",
      "severity": "moderate",
      "duration": "6 months"
    }
  ],
  "symptom_duration": "6 months",
  "pain_scale": 6,
  "primary_care_physician": "Dr. Sarah Johnson",
  "referring_doctor": "Dr. Michael Brown"
}
```

#### Required Fields
- `email` (string)
- `password` (string)
- `full_name` (string)
- `phone` (string)
- `date_of_birth` (date) - Age is auto-calculated
- `gender` (string)
- `current_address` (text)
- `emergency_contact_name` (string)
- `emergency_contact_phone` (string)
- `insurance_provider` (string)
- `insurance_number` (string)

#### Optional Fields
All other fields are optional and stored as JSONB or appropriate data types.

#### Response (201 Created)
```json
{
  "message": "Enhanced patient registration successful",
  "patient_id": "uuid-patient-id",
  "user_id": "uuid-user-id",
  "email": "jane.smith@example.com",
  "profile_completeness": 85,
  "next_steps": [
    "Upload insurance documents",
    "Schedule consultation"
  ]
}
```

#### Auto-Calculated Fields
- **age** - Calculated from `date_of_birth`
- **bmi** - Calculated from `height_cm` and `weight_kg` (if provided)

---

## Data Types Reference

### JSONB Fields
The following fields accept JSON arrays/objects:

- `current_medications` - Array of medication objects
- `known_allergies` - Array of allergy objects
- `chronic_conditions` - Array of condition objects
- `past_surgeries` - Array of surgery objects
- `family_medical_history` - Array of family history objects
- `current_symptoms` - Array of symptom objects

### String Enums
- `gender`: "male", "female", "other"
- `smoking_status`: "never", "former", "current"
- `alcohol_consumption`: "never", "occasional", "regular", "heavy"
- `preferred_communication`: "email", "phone", "sms"
- `preferred_payment_method`: "insurance", "cash", "credit_card"
- `insurance_preauth_status`: "pending", "approved", "denied"

---

## Security Notes

1. **Password Hashing**: All passwords are hashed using bcrypt with 10 salt rounds
2. **User Role**: Automatically set to 'patient' during registration
3. **Email Uniqueness**: System checks for existing users before creating new accounts
4. **Account Status**: New accounts are created with:
   - `is_active: true`
   - `email_verified: false`

---

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password` (String, Hashed)
- `role` (String) - Set to 'patient'
- `is_active` (Boolean)
- `email_verified` (Boolean)
- `last_login` (Timestamp)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Patients Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- All 54 patient-specific columns (personal, medical, insurance, etc.)

### Relationship
- One-to-One: `User.hasOne(Patient)` via `user_id`
- Cascade Delete: When user is deleted, patient record is also deleted

---

## Example Usage

### Using cURL

```bash
# Basic Patient Registration
curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "SecurePass123!",
    "full_name": "Test Patient",
    "phone": "+1234567890",
    "date_of_birth": "1990-01-01",
    "age": 34,
    "gender": "male",
    "current_address": "123 Test St",
    "emergency_contact_name": "Emergency Contact",
    "emergency_contact_phone": "+1234567891",
    "insurance_provider": "Test Insurance",
    "insurance_number": "TEST123"
  }'
```

### Using JavaScript (Fetch)

```javascript
const response = await fetch('http://localhost:3000/api/patients/enhanced', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'patient@example.com',
    password: 'SecurePass123!',
    full_name: 'Test Patient',
    phone: '+1234567890',
    date_of_birth: '1990-01-01',
    gender: 'male',
    current_address: '123 Test St',
    emergency_contact_name: 'Emergency Contact',
    emergency_contact_phone: '+1234567891',
    insurance_provider: 'Test Insurance',
    insurance_number: 'TEST123',
    height_cm: 175,
    weight_kg: 70,
    blood_group: 'A+',
    current_medications: [],
    known_allergies: []
  })
});

const data = await response.json();
console.log(data);
```

---

## Migration Notes

### Breaking Changes
- Patient endpoints now **require** `email` and `password` fields
- Direct patient creation without user account is no longer supported
- Response now includes `user_id` and `email` fields

### Backward Compatibility
If you need to support legacy systems, consider:
1. Creating a separate endpoint for admin-created patients
2. Implementing a migration script for existing patient records
3. Adding a flag to distinguish user-created vs admin-created patients
