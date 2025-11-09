const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Op } = require('sequelize');
const { Doctor, Booking, Patient, Surgery, DoctorSurgery, Hospital } = require('../models');
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

// Get all approved surgeons/doctors
router.get('/surgeons', async (req, res) => {
  const { surgery_id, location } = req.query;

  try {
    const whereClause = { status: 'approved' };
    
    if (location) {
      whereClause.location = { [Op.iLike]: `%${location}%` };
    }

    // Simplified query without associations for now
    const doctors = await Doctor.findAll({ 
      where: whereClause,
      order: [['rating', 'DESC'], ['experience_years', 'DESC']]
    });

    const surgeonResponse = doctors.map(doctor => ({
      id: doctor.id,
      full_name: doctor.full_name,
      specialization: doctor.primary_specialization,
      experience_years: doctor.experience_years,
      post_masters_years: Math.max(0, doctor.experience_years - 5),
      training_type: doctor.training_type,
      fellowships: doctor.fellowships,
      procedures_completed: doctor.procedures_completed,
      online_consultation: doctor.online_consultation,
      location: doctor.location,
      rating: doctor.rating,
      image_url: doctor.image_url,
      surgeries: [] // Empty for now until associations are properly set up
    }));

    return res.json(surgeonResponse);
  } catch (error) {
    console.error('Get surgeons error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ detail: 'Failed to fetch surgeons: ' + error.message });
  }
});

// Get pending doctors (Admin only)
router.get('/admin/pending', authenticate, authorize('admin'), async (req, res) => {
  try {
    const doctors = await Doctor.findAll({ where: { status: 'pending' } });

    const response = doctors.map(doctor => ({
      id: doctor.id,
      full_name: doctor.full_name,
      email: doctor.email,
      phone: doctor.phone,
      specialization: doctor.primary_specialization,
      medical_council_number: doctor.medical_council_number,
      experience_years: doctor.experience_years,
      consultation_fee: doctor.consultation_fee,
      bio: doctor.bio
    }));

    return res.json(response);
  } catch (error) {
    console.error('Get pending doctors error:', error);
    return res.status(500).json({ detail: 'Failed to fetch pending doctors: ' + error.message });
  }
});

// Approve doctor (Admin only)
router.patch('/admin/:doctor_id/approve', authenticate, authorize('admin'), async (req, res) => {
  const { doctor_id } = req.params;

  try {
    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor) {
      return res.status(404).json({ detail: 'Doctor not found' });
    }

    doctor.status = 'approved';
    doctor.approved_at = new Date();
    doctor.approved_by = req.user.user_id;
    await doctor.save();

    return res.json({ message: 'Doctor approved successfully' });
  } catch (error) {
    console.error('Approve doctor error:', error);
    return res.status(500).json({ detail: 'Failed to approve doctor: ' + error.message });
  }
});

// Reject doctor (Admin only)
router.patch('/admin/:doctor_id/reject', authenticate, authorize('admin'), async (req, res) => {
  const { doctor_id } = req.params;

  try {
    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor) {
      return res.status(404).json({ detail: 'Doctor not found' });
    }

    doctor.status = 'rejected';
    await doctor.save();

    return res.json({ message: 'Doctor rejected successfully' });
  } catch (error) {
    console.error('Reject doctor error:', error);
    return res.status(500).json({ detail: 'Failed to reject doctor: ' + error.message });
  }
});

// Upload doctor verification document
router.post('/upload/verification', upload.single('file'), async (req, res) => {
  const { doctor_id, document_type } = req.body;

  if (!req.file) {
    return res.status(400).json({ detail: 'No file uploaded' });
  }

  try {
    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor) {
      return res.status(404).json({ detail: 'Doctor not found' });
    }

    // Upload to S3
    const { uploadToS3 } = require('../utils/s3');
    const file_url = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      `doctor-verification/${doctor_id}`,
      req.file.mimetype
    );

    // Map document type to doctor field
    const documentFieldMapping = {
      'medical_degree': 'medical_degree_certificate_url',
      'postgraduate_degree': 'postgraduate_certificate_url',
      'council_certificate': 'medical_council_certificate_url',
      'photo_id': 'photo_id_url',
      'indemnity_insurance': 'indemnity_insurance_url',
      'tax_certificate': 'tax_registration_certificate_url'
    };

    if (documentFieldMapping[document_type]) {
      doctor[documentFieldMapping[document_type]] = file_url;
    } else if (document_type === 'hospital_privilege') {
      // Handle multiple hospital privilege letters
      const currentLetters = doctor.hospital_privilege_letters_url || [];
      currentLetters.push({
        url: file_url,
        filename: req.file.originalname,
        upload_date: new Date().toISOString()
      });
      doctor.hospital_privilege_letters_url = currentLetters;
    }

    await doctor.save();

    return res.json({
      file_url: file_url,
      file_name: req.file.originalname,
      file_size: req.file.size,
      upload_date: new Date(),
      file_type: req.file.mimetype
    });
  } catch (error) {
    console.error('Doctor verification upload error:', error);
    return res.status(500).json({ detail: 'Upload failed: ' + error.message });
  }
});

// Get doctor by ID
router.get('/:doctor_id', async (req, res) => {
  const { doctor_id } = req.params;

  try {
    const doctor = await Doctor.findByPk(doctor_id, {
      include: [{
        model: DoctorSurgery,
        as: 'doctorSurgeries',
        include: [{
          model: Surgery,
          as: 'surgery'
        }]
      }]
    });
    
    if (!doctor) {
      return res.status(404).json({ detail: 'Doctor not found' });
    }

    const doctorData = doctor.toJSON();
    doctorData.surgeries = doctor.doctorSurgeries ? doctor.doctorSurgeries.map(ds => ({
      id: ds.surgery?.id,
      name: ds.surgery?.name,
      is_primary: ds.is_primary,
      experience_years: ds.experience_years,
      procedures_completed: ds.procedures_completed
    })) : [];

    return res.json(doctorData);
  } catch (error) {
    console.error('Get doctor error:', error);
    return res.status(500).json({ detail: 'Failed to fetch doctor: ' + error.message });
  }
});

// Get doctor's bookings
router.get('/:doctor_id/bookings', authenticate, authorize('doctor', 'admin'), async (req, res) => {
  const { doctor_id } = req.params;

  try {
    // Check if user is the doctor or admin
    if (req.user.role === 'doctor' && req.user.user_id !== doctor_id) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    const bookings = await Booking.findAll({
      where: { doctor_id: doctor_id },
      include: [
        { model: Patient, as: 'patient' },
        { model: Surgery, as: 'surgery' },
        { model: Hospital, as: 'hospital' }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.json(bookings);
  } catch (error) {
    console.error('Get doctor bookings error:', error);
    return res.status(500).json({ detail: 'Failed to fetch bookings: ' + error.message });
  }
});

// Get doctor's schedule (placeholder - can be enhanced with calendar integration)
router.get('/:doctor_id/schedule', authenticate, authorize('doctor', 'admin'), async (req, res) => {
  const { doctor_id } = req.params;
  const { start_date, end_date } = req.query;

  try {
    // Check if user is the doctor or admin
    if (req.user.role === 'doctor' && req.user.user_id !== doctor_id) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    // Get bookings for date range
    const whereClause = { doctor_id: doctor_id };
    if (start_date && end_date) {
      whereClause.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    const bookings = await Booking.findAll({
      where: whereClause,
      include: [
        { model: Patient, as: 'patient' },
        { model: Surgery, as: 'surgery' }
      ],
      order: [['created_at', 'ASC']]
    });

    return res.json({
      doctor_id: doctor_id,
      schedule: bookings,
      message: 'Schedule retrieved successfully'
    });
  } catch (error) {
    console.error('Get doctor schedule error:', error);
    return res.status(500).json({ detail: 'Failed to fetch schedule: ' + error.message });
  }
});

// Update doctor availability
router.put('/:doctor_id/availability', authenticate, authorize('doctor'), async (req, res) => {
  const { doctor_id } = req.params;
  const { online_consultation, in_person_consultation, emergency_services, online_status } = req.body;

  try {
    // Check if user is the doctor
    if (req.user.user_id !== doctor_id) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor) {
      return res.status(404).json({ detail: 'Doctor not found' });
    }

    if (online_consultation !== undefined) doctor.online_consultation = online_consultation;
    if (in_person_consultation !== undefined) doctor.in_person_consultation = in_person_consultation;
    if (emergency_services !== undefined) doctor.emergency_services = emergency_services;
    if (online_status !== undefined) doctor.online_status = online_status;

    await doctor.save();

    return res.json({
      message: 'Availability updated successfully',
      doctor: {
        online_consultation: doctor.online_consultation,
        in_person_consultation: doctor.in_person_consultation,
        emergency_services: doctor.emergency_services,
        online_status: doctor.online_status
      }
    });
  } catch (error) {
    console.error('Update doctor availability error:', error);
    return res.status(500).json({ detail: 'Failed to update availability: ' + error.message });
  }
});

// Get doctor's patients
router.get('/:doctor_id/patients', authenticate, authorize('doctor', 'admin'), async (req, res) => {
  const { doctor_id } = req.params;

  try {
    // Check if user is the doctor or admin
    if (req.user.role === 'doctor' && req.user.user_id !== doctor_id) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    const bookings = await Booking.findAll({
      where: { doctor_id: doctor_id },
      include: [{ model: Patient, as: 'patient' }],
      attributes: []
    });

    // Get unique patients
    const patientIds = [...new Set(bookings.map(b => b.patient_id))];
    const patients = await Patient.findAll({
      where: { id: patientIds }
    });

    return res.json(patients);
  } catch (error) {
    console.error('Get doctor patients error:', error);
    return res.status(500).json({ detail: 'Failed to fetch patients: ' + error.message });
  }
});

// Update doctor profile
router.put('/:doctor_id', authenticate, authorize('doctor'), async (req, res) => {
  const { doctor_id } = req.params;
  const updateData = req.body;

  try {
    // Check if user is the doctor
    if (req.user.user_id !== doctor_id) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor) {
      return res.status(404).json({ detail: 'Doctor not found' });
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.user_id;
    delete updateData.status;
    delete updateData.approved_at;
    delete updateData.approved_by;

    await doctor.update(updateData);

    return res.json({
      message: 'Doctor profile updated successfully',
      doctor: doctor
    });
  } catch (error) {
    console.error('Update doctor error:', error);
    return res.status(500).json({ detail: 'Failed to update doctor: ' + error.message });
  }
});

// Update doctor's surgery types
router.put('/:doctor_id/surgeries', authenticate, authorize('doctor'), async (req, res) => {
  const { doctor_id } = req.params;
  const { surgery_types } = req.body;

  try {
    // Check if user is the doctor
    if (req.user.user_id !== doctor_id) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    if (!Array.isArray(surgery_types)) {
      return res.status(400).json({ detail: 'surgery_types must be an array' });
    }

    // Validate surgery IDs
    const surgeries = await Surgery.findAll({
      where: { id: surgery_types }
    });

    if (surgeries.length !== surgery_types.length) {
      return res.status(400).json({ detail: 'One or more surgery types are invalid' });
    }

    // Delete existing doctor surgeries
    await DoctorSurgery.destroy({
      where: { doctor_id: doctor_id }
    });

    // Create new doctor surgeries
    const doctorSurgeries = surgery_types.map((surgeryId, index) => ({
      doctor_id: doctor_id,
      surgery_id: surgeryId,
      is_primary: index === 0
    }));

    await DoctorSurgery.bulkCreate(doctorSurgeries);

    return res.json({
      message: 'Surgery types updated successfully',
      surgery_types: surgery_types
    });
  } catch (error) {
    console.error('Update doctor surgeries error:', error);
    return res.status(500).json({ detail: 'Failed to update surgeries: ' + error.message });
  }
});

// Get doctor's associated surgery types
router.get('/:doctor_id/surgeries', async (req, res) => {
  const { doctor_id } = req.params;

  try {
    const doctorSurgeries = await DoctorSurgery.findAll({
      where: { doctor_id: doctor_id },
      include: [{
        model: Surgery,
        as: 'surgery'
      }]
    });

    const surgeries = doctorSurgeries.map(ds => ({
      id: ds.surgery?.id,
      name: ds.surgery?.name,
      is_primary: ds.is_primary,
      experience_years: ds.experience_years,
      procedures_completed: ds.procedures_completed
    }));

    return res.json(surgeries);
  } catch (error) {
    console.error('Get doctor surgeries error:', error);
    return res.status(500).json({ detail: 'Failed to fetch surgeries: ' + error.message });
  }
});

module.exports = router;
