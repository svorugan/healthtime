const express = require('express');
const router = express.Router();
const { Patient, Booking, Hospital, Implant, Doctor, User } = require('../models');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const { hashPassword } = require('../utils/auth');

// Get all users (Admin only)
router.get('/users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'role', 'is_active', 'email_verified', 'last_login', 'created_at', 'updated_at'],
      order: [['created_at', 'DESC']]
    });

    const response = users.map(u => ({
      id: u.id,
      email: u.email,
      role: u.role,
      is_active: u.is_active,
      email_verified: u.email_verified,
      last_login: u.last_login,
      created_at: u.created_at,
      updated_at: u.updated_at
    }));

    return res.json(response);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return res.status(500).json({ detail: 'Failed to fetch users: ' + error.message });
  }
});

// Get all doctors (Admin only)
router.get('/doctors', authenticate, authorize('admin'), async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      order: [['created_at', 'DESC']]
    });
    const response = doctors.map(d => ({
      id: d.id,
      full_name: d.full_name,
      email: d.email,
      phone: d.phone,
      primary_specialization: d.primary_specialization,
      medical_council_number: d.medical_council_number,
      experience_years: d.experience_years,
      consultation_fee: d.consultation_fee,
      city: d.city,
      state: d.state,
      status: d.status || 'pending',
      bio: d.bio,
      created_at: d.created_at
    }));
    return res.json(response);
  } catch (error) {
    console.error('Failed to fetch doctors:', error);
    return res.json([]);
  }
});

// Get all patients (Admin only)
router.get('/patients', authenticate, authorize('admin'), async (req, res) => {
  try {
    const patients = await Patient.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'is_active', 'email_verified', 'last_login']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    const response = patients.map(p => ({
      id: p.id,
      user_id: p.user_id,
      email: p.user?.email || null,
      full_name: p.full_name,
      phone: p.phone,
      age: p.age,
      gender: p.gender,
      date_of_birth: p.date_of_birth,
      city: p.city,
      state: p.state,
      pincode: p.pincode,
      blood_group: p.blood_group,
      insurance_provider: p.insurance_provider,
      insurance_number: p.insurance_number,
      emergency_contact_name: p.emergency_contact_name,
      emergency_contact_phone: p.emergency_contact_phone,
      is_active: p.user?.is_active,
      created_at: p.created_at
    }));
    return res.json(response);
  } catch (error) {
    console.error('Failed to fetch patients:', error);
    return res.json([]);
  }
});

// Get single patient details (Admin only)
router.get('/patients/:patient_id', authenticate, authorize('admin'), async (req, res) => {
  const { patient_id } = req.params;
  
  try {
    const patient = await Patient.findByPk(patient_id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'is_active', 'email_verified', 'last_login', 'created_at']
        }
      ]
    });

    if (!patient) {
      return res.status(404).json({ detail: 'Patient not found' });
    }

    return res.json({
      // Basic Info
      id: patient.id,
      user_id: patient.user_id,
      email: patient.user?.email,
      full_name: patient.full_name,
      phone: patient.phone,
      alternate_phone: patient.alternate_phone,
      
      // Personal Info
      date_of_birth: patient.date_of_birth,
      age: patient.age,
      gender: patient.gender,
      occupation: patient.occupation,
      preferred_language: patient.preferred_language,
      
      // Address
      current_address: patient.current_address,
      permanent_address: patient.permanent_address,
      city: patient.city,
      state: patient.state,
      pincode: patient.pincode,
      
      // Emergency Contact
      emergency_contact_name: patient.emergency_contact_name,
      emergency_contact_phone: patient.emergency_contact_phone,
      emergency_contact_relationship: patient.emergency_contact_relationship,
      
      // Communication
      preferred_communication: patient.preferred_communication,
      
      // Insurance
      insurance_provider: patient.insurance_provider,
      insurance_number: patient.insurance_number,
      insurance_plan_type: patient.insurance_plan_type,
      insurance_group_number: patient.insurance_group_number,
      policy_holder_name: patient.policy_holder_name,
      employer_name: patient.employer_name,
      secondary_insurance_provider: patient.secondary_insurance_provider,
      secondary_insurance_number: patient.secondary_insurance_number,
      insurance_card_front_url: patient.insurance_card_front_url,
      insurance_card_back_url: patient.insurance_card_back_url,
      insurance_file_uploaded: patient.insurance_file_uploaded,
      preferred_payment_method: patient.preferred_payment_method,
      financial_assistance_needed: patient.financial_assistance_needed,
      insurance_preauth_status: patient.insurance_preauth_status,
      
      // Medical Info
      blood_group: patient.blood_group,
      height_cm: patient.height_cm,
      weight_kg: patient.weight_kg,
      bmi: patient.bmi,
      smoking_status: patient.smoking_status,
      alcohol_consumption: patient.alcohol_consumption,
      substance_use_history: patient.substance_use_history,
      
      // Medical History (JSONB)
      current_medications: patient.current_medications,
      known_allergies: patient.known_allergies,
      chronic_conditions: patient.chronic_conditions,
      past_surgeries: patient.past_surgeries,
      family_medical_history: patient.family_medical_history,
      
      // Current Health
      chief_complaint: patient.chief_complaint,
      current_symptoms: patient.current_symptoms,
      symptom_duration: patient.symptom_duration,
      pain_scale: patient.pain_scale,
      
      // Healthcare Providers
      primary_care_physician: patient.primary_care_physician,
      referring_doctor: patient.referring_doctor,
      
      // User Account Info
      user_email: patient.user?.email,
      is_active: patient.user?.is_active,
      email_verified: patient.user?.email_verified,
      last_login: patient.user?.last_login || patient.last_login,
      
      // Timestamps
      created_at: patient.created_at,
      updated_at: patient.updated_at
    });
  } catch (error) {
    console.error('Failed to fetch patient:', error);
    return res.status(500).json({ detail: 'Failed to fetch patient: ' + error.message });
  }
});

// Create patient (Admin only)
router.post('/patients', authenticate, authorize('admin'), async (req, res) => {
  const patientData = req.body;

  try {
    // Hash password
    const hashedPassword = await hashPassword(patientData.password);
    
    // Create user account
    const user = await User.create({
      email: patientData.email,
      password: hashedPassword,
      role: 'patient'
    });

    // Create patient profile
    const patient = await Patient.create({
      user_id: user.id,
      full_name: patientData.full_name,
      email: patientData.email,
      phone: patientData.phone,
      date_of_birth: patientData.date_of_birth,
      gender: patientData.gender,
      blood_group: patientData.blood_group,
      address: patientData.address,
      city: patientData.city,
      state: patientData.state,
      pincode: patientData.pincode,
      emergency_contact_name: patientData.emergency_contact_name,
      emergency_contact_phone: patientData.emergency_contact_phone,
      emergency_contact_relation: patientData.emergency_contact_relation,
      medical_history: patientData.medical_history,
      current_medications: patientData.current_medications,
      allergies: patientData.allergies,
      chronic_conditions: patientData.chronic_conditions
    });

    return res.status(201).json({
      message: 'Patient created successfully',
      id: patient.id
    });
  } catch (error) {
    console.error('Patient creation error:', error);
    return res.status(400).json({ detail: error.message });
  }
});

// Create doctor (Admin only)
router.post('/doctors', authenticate, authorize('admin'), async (req, res) => {
  const doctorData = req.body;

  try {
    // Hash password
    const hashedPassword = await hashPassword(doctorData.password);
    
    // Create user account
    const user = await User.create({
      email: doctorData.email,
      password: hashedPassword,
      role: 'doctor'
    });

    // Create doctor profile
    const doctor = await Doctor.create({
      user_id: user.id,
      full_name: doctorData.full_name,
      email: doctorData.email,
      phone: doctorData.phone,
      primary_specialization: doctorData.primary_specialization,
      medical_council_number: doctorData.medical_council_number,
      experience_years: doctorData.experience_years,
      consultation_fee: doctorData.consultation_fee,
      surgery_fee: doctorData.surgery_fee,
      city: doctorData.city,
      state: doctorData.state,
      location: doctorData.location || `${doctorData.city}, ${doctorData.state}`,
      bio: doctorData.bio,
      gender: doctorData.gender,
      medical_degree: doctorData.medical_degree,
      medical_degree_institution: doctorData.medical_degree_institution,
      medical_degree_year: doctorData.medical_degree_year,
      training_type: doctorData.training_type || 'National',
      fellowships: doctorData.fellowships || 0,
      procedures_completed: doctorData.procedures_completed || 0,
      online_consultation: doctorData.online_consultation || false,
      rating: doctorData.rating || 4.0,
      image_url: doctorData.image_url,
      status: 'approved', // Auto-approve when created by admin
      verification_status: 'approved',
      approved_at: new Date(),
      approved_by: req.user.user_id
    });

    return res.status(201).json({
      message: 'Doctor created successfully',
      id: doctor.id
    });
  } catch (error) {
    console.error('Doctor creation error:', error);
    return res.status(400).json({ detail: error.message });
  }
});

// Get all bookings (Admin only)
router.get('/bookings', authenticate, authorize('admin'), async (req, res) => {
  try {
    const bookings = await Booking.findAll();
    const response = bookings.map(b => ({
      id: b.id,
      patient_id: b.patient_id,
      surgery_id: b.surgery_id,
      doctor_id: b.doctor_id,
      hospital_id: b.hospital_id,
      status: b.status,
      total_cost: b.total_cost
    }));
    return res.json(response);
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    return res.json([]);
  }
});

// Create hospital (Admin only)
router.post('/hospitals', authenticate, authorize('admin'), async (req, res) => {
  const hospitalData = req.body;

  try {
    const hospital = await Hospital.create(hospitalData);
    return res.status(201).json({
      message: 'Hospital created successfully',
      id: hospital.id
    });
  } catch (error) {
    console.error('Hospital creation error:', error);
    return res.status(400).json({ detail: error.message });
  }
});

// Delete hospital (Admin only)
router.delete('/hospitals/:hospital_id', authenticate, authorize('admin'), async (req, res) => {
  const { hospital_id } = req.params;

  try {
    const hospital = await Hospital.findByPk(hospital_id);
    if (!hospital) {
      return res.status(404).json({ detail: 'Hospital not found' });
    }

    await hospital.destroy();
    return res.json({ message: 'Hospital deleted successfully' });
  } catch (error) {
    console.error('Hospital deletion error:', error);
    return res.status(500).json({ detail: error.message });
  }
});

// Create implant (Admin only)
router.post('/implants', authenticate, authorize('admin'), async (req, res) => {
  const implantData = req.body;

  try {
    const implant = await Implant.create(implantData);
    return res.status(201).json({
      message: 'Implant created successfully',
      id: implant.id
    });
  } catch (error) {
    console.error('Implant creation error:', error);
    return res.status(400).json({ detail: error.message });
  }
});

// Delete implant (Admin only)
router.delete('/implants/:implant_id', authenticate, authorize('admin'), async (req, res) => {
  const { implant_id } = req.params;

  try {
    const implant = await Implant.findByPk(implant_id);
    if (!implant) {
      return res.status(404).json({ detail: 'Implant not found' });
    }

    await implant.destroy();
    return res.json({ message: 'Implant deleted successfully' });
  } catch (error) {
    console.error('Implant deletion error:', error);
    return res.status(500).json({ detail: error.message });
  }
});

// Approve doctor (Admin only)
router.patch('/doctors/:doctor_id/approve', authenticate, authorize('admin'), async (req, res) => {
  const { doctor_id } = req.params;

  try {
    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor) {
      return res.status(404).json({ detail: 'Doctor not found' });
    }

    // Update doctor status
    doctor.status = 'approved';
    doctor.verification_status = 'verified';
    doctor.approved_at = new Date();
    doctor.approved_by = req.user.user_id;
    await doctor.save();

    // Activate the user account in the users table
    if (doctor.user_id) {
      const user = await User.findByPk(doctor.user_id);
      if (user) {
        user.is_active = true;
        user.email_verified = true;
        await user.save();
      }
    }

    return res.json({ message: 'Doctor approved successfully', doctor });
  } catch (error) {
    console.error('Approve doctor error:', error);
    return res.status(500).json({ detail: 'Failed to approve doctor: ' + error.message });
  }
});

// Reject doctor (Admin only)
router.patch('/doctors/:doctor_id/reject', authenticate, authorize('admin'), async (req, res) => {
  const { doctor_id } = req.params;

  try {
    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor) {
      return res.status(404).json({ detail: 'Doctor not found' });
    }

    doctor.status = 'rejected';
    await doctor.save();

    return res.json({ message: 'Doctor rejected successfully', doctor });
  } catch (error) {
    console.error('Reject doctor error:', error);
    return res.status(500).json({ detail: 'Failed to reject doctor: ' + error.message });
  }
});

module.exports = router;
