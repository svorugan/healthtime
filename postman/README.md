# Healthtime Doctor API - Postman Testing Resources

This folder contains everything you need to test the Doctor API endpoints using Postman.

## 📁 Files in This Folder

### 1. `Doctor_API_Collection.postman_collection.json`
Complete Postman collection with all Doctor API endpoints organized into folders:
- **Authentication** - Login and registration
- **Public Endpoints** - No auth required
- **Doctor Protected Endpoints** - Requires doctor authentication
- **Admin Endpoints** - Requires admin authentication
- **File Upload** - Document upload endpoints

**Features:**
- Auto-saves authentication tokens
- Pre-configured request bodies
- Organized folder structure
- Collection variables for easy testing

### 2. `Sample_Doctor_Data.json`
Comprehensive sample data including:
- 3 complete doctor profiles with realistic data
- Update profile examples
- Availability settings
- Test credentials
- Document type references
- API endpoint summary

### 3. `POSTMAN_TESTING_GUIDE.md`
Detailed testing guide with:
- Step-by-step setup instructions
- Complete testing workflows
- Sample requests and responses
- Troubleshooting common issues
- Testing checklist

### 4. `QUICK_REFERENCE.md`
One-page quick reference card with:
- All endpoints at a glance
- Quick test credentials
- Minimal request bodies
- Common status codes
- Pro tips for testing

### 5. `README.md` (This file)
Overview of all testing resources

---

## 🚀 Quick Start

### Step 1: Import Collection
1. Open Postman
2. Click **Import** button
3. Select `Doctor_API_Collection.postman_collection.json`
4. Collection appears in your workspace

### Step 2: Start Server
```bash
cd backend-node
npm start
```

### Step 3: Test Your First Endpoint
1. Open collection → **Public Endpoints** → **Get All Approved Surgeons**
2. Click **Send**
3. View response

### Step 4: Test Protected Endpoints
1. Open **Authentication** → **Login as Admin**
2. Click **Send** (token auto-saves)
3. Open **Admin Endpoints** → **Get Pending Doctors**
4. Click **Send** (uses saved token)

---

## 📖 Documentation Structure

```
postman/
├── Doctor_API_Collection.postman_collection.json  ← Import this into Postman
├── Sample_Doctor_Data.json                        ← Copy-paste sample data
├── POSTMAN_TESTING_GUIDE.md                       ← Detailed guide
├── QUICK_REFERENCE.md                             ← Quick lookup
└── README.md                                      ← You are here
```

---

## 🎯 Common Testing Scenarios

### Scenario 1: Register and Approve New Doctor
1. Use **Register Doctor** request with sample data
2. Login as admin
3. Get pending doctors
4. Approve the doctor
5. Verify in **Get All Approved Surgeons**

**Files to use:**
- Collection: Authentication → Register Doctor
- Sample Data: `Sample_Doctor_Data.json` → `sample_doctors[0]`

### Scenario 2: Update Doctor Profile
1. Login as doctor
2. Update profile information
3. Update availability settings
4. Verify changes with **Get Doctor by ID**

**Files to use:**
- Collection: Doctor Protected Endpoints
- Sample Data: `doctor_update_profile` and `doctor_availability_update`

### Scenario 3: Search and Filter Doctors
1. Get all approved surgeons
2. Filter by location
3. Get specific doctor details
4. View doctor's surgery types

**Files to use:**
- Collection: Public Endpoints (no auth needed)

---

## 🔐 Test Credentials

### Admin Account
```json
{
  "email": "admin@healthtime.com",
  "password": "admin123",
  "role": "admin"
}
```

### Sample Doctor Account
```json
{
  "email": "dr.sharma@healthtime.com",
  "password": "doctor123",
  "role": "doctor"
}
```

**Note:** Doctor account must be registered first using the Register Doctor endpoint.

---

## 📊 API Endpoint Categories

### 1. Public Endpoints (4 endpoints)
No authentication required. Test these first!
- Get all surgeons
- Filter by location
- Get doctor details
- Get doctor's surgeries

### 2. Doctor Protected (6 endpoints)
Requires doctor login and matching doctor_id
- Update profile
- Update availability
- Update surgery types
- View bookings
- View schedule
- View patients

### 3. Admin Protected (3 endpoints)
Requires admin login
- View pending doctors
- Approve doctor
- Reject doctor

### 4. File Upload (1 endpoint)
Upload verification documents
- Supports PDF, JPEG, PNG
- Max size: 10MB

---

## 🛠️ Collection Features

### Auto-Save Tokens
Login requests automatically save tokens to collection variables:
```javascript
pm.collectionVariables.set('auth_token', jsonData.access_token);
pm.collectionVariables.set('doctor_id', jsonData.user_id);
```

### Collection Variables
- `base_url`: http://localhost:8000/api
- `auth_token`: Auto-populated after login
- `doctor_id`: Auto-populated after doctor login

### Pre-configured Requests
All requests include:
- Correct HTTP method
- Proper headers
- Sample request bodies
- URL parameters

---

## 📝 Testing Workflow

### Complete Test Flow (Recommended Order)

1. **Public Endpoints** (No auth)
   - ✅ Get All Approved Surgeons
   - ✅ Get Surgeons by Location

2. **Register New Doctor**
   - ✅ Register Doctor
   - ✅ Login as Admin
   - ✅ Get Pending Doctors
   - ✅ Approve Doctor

3. **Doctor Operations**
   - ✅ Login as Doctor
   - ✅ Update Profile
   - ✅ Update Availability
   - ✅ Get Doctor Details

4. **Verify Changes**
   - ✅ Get All Approved Surgeons (should include new doctor)
   - ✅ Get Doctor by ID (should show updates)

---

## 🐛 Troubleshooting

### Issue: 401 Unauthorized
**Solution:** Run login request first. Token auto-saves to collection variables.

### Issue: 403 Forbidden
**Solution:** Verify you're logged in with correct role (admin vs doctor).

### Issue: 404 Not Found
**Solution:** Check that `doctor_id` variable is set correctly.

### Issue: 500 Internal Server Error
**Solution:** Check server logs and verify database is running.

### Issue: File Upload Fails
**Solution:** 
- Use form-data (not raw JSON)
- Check file type (PDF, JPEG, PNG only)
- Verify file size < 10MB

---

## 📚 Additional Resources

### For Beginners
Start with: `QUICK_REFERENCE.md`
- One-page overview
- Minimal examples
- Quick credentials

### For Detailed Testing
Read: `POSTMAN_TESTING_GUIDE.md`
- Complete workflows
- Detailed examples
- Troubleshooting guide

### For Sample Data
Use: `Sample_Doctor_Data.json`
- 3 complete doctor profiles
- All update examples
- Document types reference

---

## 🎨 Customization

### Change Base URL
1. Click collection name
2. Go to **Variables** tab
3. Update `base_url` value

### Add New Requests
1. Right-click folder
2. Select **Add Request**
3. Configure method, URL, body

### Export Collection
1. Right-click collection
2. Select **Export**
3. Choose Collection v2.1 format

---

## 📞 Support

### Check These First
1. Server is running: `http://localhost:8000/api`
2. Database is connected
3. Environment variables are set in `.env`
4. Postman is up to date

### Server Logs
```bash
cd backend-node
npm start
# Watch console for errors
```

### API Documentation
Visit: `http://localhost:8000/api/docs`

---

## 🔄 Updates

### Version History
- **v1.0** - Initial release with complete Doctor API coverage

### Planned Updates
- Patient API collection
- Booking API collection
- Surgery API collection
- Hospital API collection

---

## 📖 Related Documentation

- **Backend API**: `../backend-node/src/routes/doctors.js`
- **Doctor Model**: `../backend-node/src/models/Doctor.js`
- **Server Config**: `../backend-node/src/server.js`
- **Deployment**: `../DEPLOYMENT_WORKFLOW.md`

---

## 🎯 Best Practices

1. **Always test public endpoints first** - They don't require authentication
2. **Save tokens automatically** - Use the pre-configured login requests
3. **Use collection variables** - Don't hardcode IDs in requests
4. **Check server logs** - They show detailed error messages
5. **Test in order** - Follow the recommended workflow
6. **Keep sample data handy** - Use `Sample_Doctor_Data.json` for quick testing

---

## 🏆 Quick Wins

### Test in 2 Minutes
1. Import collection
2. Start server
3. Run **Get All Approved Surgeons**
4. Done! ✅

### Full Test in 10 Minutes
1. Register doctor
2. Login as admin
3. Approve doctor
4. Login as doctor
5. Update profile
6. Verify changes
7. Done! ✅

---

**Happy Testing! 🚀**

For questions or issues, check the detailed guide in `POSTMAN_TESTING_GUIDE.md`
