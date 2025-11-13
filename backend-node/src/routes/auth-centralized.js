const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { User, Patient, Doctor, AdminUser, Hospital, HospitalUser, Implant, ImplantUser, Surgery, DoctorSurgery } = require('../models');
const { hashPassword, verifyPassword, createAccessToken } = require('../utils/auth');
const { calculatePatientProfileCompleteness, calculateDoctorProfileCompleteness } = require('../utils/helpers');

/**
 * Centralized Login Endpoint
 * Authenticates users from the unified users table
 */
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
    // Find user by email
    const user = await User.findActiveByEmail(email);

    if (!user) {
      return res.status(401).json({ 
        detail: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      return res.status(403).json({ 
        detail: 'Account locked',
        message: 'Your account is temporarily locked due to multiple failed login attempts. Please try again later.'
      });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      // Increment failed attempts
      await user.incrementFailedAttempts();
      
      return res.status(401).json({ 
        detail: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Reset failed attempts on successful login
    await user.resetFailedAttempts();
    
    // Update last login timestamp
    await user.updateLastLogin();

    // Generate JWT token
    const token = createAccessToken(user.id, user.role);

    return res.json({
      access_token: token,
      token_type: 'bearer',
      user_role: user.role,
      user_id: user.id,
      email: user.email
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      detail: 'Internal server error',
      message: 'An error occurred during login'
    });
  }
});

/**
 * Register Admin
 * Creates both User and AdminUser profile
 */
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
    // Check if email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        detail: 'Email already registered',
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user and admin profile in a transaction
    const result = await User.sequelize.transaction(async (t) => {
      // Create user
      const user = await User.create({
        email,
        password: hashedPassword,
        role: 'admin',
        is_active: true,
        email_verified: true
      }, { transaction: t });

      // Create admin profile
      const adminProfile = await AdminUser.create({
        id: user.id,
        user_id: user.id,
        email,
        password: hashedPassword,
        full_name,
        role: 'admin'
      }, { transaction: t });

      return { user, adminProfile };
    });

    return res.status(201).json({
      message: 'Admin registered successfully',
      user_id: result.user.id,
      admin_id: result.adminProfile.id
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    return res.status(500).json({ 
      detail: 'Registration failed',
      message: error.message
    });
  }
});

/**
 * Register Patient
 * Creates both User and Patient profile
 */
router.post('/register/patient', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('date_of_birth').notEmpty().withMessage('Date of birth is required'),
  body('gender').notEmpty().withMessage('Gender is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const patientData = req.body;

  try {
    // Check if email already exists
    const existingUser = await User.findByEmail(patientData.email);
    if (existingUser) {
      return res.status(400).json({ 
        detail: 'Email already registered',
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(patientData.password);

    // Create user and patient profile in a transaction
    const result = await User.sequelize.transaction(async (t) => {
      // Create user
      const user = await User.create({
        email: patientData.email,
        password: hashedPassword,
        role: 'patient',
        is_active: true,
        email_verified: false
      }, { transaction: t });

      // Prepare patient data
      const patientProfileData = {
        ...patientData,
        id: user.id,
        user_id: user.id,
        password: hashedPassword
      };

      // Create patient profile
      const patientProfile = await Patient.create(patientProfileData, { transaction: t });

      // Calculate profile completeness
      const completeness = calculatePatientProfileCompleteness(patientProfile);
      patientProfile.profile_completeness = completeness;
      await patientProfile.save({ transaction: t });

      return { user, patientProfile, completeness };
    });

    return res.status(201).json({
      message: 'Patient registered successfully',
      user_id: result.user.id,
      patient_id: result.patientProfile.id,
      profile_completeness: result.completeness
    });
  } catch (error) {
    console.error('Patient registration error:', error);
    return res.status(500).json({ 
      detail: 'Registration failed',
      message: error.message
    });
  }
});

/**
 * Register Doctor
 * Creates both User and Doctor profile
 */
router.post('/register/doctor', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('primary_specialization').notEmpty().withMessage('Specialization is required'),
  body('medical_council_number').notEmpty().withMessage('Medical council number is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('experience_years').isInt({ min: 0 }).withMessage('Experience years must be a positive number'),
  body('consultation_fee').isFloat({ min: 0 }).withMessage('Consultation fee must be a positive number')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const doctorData = req.body;

  try {
    // Check if email already exists
    const existingUser = await User.findByEmail(doctorData.email);
    if (existingUser) {
      return res.status(400).json({ 
        detail: 'Email already registered',
        message: 'An account with this email already exists'
      });
    }

    // Check if medical council number already exists
    const existingCouncil = await Doctor.findOne({ 
      where: { medical_council_number: doctorData.medical_council_number } 
    });
    if (existingCouncil) {
      return res.status(400).json({ 
        detail: 'Medical council number already registered',
        message: 'This medical council number is already in use'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(doctorData.password);

    // Create user and doctor profile in a transaction
    const result = await User.sequelize.transaction(async (t) => {
      // Create user (inactive until approved)
      const user = await User.create({
        email: doctorData.email,
        password: hashedPassword,
        role: 'doctor',
        is_active: false, // Doctors need approval
        email_verified: false
      }, { transaction: t });

      // Prepare doctor data (exclude email and password as they're in users table)
      const { email, password, ...doctorProfileFields } = doctorData;
      const doctorProfileData = {
        ...doctorProfileFields,
        id: user.id,
        user_id: user.id,
        status: 'pending'
      };

      // Create doctor profile
      const doctorProfile = await Doctor.create(doctorProfileData, { transaction: t });

      // Handle surgery types if provided
      if (doctorData.surgery_types && Array.isArray(doctorData.surgery_types) && doctorData.surgery_types.length > 0) {
        // Validate that all surgery IDs exist
        const surgeries = await Surgery.findAll({
          where: { id: doctorData.surgery_types },
          transaction: t
        });

        if (surgeries.length !== doctorData.surgery_types.length) {
          throw new Error('One or more surgery types are invalid');
        }

        // Create DoctorSurgery records
        const doctorSurgeries = doctorData.surgery_types.map((surgeryId, index) => ({
          doctor_id: doctorProfile.id,
          surgery_id: surgeryId,
          is_primary: index === 0, // First surgery is primary
          experience_years: doctorData.surgery_experience_years?.[index] || doctorData.experience_years || 0,
          procedures_completed: doctorData.surgery_procedures_completed?.[index] || 0
        }));

        await DoctorSurgery.bulkCreate(doctorSurgeries, { transaction: t });
      }

      // Calculate profile completeness
      const completeness = calculateDoctorProfileCompleteness(doctorProfile);
      doctorProfile.profile_completeness = completeness;
      await doctorProfile.save({ transaction: t });

      return { user, doctorProfile, completeness };
    });

    return res.status(201).json({
      message: 'Doctor registration submitted for approval',
      user_id: result.user.id,
      doctor_id: result.doctorProfile.id,
      profile_completeness: result.completeness,
      status: 'pending_approval'
    });
  } catch (error) {
    console.error('Doctor registration error:', error);
    return res.status(500).json({ 
      detail: 'Registration failed',
      message: error.message
    });
  }
});

/**
 * Register Doctor (Enhanced)
 * Creates Doctor profile with enhanced data
 */
router.post('/register/doctor/enhanced', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('primary_specialization').notEmpty().withMessage('Primary specialization is required'),
  body('medical_council_number').notEmpty().withMessage('Medical council number is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const doctorData = req.body;

  try {
    // Check if email already exists in users table
    const existingUser = await User.findByEmail(doctorData.email);
    if (existingUser) {
      return res.status(400).json({ 
        detail: 'Email already registered',
        message: 'An account with this email already exists'
      });
    }

    // Check if medical council number already exists
    const existingCouncil = await Doctor.findOne({ where: { medical_council_number: doctorData.medical_council_number } });
    if (existingCouncil) {
      return res.status(400).json({ 
        detail: 'Medical council number already registered',
        message: 'This medical council number is already in use'
      });
    }

    const hashedPassword = await hashPassword(doctorData.password);

    // Map frontend fields to database schema
    // Use total_experience_years if provided, otherwise use experience_years
    const experience = doctorData.total_experience_years || doctorData.experience_years || 0;
    
    // Create user and doctor profile in a transaction
    const result = await User.sequelize.transaction(async (t) => {
      // Create user (inactive until approved)
      const user = await User.create({
        email: doctorData.email,
        password: hashedPassword,
        role: 'doctor',
        is_active: false, // Doctors need approval
        email_verified: false
      }, { transaction: t });

      // Prepare doctor data with proper field mapping (exclude email and password)
      const doctorProfileData = {
        id: user.id,
        user_id: user.id,
        full_name: doctorData.full_name,
        phone: doctorData.phone,
        date_of_birth: doctorData.date_of_birth,
        gender: doctorData.gender,
        
        // Professional credentials
        primary_specialization: doctorData.primary_specialization,
        secondary_specializations: doctorData.secondary_specializations || [],
        medical_council_number: doctorData.medical_council_number,
        medical_council_state: doctorData.medical_council_state,
        
        // Experience - map total_experience_years to experience_years
        experience_years: experience,
        post_masters_years: doctorData.post_masters_years || 0,
        
        // Fees
        consultation_fee: doctorData.consultation_fee || 0,
        surgery_fee: doctorData.surgery_fee || 0,
        followup_fee: doctorData.followup_fee,
        
        // Training
        training_type: doctorData.training_type,
        fellowships: doctorData.fellowship_details?.length || 0,
        procedures_completed: doctorData.total_surgeries_performed || 0,
        
        // Online presence
        google_reviews_link: doctorData.google_reviews_link,
        website_url: doctorData.professional_website,
        linkedin_url: doctorData.linkedin_profile,
        
        // Services
        online_consultation: doctorData.online_consultation || false,
        emergency_services: doctorData.emergency_services || false,
        
        // Location
        clinic_address: doctorData.clinic_address,
        city: doctorData.city,
        state: doctorData.state,
        pincode: doctorData.pincode,
        
        // Bio
        bio: doctorData.bio,
        
        // Languages (ensure it's an array for JSONB)
        languages_spoken: Array.isArray(doctorData.languages_spoken) 
          ? doctorData.languages_spoken 
          : (doctorData.languages_spoken ? [doctorData.languages_spoken] : ['English']),
        
        // Status
        status: 'pending',
        verification_status: 'pending'
      };

      const doctor = await Doctor.create(doctorProfileData, { transaction: t });

      // Calculate profile completeness
      const completeness = calculateDoctorProfileCompleteness(doctor);
      doctor.profile_completeness = completeness;
      await doctor.save({ transaction: t });

      return { user, doctor, completeness };
    });

    return res.status(201).json({
      message: 'Enhanced doctor registration submitted for approval',
      user_id: result.user.id,
      doctor_id: result.doctor.id,
      profile_completeness: result.completeness,
      status: 'pending_approval',
      verification_required: [
        'Medical Council Certificate',
        'Degree Certificates',
        'Photo ID',
        'Hospital Privilege Letters'
      ]
    });
  } catch (error) {
    console.error('Enhanced doctor registration error:', error);
    console.error('Error details:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors.map(e => ({ field: e.path, message: e.message })));
    }
    // Return more detailed error in development to help debugging
    return res.status(500).json({ 
      detail: 'Registration failed: ' + error.message,
      errors: error.errors ? error.errors.map(e => ({ field: e.path, message: e.message })) : undefined
    });
  }
});

/**
 * Register Hospital
 * Creates User (role: 'hospital') + Hospital entity + HospitalUser profile
 * Requires admin approval
 */
router.post('/register/hospital', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('name').notEmpty().withMessage('Hospital name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('address').notEmpty().withMessage('Address is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const hospitalData = req.body;

  try {
    // Check if email already exists
    const existingUser = await User.findByEmail(hospitalData.email);
    if (existingUser) {
      return res.status(400).json({ 
        detail: 'Email already registered',
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(hospitalData.password);

    // Create user, hospital, and hospital user profile in a transaction
    const result = await User.sequelize.transaction(async (t) => {
      // Create user (inactive until approved)
      const user = await User.create({
        email: hospitalData.email,
        password: hashedPassword,
        role: 'hospital',
        is_active: false, // Hospitals need approval
        email_verified: false
      }, { transaction: t });

      // Prepare hospital data
      const hospitalProfileData = {
        name: hospitalData.name,
        zone: hospitalData.zone,
        location: hospitalData.location,
        address: hospitalData.address,
        city: hospitalData.city,
        state: hospitalData.state,
        pincode: hospitalData.pincode,
        latitude: hospitalData.latitude,
        longitude: hospitalData.longitude,
        facilities: hospitalData.facilities || [],
        total_beds: hospitalData.total_beds,
        icu_beds: hospitalData.icu_beds,
        operation_theaters: hospitalData.operation_theaters,
        emergency_services: hospitalData.emergency_services !== undefined ? hospitalData.emergency_services : true,
        ambulance_service: hospitalData.ambulance_service !== undefined ? hospitalData.ambulance_service : true,
        insurance_accepted: hospitalData.insurance_accepted !== undefined ? hospitalData.insurance_accepted : true,
        accreditations: hospitalData.accreditations || [],
        base_price: hospitalData.base_price,
        consumables_cost: hospitalData.consumables_cost,
        room_charges_per_day: hospitalData.room_charges_per_day,
        phone: hospitalData.phone,
        email: hospitalData.email,
        website: hospitalData.website,
        status: 'pending' // Requires admin approval
      };

      // Create hospital
      const hospital = await Hospital.create(hospitalProfileData, { transaction: t });

      // Create hospital user profile
      const hospitalUser = await HospitalUser.create({
        id: user.id,
        user_id: user.id,
        hospital_id: hospital.id,
        full_name: hospitalData.full_name,
        email: hospitalData.email,
        phone: hospitalData.phone,
        designation: hospitalData.designation || 'Admin',
        department: hospitalData.department,
        is_primary_admin: true
      }, { transaction: t });

      return { user, hospital, hospitalUser };
    });

    return res.status(201).json({
      message: 'Hospital registration submitted for approval',
      user_id: result.user.id,
      hospital_id: result.hospital.id,
      hospital_user_id: result.hospitalUser.id,
      status: 'pending_approval'
    });
  } catch (error) {
    console.error('Hospital registration error:', error);
    return res.status(500).json({ 
      detail: 'Registration failed',
      message: error.message
    });
  }
});

/**
 * Register Implant Manufacturer
 * Creates User (role: 'implant') + Implant entity + ImplantUser profile
 * Requires admin approval
 */
router.post('/register/implant', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('name').notEmpty().withMessage('Implant name is required'),
  body('brand').notEmpty().withMessage('Brand is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const implantData = req.body;

  try {
    // Check if email already exists
    const existingUser = await User.findByEmail(implantData.email);
    if (existingUser) {
      return res.status(400).json({ 
        detail: 'Email already registered',
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(implantData.password);

    // Create user, implant, and implant user profile in a transaction
    const result = await User.sequelize.transaction(async (t) => {
      // Create user (inactive until approved)
      const user = await User.create({
        email: implantData.email,
        password: hashedPassword,
        role: 'implant',
        is_active: false, // Implants need approval
        email_verified: false
      }, { transaction: t });

      // Prepare implant data
      const implantProfileData = {
        name: implantData.name,
        brand: implantData.brand,
        brand_type: implantData.brand_type,
        manufacturer: implantData.manufacturer,
        material: implantData.material,
        surgery_type: implantData.surgery_type,
        expected_life: implantData.expected_life,
        range_of_motion: implantData.range_of_motion,
        peer_reviewed_studies: implantData.peer_reviewed_studies || 0,
        success_rate: implantData.success_rate,
        warranty: implantData.warranty,
        price: implantData.price,
        description: implantData.description,
        features: implantData.features || [],
        company_highlights: implantData.company_highlights || [],
        suitable_age: implantData.suitable_age,
        activity_level: implantData.activity_level,
        status: 'pending' // Requires admin approval
      };

      // Create implant
      const implant = await Implant.create(implantProfileData, { transaction: t });

      // Create implant user profile
      const implantUser = await ImplantUser.create({
        id: user.id,
        user_id: user.id,
        implant_id: implant.id,
        full_name: implantData.full_name,
        email: implantData.email,
        phone: implantData.phone,
        designation: implantData.designation || 'Admin',
        is_primary_admin: true
      }, { transaction: t });

      return { user, implant, implantUser };
    });

    return res.status(201).json({
      message: 'Implant manufacturer registration submitted for approval',
      user_id: result.user.id,
      implant_id: result.implant.id,
      implant_user_id: result.implantUser.id,
      status: 'pending_approval'
    });
  } catch (error) {
    console.error('Implant registration error:', error);
    return res.status(500).json({ 
      detail: 'Registration failed',
      message: error.message
    });
  }
});

/**
 * Get Registration Options
 * Returns available registration types with descriptions
 */
router.get('/registration-options', async (req, res) => {
  try {
    const options = [
      {
        role: 'patient',
        title: 'Register as Patient',
        description: 'Book surgeries and manage your health journey',
        icon: '👤',
        endpoint: '/api/auth/register/patient/enhanced',
        requires_approval: false
      },
      {
        role: 'doctor',
        title: 'Register as Surgeon/Doctor',
        description: 'Join our network of medical professionals',
        icon: '👨‍⚕️',
        endpoint: '/api/auth/register/doctor/enhanced',
        requires_approval: true
      },
      {
        role: 'hospital',
        title: 'Register Hospital',
        description: 'Partner with us to provide quality healthcare',
        icon: '🏥',
        endpoint: '/api/auth/register/hospital',
        requires_approval: true
      },
      {
        role: 'implant',
        title: 'Register Implant Manufacturer',
        description: 'Manage your implant catalog and partnerships',
        icon: '🦴',
        endpoint: '/api/auth/register/implant',
        requires_approval: true
      }
    ];

    return res.json({
      options,
      message: 'Available registration types'
    });
  } catch (error) {
    console.error('Get registration options error:', error);
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

/**
 * Get current user profile
 * Requires authentication
 */
router.get('/me', async (req, res) => {
  try {
    // This would be used with authenticate middleware
    // For now, just a placeholder
    return res.status(501).json({ 
      message: 'This endpoint requires authentication middleware to be implemented in the route'
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

module.exports = router;
