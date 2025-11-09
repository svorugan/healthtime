const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Patient, Doctor, AdminUser } = require('../models');
const { hashPassword, verifyPassword, createAccessToken } = require('../utils/auth');
const { calculatePatientProfileCompleteness, calculateDoctorProfileCompleteness, calculateAge, calculateBMI } = require('../utils/helpers');

// Login endpoint
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check admin users
    const admin = await AdminUser.findOne({ where: { email } });
    if (admin && await verifyPassword(password, admin.password)) {
      const token = createAccessToken(admin.id, 'admin');
      return res.json({
        access_token: token,
        token_type: 'bearer',
        user_role: 'admin',
        user_id: admin.id
      });
    }

    // Check doctor users
    const doctor = await Doctor.findOne({ where: { email } });
    if (doctor && await verifyPassword(password, doctor.password)) {
      const token = createAccessToken(doctor.id, 'doctor');
      return res.json({
        access_token: token,
        token_type: 'bearer',
        user_role: 'doctor',
        user_id: doctor.id
      });
    }

    // Check patient users
    const patient = await Patient.findOne({ where: { email } });
    if (patient && patient.password && await verifyPassword(password, patient.password)) {
      const token = createAccessToken(patient.id, 'patient');
      return res.json({
        access_token: token,
        token_type: 'bearer',
        user_role: 'patient',
        user_id: patient.id
      });
    }

    return res.status(401).json({ detail: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

// Register Admin
router.post('/register/admin', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('full_name').notEmpty().withMessage('Full name is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, full_name } = req.body;

  try {
    // Check if admin already exists
    const existing = await AdminUser.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ detail: 'Admin already exists' });
    }

    const hashedPassword = await hashPassword(password);
    const admin = await AdminUser.create({
      email,
      password: hashedPassword,
      full_name
    });

    return res.status(201).json({
      message: 'Admin registered successfully',
      admin_id: admin.id
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    return res.status(500).json({ detail: 'Registration failed' });
  }
});

// Register Doctor (Basic)
router.post('/register/doctor', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('specialization').notEmpty().withMessage('Specialization is required'),
  body('medical_council_number').notEmpty().withMessage('Medical council number is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('experience_years').isInt({ min: 0 }).withMessage('Experience years must be a positive number'),
  body('consultation_fee').isFloat({ min: 0 }).withMessage('Consultation fee must be a positive number')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, full_name, specialization, medical_council_number, phone, experience_years, consultation_fee, bio, google_reviews_link } = req.body;

  try {
    // Check if email already exists
    const existingEmail = await Doctor.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ detail: 'Email already registered' });
    }

    // Check if medical council number already exists
    const existingCouncil = await Doctor.findOne({ where: { medical_council_number } });
    if (existingCouncil) {
      return res.status(400).json({ detail: 'Medical council number already registered' });
    }

    const hashedPassword = await hashPassword(password);
    const doctor = await Doctor.create({
      email,
      password: hashedPassword,
      full_name,
      primary_specialization: specialization,
      medical_council_number,
      phone,
      experience_years,
      consultation_fee,
      bio,
      google_reviews_link,
      status: 'pending'
    });

    return res.status(201).json({
      message: 'Doctor registration submitted for approval',
      doctor_id: doctor.id
    });
  } catch (error) {
    console.error('Doctor registration error:', error);
    return res.status(500).json({ detail: 'Registration failed: ' + error.message });
  }
});

// Register Doctor (Enhanced)
router.post('/register/doctor/enhanced', async (req, res) => {
  const doctorData = req.body;

  try {
    // Check if email already exists
    const existingEmail = await Doctor.findOne({ where: { email: doctorData.email } });
    if (existingEmail) {
      return res.status(400).json({ detail: 'Email already registered' });
    }

    // Check if medical council number already exists
    const existingCouncil = await Doctor.findOne({ where: { medical_council_number: doctorData.medical_council_number } });
    if (existingCouncil) {
      return res.status(400).json({ detail: 'Medical council number already registered' });
    }

    const hashedPassword = await hashPassword(doctorData.password);
    doctorData.password = hashedPassword;

    const doctor = await Doctor.create(doctorData);

    // Calculate profile completeness
    const completeness = calculateDoctorProfileCompleteness(doctor);
    doctor.profile_completeness = completeness;
    await doctor.save();

    return res.status(201).json({
      message: 'Enhanced doctor registration submitted for approval',
      doctor_id: doctor.id,
      profile_completeness: completeness,
      verification_required: [
        'Medical Council Certificate',
        'Degree Certificates',
        'Photo ID',
        'Hospital Privilege Letters'
      ]
    });
  } catch (error) {
    console.error('Enhanced doctor registration error:', error);
    return res.status(500).json({ detail: 'Registration failed: ' + error.message });
  }
});

module.exports = router;
