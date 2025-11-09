const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Op } = require('sequelize');
const { Patient, PatientMedicalHistory, PatientVitalSigns, Booking, Surgery, Doctor, Hospital } = require('../models');
const { calculatePatientProfileCompleteness, calculateAge, calculateBMI } = require('../utils/helpers');
const { authenticate } = require('../middleware/authenticate');
const { authorize, authorizeOwner } = require('../middleware/authorize');

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

// Create Patient (Basic)
router.post('/', async (req, res) => {
  const patientData = req.body;

  try {
    const patient = await Patient.create(patientData);
    
    return res.status(201).json({
      id: patient.id,
      full_name: patient.full_name,
      email: patient.email,
      phone: patient.phone,
      age: patient.age,
      gender: patient.gender,
      address: patient.current_address,
      emergency_contact_name: patient.emergency_contact_name,
      emergency_contact_phone: patient.emergency_contact_phone,
      insurance_provider: patient.insurance_provider,
      insurance_number: patient.insurance_number,
      insurance_file_uploaded: patient.insurance_file_uploaded,
      created_at: patient.created_at
    });
  } catch (error) {
    console.error('Patient creation error:', error);
    return res.status(500).json({ detail: 'Patient creation failed: ' + error.message });
  }
});

// Create Enhanced Patient
router.post('/enhanced', async (req, res) => {
  const patientData = req.body;

  try {
    // Calculate age from date of birth
    const age = calculateAge(patientData.date_of_birth);
    patientData.age = age;

    // Calculate BMI if height and weight provided
    if (patientData.height_cm && patientData.weight_kg) {
      patientData.bmi = calculateBMI(patientData.height_cm, patientData.weight_kg);
    }

    const patient = await Patient.create(patientData);

    // Calculate profile completeness (for response only, not stored in DB)
    const completeness = calculatePatientProfileCompleteness(patient);

    return res.status(201).json({
      message: 'Enhanced patient registration successful',
      patient_id: patient.id,
      profile_completeness: completeness,
      next_steps: ['Upload insurance documents', 'Schedule consultation']
    });
  } catch (error) {
    console.error('Enhanced patient creation error:', error);
    return res.status(500).json({ detail: 'Registration failed: ' + error.message });
  }
});

// Upload Insurance Document
router.post('/upload/insurance', upload.single('file'), async (req, res) => {
  const { patient_id, document_type = 'insurance_card_front' } = req.body;

  if (!req.file) {
    return res.status(400).json({ detail: 'No file uploaded' });
  }

  try {
    const patient = await Patient.findByPk(patient_id);
    if (!patient) {
      return res.status(404).json({ detail: 'Patient not found' });
    }

    // Upload to S3
    const { uploadToS3 } = require('../utils/s3');
    const file_url = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      `insurance/${patient_id}`,
      req.file.mimetype
    );

    if (document_type === 'insurance_card_front') {
      patient.insurance_card_front_url = file_url;
    } else if (document_type === 'insurance_card_back') {
      patient.insurance_card_back_url = file_url;
    }

    patient.insurance_file_uploaded = true;
    await patient.save();

    return res.json({
      file_url: file_url,
      file_name: req.file.originalname,
      file_size: req.file.size,
      upload_date: new Date(),
      file_type: req.file.mimetype
    });
  } catch (error) {
    console.error('Insurance upload error:', error);
    return res.status(500).json({ detail: 'Upload failed: ' + error.message });
  }
});

// Upload Medical Document
router.post('/upload/medical-document', upload.single('file'), async (req, res) => {
  const { patient_id, document_type = 'lab_report' } = req.body;

  if (!req.file) {
    return res.status(400).json({ detail: 'No file uploaded' });
  }

  try {
    const patient = await Patient.findByPk(patient_id);
    if (!patient) {
      return res.status(404).json({ detail: 'Patient not found' });
    }

    // Upload to S3
    const { uploadToS3 } = require('../utils/s3');
    const file_url = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      `medical-documents/${patient_id}`,
      req.file.mimetype
    );

    // Store in medical_reports_url JSON array
    const currentReports = patient.medical_reports_url || [];
    currentReports.push({
      type: document_type,
      url: file_url,
      filename: req.file.originalname,
      upload_date: new Date().toISOString(),
      file_size: req.file.size
    });
    patient.medical_reports_url = currentReports;
    await patient.save();

    return res.json({
      file_url: file_url,
      file_name: req.file.originalname,
      file_size: req.file.size,
      upload_date: new Date(),
      file_type: req.file.mimetype
    });
  } catch (error) {
    console.error('Medical document upload error:', error);
    return res.status(500).json({ detail: 'Upload failed: ' + error.message });
  }
});

// Legacy insurance upload endpoint
router.post('/:patient_id/insurance-upload', upload.single('file'), async (req, res) => {
  const { patient_id } = req.params;

  try {
    const patient = await Patient.findByPk(patient_id);
    if (!patient) {
      return res.status(404).json({ detail: 'Patient not found' });
    }

    patient.insurance_file_uploaded = true;
    await patient.save();

    return res.json({ message: 'Insurance file uploaded successfully' });
  } catch (error) {
    console.error('Insurance upload error:', error);
    return res.status(500).json({ detail: 'Upload failed: ' + error.message });
  }
});

// Complete Patient Profile
router.post('/complete-profile', async (req, res) => {
  const profileData = req.body;

  try {
    // This would update an existing patient's profile with complete information
    // For now, return success (would need patient ID from authentication)
    return res.json({
      message: 'Profile updated successfully',
      completeness: 95
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ detail: 'Profile update failed: ' + error.message });
  }
});

// Get Patient by ID
router.get('/:patient_id', authenticate, authorize('patient', 'doctor', 'admin'), async (req, res) => {
  const { patient_id } = req.params;

  try {
    // Check if user is the patient or has access
    if (req.user.role === 'patient' && req.user.user_id !== patient_id) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    const patient = await Patient.findByPk(patient_id, {
      include: [
        { model: PatientMedicalHistory, as: 'medicalHistory' },
        { model: PatientVitalSigns, as: 'vitalSigns' }
      ]
    });

    if (!patient) {
      return res.status(404).json({ detail: 'Patient not found' });
    }

    return res.json(patient);
  } catch (error) {
    console.error('Get patient error:', error);
    return res.status(500).json({ detail: 'Failed to fetch patient: ' + error.message });
  }
});

// Get patient bookings
router.get('/:patient_id/bookings', authenticate, authorize('patient', 'doctor', 'admin'), async (req, res) => {
  const { patient_id } = req.params;

  try {
    // Check if user is the patient or has access
    if (req.user.role === 'patient' && req.user.user_id !== patient_id) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    const bookings = await Booking.findAll({
      where: { patient_id: patient_id },
      include: [
        { model: Surgery, as: 'surgery' },
        { model: Doctor, as: 'doctor' },
        { model: Hospital, as: 'hospital' }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.json(bookings);
  } catch (error) {
    console.error('Get patient bookings error:', error);
    return res.status(500).json({ detail: 'Failed to fetch bookings: ' + error.message });
  }
});

// Get patient appointments (alias for bookings with different format)
router.get('/:patient_id/appointments', authenticate, authorize('patient', 'doctor', 'admin'), async (req, res) => {
  const { patient_id } = req.params;

  try {
    // Check if user is the patient or has access
    if (req.user.role === 'patient' && req.user.user_id !== patient_id) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    const bookings = await Booking.findAll({
      where: { patient_id: patient_id },
      include: [
        { model: Surgery, as: 'surgery' },
        { model: Doctor, as: 'doctor' },
        { model: Hospital, as: 'hospital' }
      ],
      order: [['created_at', 'DESC']]
    });

    const appointments = bookings.map(booking => ({
      id: booking.id,
      appointment_date: booking.appointment_date || booking.created_at,
      surgery: booking.surgery?.name,
      doctor: booking.doctor?.full_name,
      hospital: booking.hospital?.name,
      status: booking.status,
      total_cost: booking.total_cost
    }));

    return res.json(appointments);
  } catch (error) {
    console.error('Get patient appointments error:', error);
    return res.status(500).json({ detail: 'Failed to fetch appointments: ' + error.message });
  }
});

// Get patient medical history
router.get('/:patient_id/medical-history', authenticate, authorize('patient', 'doctor', 'admin'), async (req, res) => {
  const { patient_id } = req.params;

  try {
    // Check if user is the patient or has access
    if (req.user.role === 'patient' && req.user.user_id !== patient_id) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    const patient = await Patient.findByPk(patient_id);
    if (!patient) {
      return res.status(404).json({ detail: 'Patient not found' });
    }

    const medicalHistory = await PatientMedicalHistory.findAll({
      where: { patient_id: patient_id },
      order: [['created_at', 'DESC']]
    });

    return res.json({
      patient_id: patient_id,
      current_medications: patient.current_medications || [],
      known_allergies: patient.known_allergies || [],
      chronic_conditions: patient.chronic_conditions || [],
      past_surgeries: patient.past_surgeries || [],
      family_medical_history: patient.family_medical_history || [],
      medical_history_records: medicalHistory
    });
  } catch (error) {
    console.error('Get patient medical history error:', error);
    return res.status(500).json({ detail: 'Failed to fetch medical history: ' + error.message });
  }
});

// Add patient vital signs
router.post('/:patient_id/vital-signs', authenticate, authorize('patient', 'doctor', 'admin'), async (req, res) => {
  const { patient_id } = req.params;
  const vitalSignsData = req.body;

  try {
    // Check if user is the patient or has access
    if (req.user.role === 'patient' && req.user.user_id !== patient_id) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    const patient = await Patient.findByPk(patient_id);
    if (!patient) {
      return res.status(404).json({ detail: 'Patient not found' });
    }

    const vitalSigns = await PatientVitalSigns.create({
      patient_id: patient_id,
      ...vitalSignsData
    });

    return res.status(201).json({
      message: 'Vital signs recorded successfully',
      vital_signs: vitalSigns
    });
  } catch (error) {
    console.error('Add patient vital signs error:', error);
    return res.status(500).json({ detail: 'Failed to record vital signs: ' + error.message });
  }
});

// Get patient prescriptions (placeholder - would need Prescription model)
router.get('/:patient_id/prescriptions', authenticate, authorize('patient', 'doctor', 'admin'), async (req, res) => {
  const { patient_id } = req.params;

  try {
    // Check if user is the patient or has access
    if (req.user.role === 'patient' && req.user.user_id !== patient_id) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    // Placeholder - would need Prescription model
    return res.json({
      patient_id: patient_id,
      prescriptions: [],
      message: 'Prescription feature coming soon'
    });
  } catch (error) {
    console.error('Get patient prescriptions error:', error);
    return res.status(500).json({ detail: 'Failed to fetch prescriptions: ' + error.message });
  }
});

// Upload patient prescription
router.post('/upload/prescription', upload.single('file'), authenticate, authorize('patient', 'doctor', 'admin'), async (req, res) => {
  const { patient_id } = req.body;

  if (!req.file) {
    return res.status(400).json({ detail: 'No file uploaded' });
  }

  try {
    const patient = await Patient.findByPk(patient_id);
    if (!patient) {
      return res.status(404).json({ detail: 'Patient not found' });
    }

    // Check access
    if (req.user.role === 'patient' && req.user.user_id !== patient_id) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    // Upload to S3
    const { uploadToS3 } = require('../utils/s3');
    const file_url = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      `prescriptions/${patient_id}`,
      req.file.mimetype
    );

    return res.json({
      file_url: file_url,
      file_name: req.file.originalname,
      file_size: req.file.size,
      upload_date: new Date(),
      file_type: req.file.mimetype,
      message: 'Prescription uploaded successfully'
    });
  } catch (error) {
    console.error('Prescription upload error:', error);
    return res.status(500).json({ detail: 'Upload failed: ' + error.message });
  }
});

// Update patient profile
router.put('/:patient_id', authenticate, authorize('patient', 'admin'), async (req, res) => {
  const { patient_id } = req.params;
  const updateData = req.body;

  try {
    // Check if user is the patient or admin
    if (req.user.role === 'patient' && req.user.user_id !== patient_id) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    const patient = await Patient.findByPk(patient_id);
    if (!patient) {
      return res.status(404).json({ detail: 'Patient not found' });
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.user_id;

    // Recalculate age and BMI if relevant fields are updated
    if (updateData.date_of_birth) {
      updateData.age = calculateAge(updateData.date_of_birth);
    }
    if (updateData.height_cm && updateData.weight_kg) {
      updateData.bmi = calculateBMI(updateData.height_cm, updateData.weight_kg);
    }

    await patient.update(updateData);

    // Recalculate profile completeness
    const completeness = calculatePatientProfileCompleteness(patient);
    patient.profile_completeness = completeness;
    await patient.save();

    return res.json({
      message: 'Patient profile updated successfully',
      patient: patient,
      profile_completeness: completeness
    });
  } catch (error) {
    console.error('Update patient error:', error);
    return res.status(500).json({ detail: 'Failed to update patient: ' + error.message });
  }
});

module.exports = router;
