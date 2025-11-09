const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Hospital, Booking, HospitalUser, Patient, Doctor, Surgery } = require('../models');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF allowed'));
    }
  }
});

// Get all hospitals
router.get('/', async (req, res) => {
  try {
    const hospitals = await Hospital.findAll();
    
    const response = hospitals.map(hospital => {
      // Parse facilities if it's a string
      let facilities = hospital.facilities;
      if (typeof facilities === 'string') {
        try {
          facilities = JSON.parse(facilities);
        } catch (e) {
          facilities = [];
        }
      }

      return {
        id: hospital.id,
        name: hospital.name,
        zone: hospital.zone,
        location: hospital.location,
        address: hospital.address,
        latitude: hospital.latitude,
        longitude: hospital.longitude,
        facilities: facilities,
        insurance_accepted: hospital.insurance_accepted,
        base_price: hospital.base_price,
        consumables_cost: hospital.consumables_cost
      };
    });

    return res.json(response);
  } catch (error) {
    console.error('Get hospitals error:', error);
    return res.status(500).json({ detail: 'Failed to fetch hospitals: ' + error.message });
  }
});

// Get hospital by ID
router.get('/:hospital_id', async (req, res) => {
  const { hospital_id } = req.params;

  try {
    const hospital = await Hospital.findByPk(hospital_id);
    if (!hospital) {
      return res.status(404).json({ detail: 'Hospital not found' });
    }

    return res.json(hospital);
  } catch (error) {
    console.error('Get hospital error:', error);
    return res.status(500).json({ detail: 'Failed to fetch hospital: ' + error.message });
  }
});

// Update hospital (hospital admin only)
router.put('/:hospital_id', authenticate, authorize('hospital', 'admin'), async (req, res) => {
  const { hospital_id } = req.params;
  const updateData = req.body;

  try {
    // Check if user has access to this hospital
    if (req.user.role === 'hospital') {
      // Would need to check if user belongs to this hospital via HospitalUser
      const hospitalUser = await HospitalUser.findOne({
        where: { user_id: req.user.user_id, hospital_id: hospital_id }
      });
      if (!hospitalUser) {
        return res.status(403).json({ detail: 'Access denied' });
      }
    }

    const hospital = await Hospital.findByPk(hospital_id);
    if (!hospital) {
      return res.status(404).json({ detail: 'Hospital not found' });
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.status;

    await hospital.update(updateData);

    return res.json({
      message: 'Hospital updated successfully',
      hospital: hospital
    });
  } catch (error) {
    console.error('Update hospital error:', error);
    return res.status(500).json({ detail: 'Failed to update hospital: ' + error.message });
  }
});

// Get hospital bookings
router.get('/:hospital_id/bookings', authenticate, authorize('hospital', 'admin'), async (req, res) => {
  const { hospital_id } = req.params;

  try {
    // Check if user has access to this hospital
    if (req.user.role === 'hospital') {
      const hospitalUser = await HospitalUser.findOne({
        where: { user_id: req.user.user_id, hospital_id: hospital_id }
      });
      if (!hospitalUser) {
        return res.status(403).json({ detail: 'Access denied' });
      }
    }

    const bookings = await Booking.findAll({
      where: { hospital_id: hospital_id },
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' },
        { model: Surgery, as: 'surgery' }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.json(bookings);
  } catch (error) {
    console.error('Get hospital bookings error:', error);
    return res.status(500).json({ detail: 'Failed to fetch bookings: ' + error.message });
  }
});

// Get hospital staff
router.get('/:hospital_id/staff', authenticate, authorize('hospital', 'admin'), async (req, res) => {
  const { hospital_id } = req.params;

  try {
    // Check if user has access to this hospital
    if (req.user.role === 'hospital') {
      const hospitalUser = await HospitalUser.findOne({
        where: { user_id: req.user.user_id, hospital_id: hospital_id }
      });
      if (!hospitalUser) {
        return res.status(403).json({ detail: 'Access denied' });
      }
    }

    const staff = await HospitalUser.findAll({
      where: { hospital_id: hospital_id }
    });

    return res.json(staff);
  } catch (error) {
    console.error('Get hospital staff error:', error);
    return res.status(500).json({ detail: 'Failed to fetch staff: ' + error.message });
  }
});

// Add hospital staff
router.post('/:hospital_id/staff', authenticate, authorize('hospital', 'admin'), async (req, res) => {
  const { hospital_id } = req.params;
  const { full_name, email, phone, designation, department } = req.body;

  try {
    // Check if user has access to this hospital
    if (req.user.role === 'hospital') {
      const hospitalUser = await HospitalUser.findOne({
        where: { user_id: req.user.user_id, hospital_id: hospital_id, is_primary_admin: true }
      });
      if (!hospitalUser) {
        return res.status(403).json({ detail: 'Only primary admin can add staff' });
      }
    }

    // Check if email already exists
    const existingUser = await HospitalUser.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ detail: 'Email already registered' });
    }

    // Create user account for staff member
    const { User } = require('../models');
    const { hashPassword } = require('../utils/auth');
    const password = req.body.password || 'TempPassword123!'; // Should require password
    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'hospital',
      is_active: true,
      email_verified: false
    });

    const staffMember = await HospitalUser.create({
      id: user.id,
      user_id: user.id,
      hospital_id: hospital_id,
      full_name,
      email,
      phone,
      designation: designation || 'Staff',
      department,
      is_primary_admin: false
    });

    return res.status(201).json({
      message: 'Staff member added successfully',
      staff: staffMember
    });
  } catch (error) {
    console.error('Add hospital staff error:', error);
    return res.status(500).json({ detail: 'Failed to add staff: ' + error.message });
  }
});

// Get hospital analytics
router.get('/:hospital_id/analytics', authenticate, authorize('hospital', 'admin'), async (req, res) => {
  const { hospital_id } = req.params;

  try {
    // Check if user has access to this hospital
    if (req.user.role === 'hospital') {
      const hospitalUser = await HospitalUser.findOne({
        where: { user_id: req.user.user_id, hospital_id: hospital_id }
      });
      if (!hospitalUser) {
        return res.status(403).json({ detail: 'Access denied' });
      }
    }

    const bookings = await Booking.findAll({
      where: { hospital_id: hospital_id }
    });

    const analytics = {
      total_bookings: bookings.length,
      pending_bookings: bookings.filter(b => b.status === 'pending').length,
      confirmed_bookings: bookings.filter(b => b.status === 'confirmed').length,
      completed_bookings: bookings.filter(b => b.status === 'completed').length,
      cancelled_bookings: bookings.filter(b => b.status === 'cancelled').length,
      total_revenue: bookings.reduce((sum, b) => sum + (b.total_cost || 0), 0),
      average_booking_value: bookings.length > 0 
        ? bookings.reduce((sum, b) => sum + (b.total_cost || 0), 0) / bookings.length 
        : 0
    };

    return res.json(analytics);
  } catch (error) {
    console.error('Get hospital analytics error:', error);
    return res.status(500).json({ detail: 'Failed to fetch analytics: ' + error.message });
  }
});

// Upload hospital document
router.post('/upload/hospital-document', upload.single('file'), authenticate, authorize('hospital', 'admin'), async (req, res) => {
  const { hospital_id, document_type } = req.body;

  if (!req.file) {
    return res.status(400).json({ detail: 'No file uploaded' });
  }

  try {
    const hospital = await Hospital.findByPk(hospital_id);
    if (!hospital) {
      return res.status(404).json({ detail: 'Hospital not found' });
    }

    // Check access
    if (req.user.role === 'hospital') {
      const hospitalUser = await HospitalUser.findOne({
        where: { user_id: req.user.user_id, hospital_id: hospital_id }
      });
      if (!hospitalUser) {
        return res.status(403).json({ detail: 'Access denied' });
      }
    }

    // Upload to S3
    const { uploadToS3 } = require('../utils/s3');
    const file_url = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      `hospital-documents/${hospital_id}`,
      req.file.mimetype
    );

    // Store document URL (could be stored in a JSONB field or separate table)
    return res.json({
      file_url: file_url,
      file_name: req.file.originalname,
      file_size: req.file.size,
      upload_date: new Date(),
      file_type: req.file.mimetype,
      document_type: document_type,
      message: 'Hospital document uploaded successfully'
    });
  } catch (error) {
    console.error('Hospital document upload error:', error);
    return res.status(500).json({ detail: 'Upload failed: ' + error.message });
  }
});

module.exports = router;
