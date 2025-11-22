const express = require('express');
const { FeatureConfiguration } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// GET /api/feature-configurations - Get all feature configurations
router.get('/', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await FeatureConfiguration.findAndCountAll({
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
    console.error('Error fetching feature configurations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feature configurations',
      error: error.message
    });
  }
});

// GET /api/feature-configurations/active - Get active configuration for current deployment
router.get('/active', async (req, res) => {
  try {
    const { deployment_id = 'default_healthtime' } = req.query;

    const config = await FeatureConfiguration.findOne({
      where: { deployment_id }
    });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Feature configuration not found for this deployment'
      });
    }

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error fetching active configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active configuration',
      error: error.message
    });
  }
});

// GET /api/feature-configurations/:id - Get specific configuration
router.get('/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const config = await FeatureConfiguration.findByPk(req.params.id);

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Feature configuration not found'
      });
    }

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error fetching feature configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feature configuration',
      error: error.message
    });
  }
});

// POST /api/feature-configurations - Create new feature configuration
router.post('/', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const {
      deployment_id,
      deployment_type,
      module_config,
      auth_config,
      branding_config,
      landing_page_config
    } = req.body;

    // Validate required fields
    if (!deployment_id || !deployment_type || !module_config || !auth_config) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: deployment_id, deployment_type, module_config, auth_config'
      });
    }

    // Check if deployment_id already exists
    const existingConfig = await FeatureConfiguration.findOne({
      where: { deployment_id }
    });

    if (existingConfig) {
      return res.status(409).json({
        success: false,
        message: 'Configuration with this deployment_id already exists'
      });
    }

    // Validate module_config structure
    const requiredModules = ['authentication', 'patients', 'doctors', 'hospitals'];
    const moduleKeys = Object.keys(module_config);
    
    for (const requiredModule of requiredModules) {
      if (!moduleKeys.includes(requiredModule)) {
        return res.status(400).json({
          success: false,
          message: `Missing required module in module_config: ${requiredModule}`
        });
      }
    }

    // Validate auth_config structure
    if (!auth_config.providers || !Array.isArray(auth_config.providers)) {
      return res.status(400).json({
        success: false,
        message: 'auth_config must include providers array'
      });
    }

    const config = await FeatureConfiguration.create({
      deployment_id,
      deployment_type,
      module_config,
      auth_config,
      branding_config,
      landing_page_config
    });

    res.status(201).json({
      success: true,
      message: 'Feature configuration created successfully',
      data: config
    });
  } catch (error) {
    console.error('Error creating feature configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create feature configuration',
      error: error.message
    });
  }
});

// PUT /api/feature-configurations/:id - Update feature configuration
router.put('/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const config = await FeatureConfiguration.findByPk(req.params.id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Feature configuration not found'
      });
    }

    const {
      deployment_type,
      module_config,
      auth_config,
      branding_config,
      landing_page_config
    } = req.body;

    await config.update({
      deployment_type,
      module_config,
      auth_config,
      branding_config,
      landing_page_config
    });

    res.json({
      success: true,
      message: 'Feature configuration updated successfully',
      data: config
    });
  } catch (error) {
    console.error('Error updating feature configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feature configuration',
      error: error.message
    });
  }
});

// PATCH /api/feature-configurations/:id/modules - Update specific modules
router.patch('/:id/modules', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const config = await FeatureConfiguration.findByPk(req.params.id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Feature configuration not found'
      });
    }

    const { modules } = req.body;

    if (!modules || typeof modules !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'modules must be an object with module configurations'
      });
    }

    // Merge with existing module config
    const updatedModuleConfig = {
      ...config.module_config,
      ...modules
    };

    await config.update({
      module_config: updatedModuleConfig
    });

    res.json({
      success: true,
      message: 'Module configuration updated successfully',
      data: config
    });
  } catch (error) {
    console.error('Error updating module configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update module configuration',
      error: error.message
    });
  }
});

// PATCH /api/feature-configurations/:id/auth - Update authentication configuration
router.patch('/:id/auth', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const config = await FeatureConfiguration.findByPk(req.params.id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Feature configuration not found'
      });
    }

    const { auth_settings } = req.body;

    if (!auth_settings || typeof auth_settings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'auth_settings must be an object with authentication configurations'
      });
    }

    // Merge with existing auth config
    const updatedAuthConfig = {
      ...config.auth_config,
      ...auth_settings
    };

    await config.update({
      auth_config: updatedAuthConfig
    });

    res.json({
      success: true,
      message: 'Authentication configuration updated successfully',
      data: config
    });
  } catch (error) {
    console.error('Error updating authentication configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update authentication configuration',
      error: error.message
    });
  }
});

// PATCH /api/feature-configurations/:id/branding - Update branding configuration
router.patch('/:id/branding', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const config = await FeatureConfiguration.findByPk(req.params.id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Feature configuration not found'
      });
    }

    const { branding_settings } = req.body;

    if (!branding_settings || typeof branding_settings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'branding_settings must be an object with branding configurations'
      });
    }

    // Merge with existing branding config
    const updatedBrandingConfig = {
      ...config.branding_config,
      ...branding_settings
    };

    await config.update({
      branding_config: updatedBrandingConfig
    });

    res.json({
      success: true,
      message: 'Branding configuration updated successfully',
      data: config
    });
  } catch (error) {
    console.error('Error updating branding configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update branding configuration',
      error: error.message
    });
  }
});

// DELETE /api/feature-configurations/:id - Delete feature configuration
router.delete('/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const config = await FeatureConfiguration.findByPk(req.params.id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Feature configuration not found'
      });
    }

    // Prevent deletion of default configuration
    if (config.deployment_id === 'default_healthtime') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete the default configuration'
      });
    }

    await config.destroy();

    res.json({
      success: true,
      message: 'Feature configuration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feature configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete feature configuration',
      error: error.message
    });
  }
});

// GET /api/feature-configurations/deployment/:deployment_id - Get configuration by deployment ID
router.get('/deployment/:deployment_id', async (req, res) => {
  try {
    const config = await FeatureConfiguration.findOne({
      where: { deployment_id: req.params.deployment_id }
    });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Feature configuration not found for this deployment'
      });
    }

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error fetching configuration by deployment ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch configuration',
      error: error.message
    });
  }
});

// POST /api/feature-configurations/:id/clone - Clone configuration
router.post('/:id/clone', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const sourceConfig = await FeatureConfiguration.findByPk(req.params.id);
    
    if (!sourceConfig) {
      return res.status(404).json({
        success: false,
        message: 'Source configuration not found'
      });
    }

    const { new_deployment_id, new_deployment_type } = req.body;

    if (!new_deployment_id) {
      return res.status(400).json({
        success: false,
        message: 'new_deployment_id is required'
      });
    }

    // Check if new deployment_id already exists
    const existingConfig = await FeatureConfiguration.findOne({
      where: { deployment_id: new_deployment_id }
    });

    if (existingConfig) {
      return res.status(409).json({
        success: false,
        message: 'Configuration with this deployment_id already exists'
      });
    }

    const clonedConfig = await FeatureConfiguration.create({
      deployment_id: new_deployment_id,
      deployment_type: new_deployment_type || sourceConfig.deployment_type,
      module_config: sourceConfig.module_config,
      auth_config: sourceConfig.auth_config,
      branding_config: sourceConfig.branding_config,
      landing_page_config: sourceConfig.landing_page_config
    });

    res.status(201).json({
      success: true,
      message: 'Configuration cloned successfully',
      data: clonedConfig
    });
  } catch (error) {
    console.error('Error cloning configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clone configuration',
      error: error.message
    });
  }
});

module.exports = router;
