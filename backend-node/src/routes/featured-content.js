const express = require('express');
const { FeaturedContent, Doctor, Hospital, PatientTestimonial, User } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// GET /api/featured-content - Get all featured content
router.get('/', async (req, res) => {
  try {
    const { 
      content_type,
      region = 'global',
      is_active = 'true',
      page = 1, 
      limit = 20 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Build filters
    if (content_type) whereClause.content_type = content_type;
    if (is_active !== undefined) whereClause.is_active = is_active === 'true';
    
    if (region && region !== 'all') {
      whereClause[Op.or] = [
        { region: region },
        { region: 'global' }
      ];
    }

    // Add date filters for active content
    const now = new Date();
    if (is_active === 'true') {
      whereClause[Op.and] = [
        {
          [Op.or]: [
            { start_date: null },
            { start_date: { [Op.lte]: now } }
          ]
        },
        {
          [Op.or]: [
            { end_date: null },
            { end_date: { [Op.gte]: now } }
          ]
        }
      ];
    }

    const { count, rows } = await FeaturedContent.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['display_order', 'ASC'], ['created_at', 'DESC']]
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
    console.error('Error fetching featured content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured content',
      error: error.message
    });
  }
});

// GET /api/featured-content/landing - Get featured content for landing page
router.get('/landing', async (req, res) => {
  try {
    const { region = 'global' } = req.query;

    const whereClause = {
      is_active: true
    };

    if (region && region !== 'global') {
      whereClause[Op.or] = [
        { region: region },
        { region: 'global' }
      ];
    }

    // Add date filters for active content
    const now = new Date();
    whereClause[Op.and] = [
      {
        [Op.or]: [
          { start_date: null },
          { start_date: { [Op.lte]: now } }
        ]
      },
      {
        [Op.or]: [
          { end_date: null },
          { end_date: { [Op.gte]: now } }
        ]
      }
    ];

    const featuredContent = await FeaturedContent.findAll({
      where: whereClause,
      order: [['content_type', 'ASC'], ['display_order', 'ASC']],
      limit: 50 // Reasonable limit for landing page
    });

    // Group by content type for easier frontend consumption
    const groupedContent = {
      doctors: [],
      hospitals: [],
      testimonials: [],
      procedures: []
    };

    // Fetch actual entity data for each featured item
    for (const item of featuredContent) {
      let entityData = null;
      
      switch (item.content_type) {
        case 'doctor':
          entityData = await Doctor.findByPk(item.entity_id, {
            attributes: [
              'id', 'first_name', 'last_name', 'primary_specialization', 
              'years_of_experience', 'city', 'state', 'average_rating', 
              'total_reviews', 'profile_image_url', 'bio'
            ],
            include: [{
              model: User,
              as: 'user',
              attributes: ['email']
            }]
          });
          if (entityData) {
            groupedContent.doctors.push({
              ...item.toJSON(),
              entity: entityData
            });
          }
          break;

        case 'hospital':
          entityData = await Hospital.findByPk(item.entity_id, {
            attributes: [
              'id', 'name', 'city', 'state', 'address', 'hospital_type',
              'bed_capacity', 'average_rating', 'total_reviews', 
              'hospital_image_url', 'specialties', 'services_offered'
            ]
          });
          if (entityData) {
            groupedContent.hospitals.push({
              ...item.toJSON(),
              entity: entityData
            });
          }
          break;

        case 'testimonial':
          entityData = await PatientTestimonial.findByPk(item.entity_id, {
            where: {
              is_verified: true,
              consent_for_display: true
            },
            include: [{
              model: Doctor,
              as: 'doctor',
              attributes: ['id', 'first_name', 'last_name', 'primary_specialization']
            }, {
              model: Hospital,
              as: 'hospital',
              attributes: ['id', 'name', 'city'],
              required: false
            }]
          });
          if (entityData) {
            groupedContent.testimonials.push({
              ...item.toJSON(),
              entity: entityData
            });
          }
          break;

        case 'procedure':
          // For procedures, we might want to fetch from surgeries table
          // or handle differently based on your requirements
          groupedContent.procedures.push({
            ...item.toJSON(),
            entity: { id: item.entity_id } // Placeholder
          });
          break;
      }
    }

    res.json({
      success: true,
      data: groupedContent
    });
  } catch (error) {
    console.error('Error fetching landing page featured content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch landing page featured content',
      error: error.message
    });
  }
});

// GET /api/featured-content/:id - Get specific featured content
router.get('/:id', async (req, res) => {
  try {
    const featuredContent = await FeaturedContent.findByPk(req.params.id);

    if (!featuredContent) {
      return res.status(404).json({
        success: false,
        message: 'Featured content not found'
      });
    }

    res.json({
      success: true,
      data: featuredContent
    });
  } catch (error) {
    console.error('Error fetching featured content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured content',
      error: error.message
    });
  }
});

// POST /api/featured-content - Create new featured content
router.post('/', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const {
      content_type,
      entity_id,
      display_order,
      region,
      start_date,
      end_date
    } = req.body;

    // Validate required fields
    if (!content_type || !entity_id || display_order === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: content_type, entity_id, display_order'
      });
    }

    // Validate content_type
    if (!['doctor', 'hospital', 'testimonial', 'procedure'].includes(content_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content_type. Must be: doctor, hospital, testimonial, or procedure'
      });
    }

    // Verify the entity exists
    let entityExists = false;
    switch (content_type) {
      case 'doctor':
        entityExists = await Doctor.findByPk(entity_id);
        break;
      case 'hospital':
        entityExists = await Hospital.findByPk(entity_id);
        break;
      case 'testimonial':
        entityExists = await PatientTestimonial.findByPk(entity_id);
        break;
      case 'procedure':
        // Add validation for procedure if needed
        entityExists = true; // Placeholder
        break;
    }

    if (!entityExists) {
      return res.status(404).json({
        success: false,
        message: `${content_type} with id ${entity_id} not found`
      });
    }

    // Check if this entity is already featured for the same region
    const existingFeatured = await FeaturedContent.findOne({
      where: {
        content_type,
        entity_id,
        region: region || 'global',
        is_active: true
      }
    });

    if (existingFeatured) {
      return res.status(409).json({
        success: false,
        message: 'This entity is already featured for this region'
      });
    }

    const featuredContent = await FeaturedContent.create({
      content_type,
      entity_id,
      display_order,
      region: region || 'global',
      start_date,
      end_date
    });

    res.status(201).json({
      success: true,
      message: 'Featured content created successfully',
      data: featuredContent
    });
  } catch (error) {
    console.error('Error creating featured content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create featured content',
      error: error.message
    });
  }
});

// PUT /api/featured-content/:id - Update featured content
router.put('/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const featuredContent = await FeaturedContent.findByPk(req.params.id);
    
    if (!featuredContent) {
      return res.status(404).json({
        success: false,
        message: 'Featured content not found'
      });
    }

    const {
      display_order,
      is_active,
      region,
      start_date,
      end_date
    } = req.body;

    await featuredContent.update({
      display_order,
      is_active,
      region,
      start_date,
      end_date
    });

    res.json({
      success: true,
      message: 'Featured content updated successfully',
      data: featuredContent
    });
  } catch (error) {
    console.error('Error updating featured content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update featured content',
      error: error.message
    });
  }
});

// DELETE /api/featured-content/:id - Delete featured content
router.delete('/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const featuredContent = await FeaturedContent.findByPk(req.params.id);
    
    if (!featuredContent) {
      return res.status(404).json({
        success: false,
        message: 'Featured content not found'
      });
    }

    await featuredContent.destroy();

    res.json({
      success: true,
      message: 'Featured content deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting featured content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete featured content',
      error: error.message
    });
  }
});

// PATCH /api/featured-content/:id/toggle - Toggle featured content active status
router.patch('/:id/toggle', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const featuredContent = await FeaturedContent.findByPk(req.params.id);
    
    if (!featuredContent) {
      return res.status(404).json({
        success: false,
        message: 'Featured content not found'
      });
    }

    await featuredContent.update({
      is_active: !featuredContent.is_active
    });

    res.json({
      success: true,
      message: `Featured content ${featuredContent.is_active ? 'activated' : 'deactivated'} successfully`,
      data: featuredContent
    });
  } catch (error) {
    console.error('Error toggling featured content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle featured content',
      error: error.message
    });
  }
});

// POST /api/featured-content/reorder - Reorder featured content
router.post('/reorder', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'items must be an array of {id, display_order} objects'
      });
    }

    // Update display order for each item
    const updatePromises = items.map(item => 
      FeaturedContent.update(
        { display_order: item.display_order },
        { where: { id: item.id } }
      )
    );

    await Promise.all(updatePromises);

    // Fetch updated items
    const updatedItems = await FeaturedContent.findAll({
      where: {
        id: { [Op.in]: items.map(i => i.id) }
      },
      order: [['display_order', 'ASC']]
    });

    res.json({
      success: true,
      message: 'Featured content reordered successfully',
      data: updatedItems
    });
  } catch (error) {
    console.error('Error reordering featured content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder featured content',
      error: error.message
    });
  }
});

// GET /api/featured-content/stats - Get featured content statistics
router.get('/stats', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const totalItems = await FeaturedContent.count();
    const activeItems = await FeaturedContent.count({ where: { is_active: true } });
    const inactiveItems = totalItems - activeItems;

    // Count by content type
    const typeStats = await FeaturedContent.findAll({
      attributes: [
        'content_type',
        [FeaturedContent.sequelize.fn('COUNT', FeaturedContent.sequelize.col('id')), 'count']
      ],
      group: ['content_type'],
      raw: true
    });

    // Count by region
    const regionStats = await FeaturedContent.findAll({
      attributes: [
        'region',
        [FeaturedContent.sequelize.fn('COUNT', FeaturedContent.sequelize.col('id')), 'count']
      ],
      group: ['region'],
      raw: true
    });

    res.json({
      success: true,
      data: {
        total_items: totalItems,
        active_items: activeItems,
        inactive_items: inactiveItems,
        type_breakdown: typeStats,
        region_breakdown: regionStats
      }
    });
  } catch (error) {
    console.error('Error fetching featured content stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured content statistics',
      error: error.message
    });
  }
});

module.exports = router;
