# API Manual Testing Guide - Create Random Records

This guide shows you how to manually invoke the backend APIs to create random test records using curl commands or PowerShell.

## Prerequisites

1. **Backend server running**: Ensure your backend is running at `http://localhost:8000`
2. **Database setup**: Make sure PostgreSQL is running and migrations are applied
3. **Admin credentials**: You'll need admin access for some operations

## Table of Contents

- [Authentication](#authentication)
- [Create Patients](#create-patients)
- [Create Doctors](#create-doctors)
- [Create Hospitals](#create-hospitals)
- [Create Implants](#create-implants)
- [Create Bookings](#create-bookings)
- [PowerShell Script](#powershell-script)

---

## Authentication

### 1. Register Admin User (First Time Only)

```bash
curl -X POST http://localhost:8000/api/auth/register/admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@healthtime.com",
    "password": "Admin@123",
    "full_name": "System Administrator"
  }'
```

**PowerShell:**
```powershell
$adminData = @{
    email = "admin@healthtime.com"
    password = "Admin@123"
    full_name = "System Administrator"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/auth/register/admin" `
    -Method POST `
    -ContentType "application/json" `
    -Body $adminData
```

### 2. Login to Get Token

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@healthtime.com",
    "password": "Admin@123"
  }'
```

**PowerShell:**
```powershell
$loginData = @{
    email = "admin@healthtime.com"
    password = "Admin@123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginData

$token = $response.access_token
Write-Host "Token: $token"
```

**Save the token** - You'll need it for authenticated requests!

---

## Create Patients

### Basic Patient Creation (No Auth Required)

```bash
curl -X POST http://localhost:8000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "9876543210",
    "age": 45,
    "gender": "Male",
    "current_address": "123 Main St, Mumbai",
    "emergency_contact_name": "Jane Doe",
    "emergency_contact_phone": "9876543211",
    "insurance_provider": "Star Health",
    "insurance_number": "SH123456789"
  }'
```

**PowerShell:**
```powershell
$patientData = @{
    full_name = "John Doe"
    email = "john.doe@example.com"
    phone = "9876543210"
    age = 45
    gender = "Male"
    current_address = "123 Main St, Mumbai"
    emergency_contact_name = "Jane Doe"
    emergency_contact_phone = "9876543211"
    insurance_provider = "Star Health"
    insurance_number = "SH123456789"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/patients" `
    -Method POST `
    -ContentType "application/json" `
    -Body $patientData
```

### Enhanced Patient Creation

```bash
curl -X POST http://localhost:8000/api/patients/enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Sarah Smith",
    "email": "sarah.smith@example.com",
    "phone": "9876543220",
    "date_of_birth": "1985-06-15",
    "gender": "Female",
    "blood_group": "O+",
    "height_cm": 165,
    "weight_kg": 60,
    "current_address": "456 Park Ave, Delhi",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "emergency_contact_name": "Mike Smith",
    "emergency_contact_phone": "9876543221",
    "emergency_contact_relation": "Husband",
    "insurance_provider": "ICICI Lombard",
    "insurance_number": "IL987654321",
    "current_medications": ["Aspirin", "Metformin"],
    "known_allergies": ["Penicillin"],
    "chronic_conditions": ["Diabetes Type 2"],
    "past_surgeries": ["Appendectomy (2010)"]
  }'
```

**PowerShell:**
```powershell
$enhancedPatient = @{
    full_name = "Sarah Smith"
    email = "sarah.smith@example.com"
    phone = "9876543220"
    date_of_birth = "1985-06-15"
    gender = "Female"
    blood_group = "O+"
    height_cm = 165
    weight_kg = 60
    current_address = "456 Park Ave, Delhi"
    city = "Delhi"
    state = "Delhi"
    pincode = "110001"
    emergency_contact_name = "Mike Smith"
    emergency_contact_phone = "9876543221"
    emergency_contact_relation = "Husband"
    insurance_provider = "ICICI Lombard"
    insurance_number = "IL987654321"
    current_medications = @("Aspirin", "Metformin")
    known_allergies = @("Penicillin")
    chronic_conditions = @("Diabetes Type 2")
    past_surgeries = @("Appendectomy (2010)")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/patients/enhanced" `
    -Method POST `
    -ContentType "application/json" `
    -Body $enhancedPatient
```

---

## Create Doctors

### Admin Creates Doctor (Requires Admin Token)

```bash
curl -X POST http://localhost:8000/api/admin/doctors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "full_name": "Dr. Rajesh Kumar",
    "email": "dr.rajesh@healthtime.com",
    "password": "Doctor@123",
    "phone": "9876543230",
    "primary_specialization": "Orthopedic Surgery",
    "medical_council_number": "MCI123456",
    "experience_years": 15,
    "consultation_fee": 1500,
    "surgery_fee": 50000,
    "city": "Mumbai",
    "state": "Maharashtra",
    "bio": "Experienced orthopedic surgeon specializing in joint replacements",
    "gender": "Male",
    "medical_degree": "MBBS, MS (Ortho)",
    "medical_degree_institution": "AIIMS Delhi",
    "medical_degree_year": 2005,
    "training_type": "National",
    "fellowships": 2,
    "procedures_completed": 500,
    "online_consultation": true,
    "rating": 4.8
  }'
```

**PowerShell:**
```powershell
$doctorData = @{
    full_name = "Dr. Rajesh Kumar"
    email = "dr.rajesh@healthtime.com"
    password = "Doctor@123"
    phone = "9876543230"
    primary_specialization = "Orthopedic Surgery"
    medical_council_number = "MCI123456"
    experience_years = 15
    consultation_fee = 1500
    surgery_fee = 50000
    city = "Mumbai"
    state = "Maharashtra"
    bio = "Experienced orthopedic surgeon specializing in joint replacements"
    gender = "Male"
    medical_degree = "MBBS, MS (Ortho)"
    medical_degree_institution = "AIIMS Delhi"
    medical_degree_year = 2005
    training_type = "National"
    fellowships = 2
    procedures_completed = 500
    online_consultation = $true
    rating = 4.8
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:8000/api/admin/doctors" `
    -Method POST `
    -ContentType "application/json" `
    -Headers $headers `
    -Body $doctorData
```

### Doctor Self-Registration

```bash
curl -X POST http://localhost:8000/api/auth/register/doctor \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Dr. Priya Sharma",
    "email": "dr.priya@healthtime.com",
    "password": "Doctor@456",
    "phone": "9876543240",
    "primary_specialization": "Cardiology",
    "medical_council_number": "MCI789012",
    "experience_years": 10,
    "consultation_fee": 2000,
    "city": "Bangalore",
    "state": "Karnataka"
  }'
```

---

## Create Hospitals

### Create Hospital (Requires Admin Token)

```bash
curl -X POST http://localhost:8000/api/admin/hospitals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Apollo Hospital",
    "address": "123 MG Road, Bangalore",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001",
    "phone": "080-12345678",
    "email": "contact@apollo.com",
    "type": "Multi-Specialty",
    "bed_count": 500,
    "has_emergency": true,
    "has_icu": true,
    "has_operation_theater": true,
    "accreditation": "NABH",
    "rating": 4.5
  }'
```

**PowerShell:**
```powershell
$hospitalData = @{
    name = "Apollo Hospital"
    address = "123 MG Road, Bangalore"
    city = "Bangalore"
    state = "Karnataka"
    pincode = "560001"
    phone = "080-12345678"
    email = "contact@apollo.com"
    type = "Multi-Specialty"
    bed_count = 500
    has_emergency = $true
    has_icu = $true
    has_operation_theater = $true
    accreditation = "NABH"
    rating = 4.5
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:8000/api/admin/hospitals" `
    -Method POST `
    -ContentType "application/json" `
    -Headers $headers `
    -Body $hospitalData
```

---

## Create Implants

### Create Implant (Requires Admin Token)

```bash
curl -X POST http://localhost:8000/api/admin/implants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Titanium Hip Implant",
    "manufacturer": "Stryker",
    "model_number": "STR-HIP-2024",
    "type": "Hip Replacement",
    "material": "Titanium Alloy",
    "size": "Medium",
    "price": 150000,
    "warranty_years": 10,
    "description": "High-quality titanium hip implant for total hip replacement",
    "fda_approved": true,
    "ce_certified": true
  }'
```

**PowerShell:**
```powershell
$implantData = @{
    name = "Titanium Hip Implant"
    manufacturer = "Stryker"
    model_number = "STR-HIP-2024"
    type = "Hip Replacement"
    material = "Titanium Alloy"
    size = "Medium"
    price = 150000
    warranty_years = 10
    description = "High-quality titanium hip implant for total hip replacement"
    fda_approved = $true
    ce_certified = $true
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:8000/api/admin/implants" `
    -Method POST `
    -ContentType "application/json" `
    -Headers $headers `
    -Body $implantData
```

---

## Create Bookings

### Create Booking (No Auth Required)

First, you need IDs from the database. Get them using:

```bash
# Get surgeries
curl http://localhost:8000/api/surgeries

# Get doctors
curl http://localhost:8000/api/doctors

# Get hospitals
curl http://localhost:8000/api/hospitals

# Get implants
curl http://localhost:8000/api/implants
```

Then create a booking:

```bash
curl -X POST http://localhost:8000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "PATIENT_UUID_HERE",
    "surgery_id": "SURGERY_UUID_HERE",
    "surgeon_id": "DOCTOR_UUID_HERE",
    "implant_id": "IMPLANT_UUID_HERE",
    "hospital_id": "HOSPITAL_UUID_HERE"
  }'
```

**PowerShell:**
```powershell
# Get available resources
$surgeries = Invoke-RestMethod -Uri "http://localhost:8000/api/surgeries"
$doctors = Invoke-RestMethod -Uri "http://localhost:8000/api/doctors"
$hospitals = Invoke-RestMethod -Uri "http://localhost:8000/api/hospitals"
$implants = Invoke-RestMethod -Uri "http://localhost:8000/api/implants"

# Display IDs
Write-Host "Surgeries:" $surgeries[0].id
Write-Host "Doctors:" $doctors[0].id
Write-Host "Hospitals:" $hospitals[0].id
Write-Host "Implants:" $implants[0].id

# Create booking
$bookingData = @{
    patient_id = "PATIENT_UUID_HERE"
    surgery_id = $surgeries[0].id
    surgeon_id = $doctors[0].id
    implant_id = $implants[0].id
    hospital_id = $hospitals[0].id
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/bookings" `
    -Method POST `
    -ContentType "application/json" `
    -Body $bookingData
```

---

## PowerShell Script

Save this as `create-test-data.ps1`:

```powershell
# HealthTime API Test Data Generator
# Usage: .\create-test-data.ps1

$baseUrl = "http://localhost:8000/api"

Write-Host "=== HealthTime Test Data Generator ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login as Admin
Write-Host "Step 1: Logging in as admin..." -ForegroundColor Yellow
$loginData = @{
    email = "admin@healthtime.com"
    password = "Admin@123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginData
    
    $token = $loginResponse.access_token
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Login failed. Make sure admin account exists." -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit
}

$headers = @{
    "Authorization" = "Bearer $token"
}

# Step 2: Create Patients
Write-Host "`nStep 2: Creating patients..." -ForegroundColor Yellow

$patients = @(
    @{
        full_name = "Amit Patel"
        email = "amit.patel@example.com"
        phone = "9876543210"
        date_of_birth = "1980-05-15"
        gender = "Male"
        blood_group = "A+"
        height_cm = 175
        weight_kg = 75
        current_address = "123 MG Road, Mumbai"
        city = "Mumbai"
        state = "Maharashtra"
        pincode = "400001"
        emergency_contact_name = "Priya Patel"
        emergency_contact_phone = "9876543211"
        emergency_contact_relation = "Spouse"
        insurance_provider = "Star Health"
        insurance_number = "SH123456789"
        current_medications = @("Aspirin")
        known_allergies = @()
        chronic_conditions = @()
        past_surgeries = @()
    },
    @{
        full_name = "Sunita Reddy"
        email = "sunita.reddy@example.com"
        phone = "9876543220"
        date_of_birth = "1975-08-20"
        gender = "Female"
        blood_group = "B+"
        height_cm = 160
        weight_kg = 65
        current_address = "456 Park Street, Bangalore"
        city = "Bangalore"
        state = "Karnataka"
        pincode = "560001"
        emergency_contact_name = "Ravi Reddy"
        emergency_contact_phone = "9876543221"
        emergency_contact_relation = "Husband"
        insurance_provider = "ICICI Lombard"
        insurance_number = "IL987654321"
        current_medications = @("Metformin", "Lisinopril")
        known_allergies = @("Penicillin")
        chronic_conditions = @("Diabetes Type 2", "Hypertension")
        past_surgeries = @("Appendectomy (2005)")
    },
    @{
        full_name = "Rajesh Kumar"
        email = "rajesh.kumar@example.com"
        phone = "9876543230"
        date_of_birth = "1990-12-10"
        gender = "Male"
        blood_group = "O+"
        height_cm = 180
        weight_kg = 85
        current_address = "789 Ring Road, Delhi"
        city = "Delhi"
        state = "Delhi"
        pincode = "110001"
        emergency_contact_name = "Meera Kumar"
        emergency_contact_phone = "9876543231"
        emergency_contact_relation = "Sister"
        insurance_provider = "Max Bupa"
        insurance_number = "MB456789123"
        current_medications = @()
        known_allergies = @("Sulfa drugs")
        chronic_conditions = @()
        past_surgeries = @()
    }
)

$createdPatients = @()
foreach ($patient in $patients) {
    try {
        $patientJson = $patient | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$baseUrl/patients/enhanced" `
            -Method POST `
            -ContentType "application/json" `
            -Body $patientJson
        
        $createdPatients += $response.patient_id
        Write-Host "  ✓ Created patient: $($patient.full_name)" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Failed to create patient: $($patient.full_name)" -ForegroundColor Red
        Write-Host "    Error: $_" -ForegroundColor Red
    }
}

# Step 3: Create Hospitals
Write-Host "`nStep 3: Creating hospitals..." -ForegroundColor Yellow

$hospitals = @(
    @{
        name = "Apollo Hospital"
        address = "123 MG Road, Bangalore"
        city = "Bangalore"
        state = "Karnataka"
        pincode = "560001"
        phone = "080-12345678"
        email = "contact@apollo.com"
        type = "Multi-Specialty"
        bed_count = 500
        has_emergency = $true
        has_icu = $true
        has_operation_theater = $true
        accreditation = "NABH"
        rating = 4.5
    },
    @{
        name = "Fortis Hospital"
        address = "456 Sector 62, Noida"
        city = "Noida"
        state = "Uttar Pradesh"
        pincode = "201301"
        phone = "0120-9876543"
        email = "info@fortis.com"
        type = "Multi-Specialty"
        bed_count = 400
        has_emergency = $true
        has_icu = $true
        has_operation_theater = $true
        accreditation = "NABH"
        rating = 4.3
    },
    @{
        name = "Lilavati Hospital"
        address = "789 Bandra West, Mumbai"
        city = "Mumbai"
        state = "Maharashtra"
        pincode = "400050"
        phone = "022-26567890"
        email = "contact@lilavati.com"
        type = "Multi-Specialty"
        bed_count = 350
        has_emergency = $true
        has_icu = $true
        has_operation_theater = $true
        accreditation = "NABH"
        rating = 4.6
    }
)

$createdHospitals = @()
foreach ($hospital in $hospitals) {
    try {
        $hospitalJson = $hospital | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$baseUrl/admin/hospitals" `
            -Method POST `
            -ContentType "application/json" `
            -Headers $headers `
            -Body $hospitalJson
        
        $createdHospitals += $response.id
        Write-Host "  ✓ Created hospital: $($hospital.name)" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Failed to create hospital: $($hospital.name)" -ForegroundColor Red
        Write-Host "    Error: $_" -ForegroundColor Red
    }
}

# Step 4: Create Implants
Write-Host "`nStep 4: Creating implants..." -ForegroundColor Yellow

$implants = @(
    @{
        name = "Titanium Hip Implant"
        manufacturer = "Stryker"
        model_number = "STR-HIP-2024"
        type = "Hip Replacement"
        material = "Titanium Alloy"
        size = "Medium"
        price = 150000
        warranty_years = 10
        description = "High-quality titanium hip implant"
        fda_approved = $true
        ce_certified = $true
    },
    @{
        name = "Ceramic Knee Implant"
        manufacturer = "Zimmer Biomet"
        model_number = "ZB-KNEE-2024"
        type = "Knee Replacement"
        material = "Ceramic"
        size = "Large"
        price = 180000
        warranty_years = 15
        description = "Advanced ceramic knee implant"
        fda_approved = $true
        ce_certified = $true
    },
    @{
        name = "Spinal Fusion Cage"
        manufacturer = "DePuy Synthes"
        model_number = "DS-SPINE-2024"
        type = "Spinal Fusion"
        material = "PEEK"
        size = "Standard"
        price = 200000
        warranty_years = 12
        description = "PEEK spinal fusion cage"
        fda_approved = $true
        ce_certified = $true
    }
)

$createdImplants = @()
foreach ($implant in $implants) {
    try {
        $implantJson = $implant | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$baseUrl/admin/implants" `
            -Method POST `
            -ContentType "application/json" `
            -Headers $headers `
            -Body $implantJson
        
        $createdImplants += $response.id
        Write-Host "  ✓ Created implant: $($implant.name)" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Failed to create implant: $($implant.name)" -ForegroundColor Red
        Write-Host "    Error: $_" -ForegroundColor Red
    }
}

# Step 5: Create Doctors
Write-Host "`nStep 5: Creating doctors..." -ForegroundColor Yellow

$doctors = @(
    @{
        full_name = "Dr. Rajesh Kumar"
        email = "dr.rajesh@healthtime.com"
        password = "Doctor@123"
        phone = "9876543240"
        primary_specialization = "Orthopedic Surgery"
        medical_council_number = "MCI123456"
        experience_years = 15
        consultation_fee = 1500
        surgery_fee = 50000
        city = "Mumbai"
        state = "Maharashtra"
        bio = "Experienced orthopedic surgeon specializing in joint replacements"
        gender = "Male"
        medical_degree = "MBBS, MS (Ortho)"
        medical_degree_institution = "AIIMS Delhi"
        medical_degree_year = 2005
        training_type = "National"
        fellowships = 2
        procedures_completed = 500
        online_consultation = $true
        rating = 4.8
    },
    @{
        full_name = "Dr. Priya Sharma"
        email = "dr.priya@healthtime.com"
        password = "Doctor@456"
        phone = "9876543250"
        primary_specialization = "Cardiology"
        medical_council_number = "MCI789012"
        experience_years = 12
        consultation_fee = 2000
        surgery_fee = 75000
        city = "Bangalore"
        state = "Karnataka"
        bio = "Cardiologist with expertise in interventional procedures"
        gender = "Female"
        medical_degree = "MBBS, MD (Cardio)"
        medical_degree_institution = "CMC Vellore"
        medical_degree_year = 2008
        training_type = "National"
        fellowships = 1
        procedures_completed = 350
        online_consultation = $true
        rating = 4.7
    },
    @{
        full_name = "Dr. Anil Mehta"
        email = "dr.anil@healthtime.com"
        password = "Doctor@789"
        phone = "9876543260"
        primary_specialization = "Neurosurgery"
        medical_council_number = "MCI345678"
        experience_years = 20
        consultation_fee = 2500
        surgery_fee = 100000
        city = "Delhi"
        state = "Delhi"
        bio = "Senior neurosurgeon with international training"
        gender = "Male"
        medical_degree = "MBBS, MCh (Neuro)"
        medical_degree_institution = "PGIMER Chandigarh"
        medical_degree_year = 2000
        training_type = "International"
        fellowships = 3
        procedures_completed = 800
        online_consultation = $false
        rating = 4.9
    }
)

$createdDoctors = @()
foreach ($doctor in $doctors) {
    try {
        $doctorJson = $doctor | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$baseUrl/admin/doctors" `
            -Method POST `
            -ContentType "application/json" `
            -Headers $headers `
            -Body $doctorJson
        
        $createdDoctors += $response.id
        Write-Host "  ✓ Created doctor: $($doctor.full_name)" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Failed to create doctor: $($doctor.full_name)" -ForegroundColor Red
        Write-Host "    Error: $_" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Patients created: $($createdPatients.Count)" -ForegroundColor White
Write-Host "Hospitals created: $($createdHospitals.Count)" -ForegroundColor White
Write-Host "Implants created: $($createdImplants.Count)" -ForegroundColor White
Write-Host "Doctors created: $($createdDoctors.Count)" -ForegroundColor White
Write-Host "`n✓ Test data generation complete!" -ForegroundColor Green

# Display IDs for reference
if ($createdPatients.Count -gt 0) {
    Write-Host "`nSample Patient ID: $($createdPatients[0])" -ForegroundColor Gray
}
if ($createdDoctors.Count -gt 0) {
    Write-Host "Sample Doctor ID: $($createdDoctors[0])" -ForegroundColor Gray
}
if ($createdHospitals.Count -gt 0) {
    Write-Host "Sample Hospital ID: $($createdHospitals[0])" -ForegroundColor Gray
}
if ($createdImplants.Count -gt 0) {
    Write-Host "Sample Implant ID: $($createdImplants[0])" -ForegroundColor Gray
}

Write-Host "`nYou can now create bookings using these IDs!" -ForegroundColor Yellow
```

---

## Quick Start

1. **Start your backend server:**
   ```powershell
   cd backend-node
   npm start
   ```

2. **Run the PowerShell script:**
   ```powershell
   .\create-test-data.ps1
   ```

3. **Or use individual curl/PowerShell commands** from the sections above.

---

## Tips

- **Save your admin token** after login - you'll need it for many operations
- **Get IDs first** before creating bookings (use GET endpoints)
- **Check the response** for created record IDs
- **Use Postman** as an alternative to curl for easier testing
- **Check backend logs** if requests fail

---

## Common Errors

1. **401 Unauthorized**: Token expired or missing - login again
2. **404 Not Found**: Wrong endpoint or ID doesn't exist
3. **500 Internal Server Error**: Check backend logs for details
4. **Validation errors**: Check required fields in the request body

---

## Next Steps

After creating test data:
- View records in admin dashboard
- Create bookings between patients and doctors
- Test the complete booking workflow
- Upload documents for patients
- Test authentication flows
