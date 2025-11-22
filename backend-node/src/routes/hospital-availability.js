const express = require('express');
const { HospitalAvailability, Hospital } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// GET /api/hospital-availability - Get all hospital availability slots
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      hospital_id, 
      facility_type, 
      available_date, 
      specialization, 
      city,
      page = 1, 
      limit = 10 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};
    const includeClause = [{
      model: Hospital,
      as: 'hospital',
      attributes: ['id', 'name', 'city', 'state', 'address']
    }];

    // Build filters
    if (hospital_id) whereClause.hospital_id = hospital_id;
    if (facility_type) whereClause.facility_type = facility_type;
    if (available_date) whereClause.available_date = available_date;
    if (specialization) {
      whereClause.specialization_supported = {
        [Op.contains]: [specialization]
      };
    }

    // Filter by city through hospital relationship
    if (city) {
      includeClause[0].where = { city: { [Op.iLike]: `%${city}%` } };
    }

    const { count, rows } = await HospitalAvailability.findAndCountAll({
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
    console.error('Error fetching hospital availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hospital availability',
      error: error.message
    });
  }
});

// GET /api/hospital-availability/:id - Get specific availability slot
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const availability = await HospitalAvailability.findByPk(req.params.id, {
      include: [{
        model: Hospital,
        as: 'hospital',
        attributes: ['id', 'name', 'city', 'state', 'address', 'phone', 'email']
      }]
    });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Hospital availability slot not found'
      });
    }

    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Error fetching hospital availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hospital availability',
      error: error.message
    });
  }
});

// POST /api/hospital-availability - Create new availability slot
router.post('/', authenticateToken, authorizeRoles(['hospital_admin', 'admin']), async (req, res) => {
  try {
    const {
      hospital_id,
      facility_type,
      facility_name,
      specialization_supported,
      equipment_available,
      available_date,
      available_time_slots,
      facility_cost_per_hour,
      equipment_cost,
      support_staff_cost,
      total_package_cost,
      booking_lead_time_hours
    } = req.body;

    // Validate required fields
    if (!hospital_id || !facility_type || !available_date || !available_time_slots) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: hospital_id, facility_type, available_date, available_time_slots'
      });
    }

    // Verify hospital exists
    const hospital = await Hospital.findByPk(hospital_id);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    const availability = await HospitalAvailability.create({
      hospital_id,
      facility_type,
      facility_name,
      specialization_supported,
      equipment_available,
      available_date,
      available_time_slots,
      facility_cost_per_hour,
      equipment_cost,
      support_staff_cost,
      total_package_cost,
      booking_lead_time_hours
    });

    const createdAvailability = await HospitalAvailability.findByPk(availability.id, {
      include: [{
        model: Hospital,
        as: 'hospital',
        attributes: ['id', 'name', 'city', 'state']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Hospital availability slot created successfully',
      data: createdAvailability
    });
  } catch (error) {
    console.error('Error creating hospital availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create hospital availability',
      error: error.message
    });
  }
});

// PUT /api/hospital-availability/:id - Update availability slot
router.put('/:id', authenticateToken, authorizeRoles(['hospital_admin', 'admin']), async (req, res) => {
  try {
    const availability = await HospitalAvailability.findByPk(req.params.id);
    
    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Hospital availability slot not found'
      });
    }

    const {
      facility_type,
      facility_name,
      specialization_supported,
      equipment_available,
      available_date,
      available_time_slots,
      facility_cost_per_hour,
      equipment_cost,
      support_staff_cost,
      total_package_cost,
      is_available,
      booking_lead_time_hours
    } = req.body;

    await availability.update({
      facility_type,
      facility_name,
      specialization_supported,
      equipment_available,
      available_date,
      available_time_slots,
      facility_cost_per_hour,
      equipment_cost,
      support_staff_cost,
      total_package_cost,
      is_available,
      booking_lead_time_hours
    });

    const updatedAvailability = await HospitalAvailability.findByPk(availability.id, {
      include: [{
        model: Hospital,
        as: 'hospital',
        attributes: ['id', 'name', 'city', 'state']
      }]
    });

    res.json({
      success: true,
      message: 'Hospital availability slot updated successfully',
      data: updatedAvailability
    });
  } catch (error) {
    console.error('Error updating hospital availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update hospital availability',
      error: error.message
    });
  }
});

// DELETE /api/hospital-availability/:id - Delete availability slot
router.delete('/:id', authenticateToken, authorizeRoles(['hospital_admin', 'admin']), async (req, res) => {
  try {
    const availability = await HospitalAvailability.findByPk(req.params.id);
    
    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Hospital availability slot not found'
      });
    }

    await availability.destroy();

    res.json({
      success: true,
      message: 'Hospital availability slot deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting hospital availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete hospital availability',
      error: error.message
    });
  }
});

// GET /api/hospital-availability/search/nearby - Search nearby hospital facilities
router.get('/search/nearby', authenticateToken, async (req, res) => {
  try {
    const { 
      latitude, 
      longitude, 
      radius = 25, 
      facility_type, 
      specialization,
      available_date,
      limit = 10 
    } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required for nearby search'
      });
    }

    const whereClause = {};
    if (facility_type) whereClause.facility_type = facility_type;
    if (available_date) whereClause.available_date = available_date;
    if (specialization) {
      whereClause.specialization_supported = {
        [Op.contains]: [specialization]
      };
    }

    // Use raw query for geo-distance calculation
    const availabilitySlots = await HospitalAvailability.findAll({
      where: whereClause,
      include: [{
        model: Hospital,
        as: 'hospital',
        where: {
          latitude: { [Op.not]: null },
          longitude: { [Op.not]: null }
        },
        attributes: [
          'id', 'name', 'city', 'state', 'address', 'phone', 
          'latitude', 'longitude'
        ]
      }],
      limit: parseInt(limit),
      order: [['available_date', 'ASC']]
    });

    // Calculate distances and filter by radius
    const nearbySlots = availabilitySlots
      .map(slot => {
        const hospital = slot.hospital;
        const distance = calculateDistance(
          parseFloat(latitude), 
          parseFloat(longitude),
          parseFloat(hospital.latitude), 
          parseFloat(hospital.longitude)
        );
        
        return {
          ...slot.toJSON(),
          distance: Math.round(distance * 100) / 100 // Round to 2 decimal places
        };
      })
      .filter(slot => slot.distance <= parseFloat(radius))
      .sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      data: nearbySlots,
      search_params: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius: parseFloat(radius)
      }
    });
  } catch (error) {
    console.error('Error searching nearby hospital availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search nearby hospital availability',
      error: error.message
    });
  }
});

// Helper function to calculate distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

module.exports = router;
