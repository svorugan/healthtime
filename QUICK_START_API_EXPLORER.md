# 🚀 Quick Start: API Explorer

## Access in 3 Steps

### 1️⃣ Login as Admin
```
URL: http://localhost:4200/login
Email: admin@healthtime.com
Password: [your_admin_password]
```

### 2️⃣ Go to Admin Dashboard
```
URL: http://localhost:4200/admin
```

### 3️⃣ Click "API Explorer" Card
Look for the **purple gradient card** with 🔌 icon and "New" badge

---

## Quick Actions

### 🔍 Search Endpoints
Type in the search box: `doctors`, `POST`, `booking`, etc.

### 📖 View Endpoint Details
Click any endpoint to see:
- Full URL
- Request body schema
- Response examples
- cURL command

### 🧪 Test an Endpoint
1. Click endpoint to expand
2. Scroll to "Test Endpoint" section
3. Enter JSON body (if needed)
4. Click "🚀 Test Endpoint"
5. View response

### 📋 Copy cURL
1. Expand any endpoint
2. Scroll to "cURL Example"
3. Click "📋 Copy cURL"
4. Paste in terminal

---

## Example: Test Login Endpoint

```
1. Search for "login"
2. Click "POST /api/auth/login"
3. In test body, enter:
   {
     "email": "test@example.com",
     "password": "password123"
   }
4. Click "🚀 Test Endpoint"
5. See access token in response
```

---

## Example: Get All Doctors (Admin)

```
1. Navigate to "Admin" category
2. Click "GET /api/admin/doctors"
3. Token is auto-filled
4. Click "🚀 Test Endpoint"
5. View all doctors list
```

---

## Color Codes

- 🔵 **GET** - Blue (Retrieve data)
- 🟢 **POST** - Green (Create data)
- 🟠 **PUT** - Orange (Update data)
- 🔷 **PATCH** - Cyan (Partial update)
- 🔴 **DELETE** - Red (Delete data)

---

## Categories Available

1. 🔐 **Authentication** - Login & registration
2. 👨‍💼 **Admin** - Admin management
3. 👤 **Patients** - Patient management
4. 👨‍⚕️ **Doctors** - Doctor management
5. 🏥 **Hospitals** - Hospital management
6. 🦴 **Implants** - Implant catalog
7. 📅 **Bookings** - Surgery bookings
8. 🔔 **Notifications** - Notification system
9. 🔪 **Surgeries** - Surgery types

---

## Troubleshooting

**❌ "Failed to load API documentation"**
→ Login as admin first

**❌ "Authentication required"**
→ Check your token is valid

**❌ "Invalid JSON"**
→ Validate JSON syntax in test body

---

## Pro Tips

💡 Use search to quickly find endpoints
💡 Token is auto-filled from your login
💡 Test on real API - be careful with DELETE
💡 Copy cURL for use in scripts
💡 Expand categories to see all endpoints

---

## Need Help?

📚 Read full guide: `API_EXPLORER_GUIDE.md`
📋 Implementation details: `API_EXPLORER_SUMMARY.md`

---

**Happy Exploring! 🎉**
