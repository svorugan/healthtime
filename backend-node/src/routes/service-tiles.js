const express = require('express');
const { ServiceTile } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// GET /api/service-tiles - Get all service tiles
router.get('/', async (req, res) => {
  try {
    const { 
      region = 'global',
      is_active = 'true',
      page = 1, 
      limit = 20 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Build filters
    if (is_active !== undefined) whereClause.is_active = is_active === 'true';
    
    if (region && region !== 'all') {
      whereClause[Op.or] = [
        { region: region },
        { region: 'global' }
      ];
    }

    const { count, rows } = await ServiceTile.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['display_order', 'ASC'], ['service_name', 'ASC']]
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
    console.error('Error fetching service tiles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service tiles',
      error: error.message
    });
  }
});

// GET /api/service-tiles/active - Get active service tiles for landing page
router.get('/active', async (req, res) => {
  try {
    const { region = 'global', limit = 8 } = req.query;

    const whereClause = {
      is_active: true
    };

    if (region && region !== 'global') {
      whereClause[Op.or] = [
        { region: region },
        { region: 'global' }
      ];
    }

    const serviceTiles = await ServiceTile.findAll({
      where: whereClause,
      limit: parseInt(limit),
      order: [['display_order', 'ASC'], ['service_name', 'ASC']]
    });

    res.json({
      success: true,
      data: serviceTiles
    });
  } catch (error) {
    console.error('Error fetching active service tiles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active service tiles',
      error: error.message
    });
  }
});

// GET /api/service-tiles/:id - Get specific service tile
router.get('/:id', async (req, res) => {
  try {
    const serviceTile = await ServiceTile.findByPk(req.params.id);

    if (!serviceTile) {
      return res.status(404).json({
        success: false,
        message: 'Service tile not found'
      });
    }

    res.json({
      success: true,
      data: serviceTile
    });
  } catch (error) {
    console.error('Error fetching service tile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service tile',
      error: error.message
    });
  }
});

// POST /api/service-tiles - Create new service tile
router.post('/', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const {
      service_name,
      display_name,
      icon_url,
      description,
      avg_cost_min,
      avg_cost_max,
      currency,
      display_order,
      region
    } = req.body;

    // Validate required fields
    if (!service_name || !display_name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: service_name, display_name'
      });
    }

    // Check if service tile with same name and region already exists
    const existingTile = await ServiceTile.findOne({
      where: {
        service_name,
        region: region || 'global'
      }
    });

    if (existingTile) {
      return res.status(409).json({
        success: false,
        message: 'Service tile with this name already exists for this region'
      });
    }

    const serviceTile = await ServiceTile.create({
      service_name,
      display_name,
      icon_url,
      description,
      avg_cost_min,
      avg_cost_max,
      currency: currency || 'INR',
      display_order,
      region: region || 'global'
    });

    res.status(201).json({
      success: true,
      message: 'Service tile created successfully',
      data: serviceTile
    });
  } catch (error) {
    console.error('Error creating service tile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service tile',
      error: error.message
    });
  }
});

// PUT /api/service-tiles/:id - Update service tile
router.put('/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const serviceTile = await ServiceTile.findByPk(req.params.id);
    
    if (!serviceTile) {
      return res.status(404).json({
        success: false,
        message: 'Service tile not found'
      });
    }

    const {
      service_name,
      display_name,
      icon_url,
      description,
      avg_cost_min,
      avg_cost_max,
      currency,
      is_active,
      display_order,
      region
    } = req.body;

    await serviceTile.update({
      service_name,
      display_name,
      icon_url,
      description,
      avg_cost_min,
      avg_cost_max,
      currency,
      is_active,
      display_order,
      region
    });

    res.json({
      success: true,
      message: 'Service tile updated successfully',
      data: serviceTile
    });
  } catch (error) {
    console.error('Error updating service tile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service tile',
      error: error.message
    });
  }
});

// DELETE /api/service-tiles/:id - Delete service tile
router.delete('/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const serviceTile = await ServiceTile.findByPk(req.params.id);
    
    if (!serviceTile) {
      return res.status(404).json({
        success: false,
        message: 'Service tile not found'
      });
    }

    await serviceTile.destroy();

    res.json({
      success: true,
      message: 'Service tile deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service tile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service tile',
      error: error.message
    });
  }
});

// PATCH /api/service-tiles/:id/toggle - Toggle service tile active status
router.patch('/:id/toggle', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const serviceTile = await ServiceTile.findByPk(req.params.id);
    
    if (!serviceTile) {
      return res.status(404).json({
        success: false,
        message: 'Service tile not found'
      });
    }

    await serviceTile.update({
      is_active: !serviceTile.is_active
    });

    res.json({
      success: true,
      message: `Service tile ${serviceTile.is_active ? 'activated' : 'deactivated'} successfully`,
      data: serviceTile
    });
  } catch (error) {
    console.error('Error toggling service tile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle service tile',
      error: error.message
    });
  }
});

// POST /api/service-tiles/reorder - Reorder service tiles
router.post('/reorder', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { tiles } = req.body;

    if (!Array.isArray(tiles)) {
      return res.status(400).json({
        success: false,
        message: 'tiles must be an array of {id, display_order} objects'
      });
    }

    // Update display order for each tile
    const updatePromises = tiles.map(tile => 
      ServiceTile.update(
        { display_order: tile.display_order },
        { where: { id: tile.id } }
      )
    );

    await Promise.all(updatePromises);

    // Fetch updated tiles
    const updatedTiles = await ServiceTile.findAll({
      where: {
        id: { [Op.in]: tiles.map(t => t.id) }
      },
      order: [['display_order', 'ASC']]
    });

    res.json({
      success: true,
      message: 'Service tiles reordered successfully',
      data: updatedTiles
    });
  } catch (error) {
    console.error('Error reordering service tiles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder service tiles',
      error: error.message
    });
  }
});

// GET /api/service-tiles/search - Search service tiles
router.get('/search', async (req, res) => {
  try {
    const { q, region = 'global', is_active = 'true' } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query (q) is required'
      });
    }

    const whereClause = {
      [Op.or]: [
        { service_name: { [Op.iLike]: `%${q}%` } },
        { display_name: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } }
      ]
    };

    if (is_active !== undefined) whereClause.is_active = is_active === 'true';
    
    if (region && region !== 'all') {
      whereClause[Op.and] = [
        whereClause[Op.or],
        {
          [Op.or]: [
            { region: region },
            { region: 'global' }
          ]
        }
      ];
      delete whereClause[Op.or];
    }

    const serviceTiles = await ServiceTile.findAll({
      where: whereClause,
      order: [['display_order', 'ASC'], ['service_name', 'ASC']],
      limit: 20
    });

    res.json({
      success: true,
      data: serviceTiles,
      search_query: q
    });
  } catch (error) {
    console.error('Error searching service tiles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search service tiles',
      error: error.message
    });
  }
});

// GET /api/service-tiles/stats - Get service tiles statistics
router.get('/stats', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const totalTiles = await ServiceTile.count();
    const activeTiles = await ServiceTile.count({ where: { is_active: true } });
    const inactiveTiles = totalTiles - activeTiles;

    // Count by region
    const regionStats = await ServiceTile.findAll({
      attributes: [
        'region',
        [ServiceTile.sequelize.fn('COUNT', ServiceTile.sequelize.col('id')), 'count']
      ],
      group: ['region'],
      raw: true
    });

    res.json({
      success: true,
      data: {
        total_tiles: totalTiles,
        active_tiles: activeTiles,
        inactive_tiles: inactiveTiles,
        region_breakdown: regionStats
      }
    });
  } catch (error) {
    console.error('Error fetching service tiles stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service tiles statistics',
      error: error.message
    });
  }
});

module.exports = router;
