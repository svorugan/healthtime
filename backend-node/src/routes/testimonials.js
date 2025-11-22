const express = require('express');
const { PatientTestimonial, Doctor, Patient, Hospital, Booking, User } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// GET /api/testimonials - Get all testimonials with filters
router.get('/', async (req, res) => {
  try {
    const { 
      doctor_id, 
      hospital_id,
      is_featured,
      is_verified,
      region = 'global',
      page = 1, 
      limit = 10 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {
      consent_for_display: true // Only show testimonials with consent
    };

    // Build filters
    if (doctor_id) whereClause.doctor_id = doctor_id;
    if (hospital_id) whereClause.hospital_id = hospital_id;
    if (is_featured !== undefined) whereClause.is_featured = is_featured === 'true';
    if (is_verified !== undefined) whereClause.is_verified = is_verified === 'true';
    if (region && region !== 'global') whereClause.region = region;

    const { count, rows } = await PatientTestimonial.findAndCountAll({
      where: whereClause,
      include: [{
        model: Doctor,
        as: 'doctor',
        attributes: ['id', 'first_name', 'last_name', 'primary_specialization']
      }, {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'first_name', 'last_name'],
        required: false
      }, {
        model: Hospital,
        as: 'hospital',
        attributes: ['id', 'name', 'city'],
        required: false
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        ['is_featured', 'DESC'],
        ['display_order', 'ASC'],
        ['created_at', 'DESC']
      ]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials',
      error: error.message
    });
  }
});

// GET /api/testimonials/featured - Get featured testimonials for landing page
router.get('/featured', async (req, res) => {
  try {
    const { region = 'global', limit = 6 } = req.query;

    const whereClause = {
      is_featured: true,
      consent_for_display: true,
      is_verified: true
    };

    if (region && region !== 'global') {
      whereClause[Op.or] = [
        { region: region },
        { region: 'global' }
      ];
    }

    const testimonials = await PatientTestimonial.findAll({
      where: whereClause,
      include: [{
        model: Doctor,
        as: 'doctor',
        attributes: ['id', 'first_name', 'last_name', 'primary_specialization', 'city']
      }, {
        model: Hospital,
        as: 'hospital',
        attributes: ['id', 'name', 'city'],
        required: false
      }],
      limit: parseInt(limit),
      order: [['display_order', 'ASC'], ['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: testimonials
    });
  } catch (error) {
    console.error('Error fetching featured testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured testimonials',
      error: error.message
    });
  }
});

// GET /api/testimonials/:id - Get specific testimonial
router.get('/:id', async (req, res) => {
  try {
    const testimonial = await PatientTestimonial.findByPk(req.params.id, {
      include: [{
        model: Doctor,
        as: 'doctor',
        attributes: ['id', 'first_name', 'last_name', 'primary_specialization', 'city']
      }, {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'first_name', 'last_name'],
        required: false
      }, {
        model: Hospital,
        as: 'hospital',
        attributes: ['id', 'name', 'city'],
        required: false
      }, {
        model: Booking,
        as: 'booking',
        attributes: ['id', 'booking_date', 'status'],
        required: false
      }]
    });

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.json({
      success: true,
      data: testimonial
    });
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonial',
      error: error.message
    });
  }
});

// POST /api/testimonials - Create new testimonial
router.post('/', authenticateToken, authorizeRoles(['patient', 'admin']), async (req, res) => {
  try {
    const {
      doctor_id,
      hospital_id,
      booking_id,
      rating,
      testimonial_text,
      treatment_type,
      region,
      consent_for_display,
      is_anonymous,
      patient_name_display
    } = req.body;

    // Validate required fields
    if (!doctor_id || !rating || !testimonial_text) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: doctor_id, rating, testimonial_text'
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Verify doctor exists
    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Verify hospital if provided
    if (hospital_id) {
      const hospital = await Hospital.findByPk(hospital_id);
      if (!hospital) {
        return res.status(404).json({
          success: false,
          message: 'Hospital not found'
        });
      }
    }

    // Verify booking if provided
    if (booking_id) {
      const booking = await Booking.findByPk(booking_id);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Verify the user is the patient for this booking
      if (req.user.role !== 'admin' && booking.patient_id !== req.user.patientProfile?.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only create testimonials for your own bookings'
        });
      }
    }

    const testimonial = await PatientTestimonial.create({
      doctor_id,
      patient_id: req.user.patientProfile?.id,
      hospital_id,
      booking_id,
      rating,
      testimonial_text,
      treatment_type,
      region: region || 'global',
      consent_for_display: consent_for_display || false,
      is_anonymous: is_anonymous || false,
      patient_name_display: is_anonymous ? patient_name_display : null
    });

    const createdTestimonial = await PatientTestimonial.findByPk(testimonial.id, {
      include: [{
        model: Doctor,
        as: 'doctor',
        attributes: ['id', 'first_name', 'last_name', 'primary_specialization']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      data: createdTestimonial
    });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create testimonial',
      error: error.message
    });
  }
});

// PUT /api/testimonials/:id - Update testimonial
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const testimonial = await PatientTestimonial.findByPk(req.params.id);
    
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    // Check if user is authorized to update this testimonial
    if (req.user.role !== 'admin' && testimonial.patient_id !== req.user.patientProfile?.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own testimonials'
      });
    }

    const {
      rating,
      testimonial_text,
      treatment_type,
      consent_for_display,
      is_anonymous,
      patient_name_display
    } = req.body;

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    await testimonial.update({
      rating,
      testimonial_text,
      treatment_type,
      consent_for_display,
      is_anonymous,
      patient_name_display: is_anonymous ? patient_name_display : null
    });

    const updatedTestimonial = await PatientTestimonial.findByPk(testimonial.id, {
      include: [{
        model: Doctor,
        as: 'doctor',
        attributes: ['id', 'first_name', 'last_name', 'primary_specialization']
      }]
    });

    res.json({
      success: true,
      message: 'Testimonial updated successfully',
      data: updatedTestimonial
    });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update testimonial',
      error: error.message
    });
  }
});

// DELETE /api/testimonials/:id - Delete testimonial
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const testimonial = await PatientTestimonial.findByPk(req.params.id);
    
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    // Check if user is authorized to delete this testimonial
    if (req.user.role !== 'admin' && testimonial.patient_id !== req.user.patientProfile?.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own testimonials'
      });
    }

    await testimonial.destroy();

    res.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete testimonial',
      error: error.message
    });
  }
});

// POST /api/testimonials/:id/verify - Verify testimonial (admin only)
router.post('/:id/verify', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const testimonial = await PatientTestimonial.findByPk(req.params.id);
    
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    const { is_verified, is_featured, display_order } = req.body;

    await testimonial.update({
      is_verified: is_verified !== undefined ? is_verified : testimonial.is_verified,
      is_featured: is_featured !== undefined ? is_featured : testimonial.is_featured,
      display_order: display_order !== undefined ? display_order : testimonial.display_order,
      verified_at: is_verified ? new Date() : null,
      verified_by: is_verified ? req.user.id : null
    });

    const updatedTestimonial = await PatientTestimonial.findByPk(testimonial.id, {
      include: [{
        model: Doctor,
        as: 'doctor',
        attributes: ['id', 'first_name', 'last_name', 'primary_specialization']
      }]
    });

    res.json({
      success: true,
      message: 'Testimonial verification updated successfully',
      data: updatedTestimonial
    });
  } catch (error) {
    console.error('Error verifying testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify testimonial',
      error: error.message
    });
  }
});

// GET /api/testimonials/doctor/:doctor_id - Get testimonials for specific doctor
router.get('/doctor/:doctor_id', async (req, res) => {
  try {
    const { doctor_id } = req.params;
    const { page = 1, limit = 10, verified_only = 'true' } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {
      doctor_id,
      consent_for_display: true
    };

    if (verified_only === 'true') {
      whereClause.is_verified = true;
    }

    const { count, rows } = await PatientTestimonial.findAndCountAll({
      where: whereClause,
      include: [{
        model: Hospital,
        as: 'hospital',
        attributes: ['id', 'name', 'city'],
        required: false
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    // Calculate average rating
    const avgRating = rows.length > 0 
      ? rows.reduce((sum, testimonial) => sum + testimonial.rating, 0) / rows.length 
      : 0;

    res.json({
      success: true,
      data: rows,
      statistics: {
        total_testimonials: count,
        average_rating: Math.round(avgRating * 100) / 100
      },
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching doctor testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor testimonials',
      error: error.message
    });
  }
});

// GET /api/testimonials/my - Get current user's testimonials (for patients)
router.get('/my', authenticateToken, authorizeRoles(['patient']), async (req, res) => {
  try {
    if (!req.user.patientProfile) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await PatientTestimonial.findAndCountAll({
      where: { patient_id: req.user.patientProfile.id },
      include: [{
        model: Doctor,
        as: 'doctor',
        attributes: ['id', 'first_name', 'last_name', 'primary_specialization']
      }, {
        model: Hospital,
        as: 'hospital',
        attributes: ['id', 'name', 'city'],
        required: false
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching my testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your testimonials',
      error: error.message
    });
  }
});

module.exports = router;
