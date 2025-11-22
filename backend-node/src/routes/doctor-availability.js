const express = require('express');
const { DoctorAvailability, Doctor, User } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// GET /api/doctor-availability - Get all doctor availability slots
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      doctor_id, 
      available_date, 
      willing_to_travel,
      city,
      specialization,
      page = 1, 
      limit = 10 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};
    const includeClause = [{
      model: Doctor,
      as: 'doctor',
      attributes: ['id', 'first_name', 'last_name', 'primary_specialization', 'city', 'state'],
      include: [{
        model: User,
        as: 'user',
        attributes: ['email']
      }]
    }];

    // Build filters
    if (doctor_id) whereClause.doctor_id = doctor_id;
    if (available_date) whereClause.available_date = available_date;
    if (willing_to_travel !== undefined) {
      whereClause.willing_to_travel = willing_to_travel === 'true';
    }

    // Filter by city through preferred_cities JSONB or doctor's city
    if (city) {
      whereClause[Op.or] = [
        { preferred_cities: { [Op.contains]: [city] } },
        { '$doctor.city$': { [Op.iLike]: `%${city}%` } }
      ];
    }

    // Filter by specialization through doctor relationship
    if (specialization) {
      includeClause[0].where = { 
        primary_specialization: { [Op.iLike]: `%${specialization}%` } 
      };
    }

    const { count, rows } = await DoctorAvailability.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['available_date', 'ASC'], ['created_at', 'DESC']]
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
    console.error('Error fetching doctor availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor availability',
      error: error.message
    });
  }
});

// GET /api/doctor-availability/:id - Get specific availability slot
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const availability = await DoctorAvailability.findByPk(req.params.id, {
      include: [{
        model: Doctor,
        as: 'doctor',
        attributes: [
          'id', 'first_name', 'last_name', 'primary_specialization', 
          'years_of_experience', 'city', 'state', 'consultation_fee'
        ],
        include: [{
          model: User,
          as: 'user',
          attributes: ['email']
        }]
      }]
    });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Doctor availability slot not found'
      });
    }

    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Error fetching doctor availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor availability',
      error: error.message
    });
  }
});

// POST /api/doctor-availability - Create new availability slot
router.post('/', authenticateToken, authorizeRoles(['doctor', 'admin']), async (req, res) => {
  try {
    const {
      doctor_id,
      available_date,
      available_time_slots,
      willing_to_travel,
      max_travel_distance_km,
      preferred_cities,
      consultation_fee,
      surgery_fee,
      travel_allowance,
      required_equipment,
      required_support_staff,
      booking_lead_time_hours
    } = req.body;

    // Validate required fields
    if (!doctor_id || !available_date || !available_time_slots) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: doctor_id, available_date, available_time_slots'
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

    // Check if user is authorized to create availability for this doctor
    if (req.user.role !== 'admin' && req.user.doctorProfile?.id !== doctor_id) {
      return res.status(403).json({
        success: false,
        message: 'You can only create availability for your own profile'
      });
    }

    const availability = await DoctorAvailability.create({
      doctor_id,
      available_date,
      available_time_slots,
      willing_to_travel: willing_to_travel || false,
      max_travel_distance_km: max_travel_distance_km || 0,
      preferred_cities,
      consultation_fee,
      surgery_fee,
      travel_allowance,
      required_equipment,
      required_support_staff: required_support_staff || 2,
      booking_lead_time_hours: booking_lead_time_hours || 48
    });

    const createdAvailability = await DoctorAvailability.findByPk(availability.id, {
      include: [{
        model: Doctor,
        as: 'doctor',
        attributes: ['id', 'first_name', 'last_name', 'primary_specialization']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Doctor availability slot created successfully',
      data: createdAvailability
    });
  } catch (error) {
    console.error('Error creating doctor availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create doctor availability',
      error: error.message
    });
  }
});

// PUT /api/doctor-availability/:id - Update availability slot
router.put('/:id', authenticateToken, authorizeRoles(['doctor', 'admin']), async (req, res) => {
  try {
    const availability = await DoctorAvailability.findByPk(req.params.id, {
      include: [{
        model: Doctor,
        as: 'doctor',
        attributes: ['id']
      }]
    });
    
    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Doctor availability slot not found'
      });
    }

    // Check if user is authorized to update this availability
    if (req.user.role !== 'admin' && req.user.doctorProfile?.id !== availability.doctor.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own availability'
      });
    }

    const {
      available_date,
      available_time_slots,
      willing_to_travel,
      max_travel_distance_km,
      preferred_cities,
      consultation_fee,
      surgery_fee,
      travel_allowance,
      required_equipment,
      required_support_staff,
      is_available,
      booking_lead_time_hours
    } = req.body;

    await availability.update({
      available_date,
      available_time_slots,
      willing_to_travel,
      max_travel_distance_km,
      preferred_cities,
      consultation_fee,
      surgery_fee,
      travel_allowance,
      required_equipment,
      required_support_staff,
      is_available,
      booking_lead_time_hours
    });

    const updatedAvailability = await DoctorAvailability.findByPk(availability.id, {
      include: [{
        model: Doctor,
        as: 'doctor',
        attributes: ['id', 'first_name', 'last_name', 'primary_specialization']
      }]
    });

    res.json({
      success: true,
      message: 'Doctor availability slot updated successfully',
      data: updatedAvailability
    });
  } catch (error) {
    console.error('Error updating doctor availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor availability',
      error: error.message
    });
  }
});

// DELETE /api/doctor-availability/:id - Delete availability slot
router.delete('/:id', authenticateToken, authorizeRoles(['doctor', 'admin']), async (req, res) => {
  try {
    const availability = await DoctorAvailability.findByPk(req.params.id, {
      include: [{
        model: Doctor,
        as: 'doctor',
        attributes: ['id']
      }]
    });
    
    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Doctor availability slot not found'
      });
    }

    // Check if user is authorized to delete this availability
    if (req.user.role !== 'admin' && req.user.doctorProfile?.id !== availability.doctor.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own availability'
      });
    }

    await availability.destroy();

    res.json({
      success: true,
      message: 'Doctor availability slot deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting doctor availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete doctor availability',
      error: error.message
    });
  }
});

// GET /api/doctor-availability/search/traveling - Search doctors willing to travel
router.get('/search/traveling', authenticateToken, async (req, res) => {
  try {
    const { 
      target_city, 
      specialization,
      available_date,
      max_distance,
      limit = 10 
    } = req.query;

    const whereClause = {
      willing_to_travel: true
    };

    if (available_date) whereClause.available_date = available_date;
    if (max_distance) {
      whereClause.max_travel_distance_km = { [Op.gte]: parseInt(max_distance) };
    }

    // Filter by target city in preferred_cities
    if (target_city) {
      whereClause.preferred_cities = { [Op.contains]: [target_city] };
    }

    const includeClause = [{
      model: Doctor,
      as: 'doctor',
      attributes: [
        'id', 'first_name', 'last_name', 'primary_specialization', 
        'years_of_experience', 'city', 'state', 'consultation_fee'
      ],
      include: [{
        model: User,
        as: 'user',
        attributes: ['email']
      }]
    }];

    // Filter by specialization
    if (specialization) {
      includeClause[0].where = { 
        primary_specialization: { [Op.iLike]: `%${specialization}%` } 
      };
    }

    const travelingDoctors = await DoctorAvailability.findAll({
      where: whereClause,
      include: includeClause,
      limit: parseInt(limit),
      order: [['available_date', 'ASC'], ['max_travel_distance_km', 'DESC']]
    });

    res.json({
      success: true,
      data: travelingDoctors,
      search_params: {
        target_city,
        specialization,
        available_date,
        max_distance
      }
    });
  } catch (error) {
    console.error('Error searching traveling doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search traveling doctors',
      error: error.message
    });
  }
});

// GET /api/doctor-availability/my - Get current user's availability (for doctors)
router.get('/my', authenticateToken, authorizeRoles(['doctor']), async (req, res) => {
  try {
    if (!req.user.doctorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const { page = 1, limit = 10, upcoming_only = 'true' } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {
      doctor_id: req.user.doctorProfile.id
    };

    // Filter for upcoming dates only
    if (upcoming_only === 'true') {
      whereClause.available_date = { [Op.gte]: new Date() };
    }

    const { count, rows } = await DoctorAvailability.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['available_date', 'ASC'], ['created_at', 'DESC']]
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
    console.error('Error fetching my availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your availability',
      error: error.message
    });
  }
});

module.exports = router;
