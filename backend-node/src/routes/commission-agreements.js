const express = require('express');
const { CommissionAgreement, CommissionTransaction, User, Doctor, Hospital } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// GET /api/commission-agreements - Get all commission agreements
router.get('/', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { 
      entity_type,
      entity_id,
      status,
      commission_type,
      page = 1, 
      limit = 20 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Build filters
    if (entity_type) whereClause.entity_type = entity_type;
    if (entity_id) whereClause.entity_id = entity_id;
    if (status) whereClause.status = status;
    if (commission_type) whereClause.commission_type = commission_type;

    const { count, rows } = await CommissionAgreement.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'approver',
        attributes: ['id', 'email'],
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
    console.error('Error fetching commission agreements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch commission agreements',
      error: error.message
    });
  }
});

// GET /api/commission-agreements/active - Get active commission agreements
router.get('/active', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { entity_type, entity_id } = req.query;
    const whereClause = {
      status: 'active',
      effective_date: { [Op.lte]: new Date() },
      [Op.or]: [
        { expiry_date: null },
        { expiry_date: { [Op.gte]: new Date() } }
      ]
    };

    if (entity_type) whereClause.entity_type = entity_type;
    if (entity_id) whereClause.entity_id = entity_id;

    const agreements = await CommissionAgreement.findAll({
      where: whereClause,
      order: [['effective_date', 'DESC']]
    });

    res.json({
      success: true,
      data: agreements
    });
  } catch (error) {
    console.error('Error fetching active commission agreements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active commission agreements',
      error: error.message
    });
  }
});

// GET /api/commission-agreements/:id - Get specific commission agreement
router.get('/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const agreement = await CommissionAgreement.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'approver',
        attributes: ['id', 'email'],
        required: false
      }, {
        model: CommissionTransaction,
        as: 'transactions',
        limit: 10,
        order: [['created_at', 'DESC']],
        required: false
      }]
    });

    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: 'Commission agreement not found'
      });
    }

    res.json({
      success: true,
      data: agreement
    });
  } catch (error) {
    console.error('Error fetching commission agreement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch commission agreement',
      error: error.message
    });
  }
});

// POST /api/commission-agreements - Create new commission agreement
router.post('/', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const {
      entity_type,
      entity_id,
      commission_type,
      commission_rate,
      fixed_amount,
      tiered_structure,
      minimum_monthly_volume,
      payment_terms,
      currency,
      applicable_services,
      excluded_services,
      effective_date,
      expiry_date,
      auto_renewal,
      agreement_document_url,
      tax_treatment,
      compliance_notes
    } = req.body;

    // Validate required fields
    if (!entity_type || !entity_id || !commission_type || !effective_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: entity_type, entity_id, commission_type, effective_date'
      });
    }

    // Validate entity_type
    if (!['doctor', 'hospital', 'implant_company'].includes(entity_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid entity_type. Must be: doctor, hospital, or implant_company'
      });
    }

    // Validate commission_type
    if (!['percentage', 'fixed_amount', 'tiered', 'hybrid'].includes(commission_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid commission_type. Must be: percentage, fixed_amount, tiered, or hybrid'
      });
    }

    // Validate commission structure based on type
    if (commission_type === 'percentage' && !commission_rate) {
      return res.status(400).json({
        success: false,
        message: 'commission_rate is required for percentage commission type'
      });
    }

    if (commission_type === 'fixed_amount' && !fixed_amount) {
      return res.status(400).json({
        success: false,
        message: 'fixed_amount is required for fixed_amount commission type'
      });
    }

    if (commission_type === 'tiered' && !tiered_structure) {
      return res.status(400).json({
        success: false,
        message: 'tiered_structure is required for tiered commission type'
      });
    }

    // Verify the entity exists
    let entityExists = false;
    switch (entity_type) {
      case 'doctor':
        entityExists = await Doctor.findByPk(entity_id);
        break;
      case 'hospital':
        entityExists = await Hospital.findByPk(entity_id);
        break;
      case 'implant_company':
        // Add validation for implant company if needed
        entityExists = true; // Placeholder
        break;
    }

    if (!entityExists) {
      return res.status(404).json({
        success: false,
        message: `${entity_type} with id ${entity_id} not found`
      });
    }

    // Check for existing active agreement for the same entity
    const existingAgreement = await CommissionAgreement.findOne({
      where: {
        entity_type,
        entity_id,
        status: 'active',
        effective_date: { [Op.lte]: new Date(effective_date) },
        [Op.or]: [
          { expiry_date: null },
          { expiry_date: { [Op.gte]: new Date(effective_date) } }
        ]
      }
    });

    if (existingAgreement) {
      return res.status(409).json({
        success: false,
        message: 'An active commission agreement already exists for this entity'
      });
    }

    const agreement = await CommissionAgreement.create({
      entity_type,
      entity_id,
      commission_type,
      commission_rate,
      fixed_amount,
      tiered_structure,
      minimum_monthly_volume,
      payment_terms: payment_terms || 'net_30',
      currency: currency || 'INR',
      applicable_services,
      excluded_services,
      effective_date,
      expiry_date,
      auto_renewal: auto_renewal || false,
      agreement_document_url,
      tax_treatment,
      compliance_notes
    });

    res.status(201).json({
      success: true,
      message: 'Commission agreement created successfully',
      data: agreement
    });
  } catch (error) {
    console.error('Error creating commission agreement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create commission agreement',
      error: error.message
    });
  }
});

// PUT /api/commission-agreements/:id - Update commission agreement
router.put('/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const agreement = await CommissionAgreement.findByPk(req.params.id);
    
    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: 'Commission agreement not found'
      });
    }

    const {
      commission_type,
      commission_rate,
      fixed_amount,
      tiered_structure,
      minimum_monthly_volume,
      payment_terms,
      currency,
      applicable_services,
      excluded_services,
      effective_date,
      expiry_date,
      auto_renewal,
      agreement_document_url,
      tax_treatment,
      compliance_notes
    } = req.body;

    await agreement.update({
      commission_type,
      commission_rate,
      fixed_amount,
      tiered_structure,
      minimum_monthly_volume,
      payment_terms,
      currency,
      applicable_services,
      excluded_services,
      effective_date,
      expiry_date,
      auto_renewal,
      agreement_document_url,
      tax_treatment,
      compliance_notes
    });

    res.json({
      success: true,
      message: 'Commission agreement updated successfully',
      data: agreement
    });
  } catch (error) {
    console.error('Error updating commission agreement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update commission agreement',
      error: error.message
    });
  }
});

// PATCH /api/commission-agreements/:id/status - Update agreement status
router.patch('/:id/status', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const agreement = await CommissionAgreement.findByPk(req.params.id);
    
    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: 'Commission agreement not found'
      });
    }

    const { status } = req.body;

    if (!['draft', 'active', 'suspended', 'terminated', 'expired'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: draft, active, suspended, terminated, or expired'
      });
    }

    await agreement.update({ status });

    res.json({
      success: true,
      message: `Commission agreement ${status} successfully`,
      data: agreement
    });
  } catch (error) {
    console.error('Error updating agreement status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update agreement status',
      error: error.message
    });
  }
});

// POST /api/commission-agreements/:id/approve - Approve commission agreement
router.post('/:id/approve', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const agreement = await CommissionAgreement.findByPk(req.params.id);
    
    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: 'Commission agreement not found'
      });
    }

    if (agreement.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft agreements can be approved'
      });
    }

    await agreement.update({
      status: 'active',
      approved_by: req.user.id,
      approved_at: new Date()
    });

    const approvedAgreement = await CommissionAgreement.findByPk(agreement.id, {
      include: [{
        model: User,
        as: 'approver',
        attributes: ['id', 'email']
      }]
    });

    res.json({
      success: true,
      message: 'Commission agreement approved successfully',
      data: approvedAgreement
    });
  } catch (error) {
    console.error('Error approving commission agreement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve commission agreement',
      error: error.message
    });
  }
});

// DELETE /api/commission-agreements/:id - Delete commission agreement
router.delete('/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const agreement = await CommissionAgreement.findByPk(req.params.id);
    
    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: 'Commission agreement not found'
      });
    }

    // Check if there are any transactions associated with this agreement
    const transactionCount = await CommissionTransaction.count({
      where: { commission_agreement_id: agreement.id }
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete agreement with existing commission transactions'
      });
    }

    await agreement.destroy();

    res.json({
      success: true,
      message: 'Commission agreement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting commission agreement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete commission agreement',
      error: error.message
    });
  }
});

// GET /api/commission-agreements/entity/:type/:id - Get agreements for specific entity
router.get('/entity/:type/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { type, id } = req.params;
    const { status } = req.query;

    if (!['doctor', 'hospital', 'implant_company'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid entity type'
      });
    }

    const whereClause = {
      entity_type: type,
      entity_id: id
    };

    if (status) whereClause.status = status;

    const agreements = await CommissionAgreement.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'approver',
        attributes: ['id', 'email'],
        required: false
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: agreements
    });
  } catch (error) {
    console.error('Error fetching entity agreements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch entity agreements',
      error: error.message
    });
  }
});

// GET /api/commission-agreements/stats - Get commission agreement statistics
router.get('/stats', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const totalAgreements = await CommissionAgreement.count();
    const activeAgreements = await CommissionAgreement.count({ where: { status: 'active' } });
    const draftAgreements = await CommissionAgreement.count({ where: { status: 'draft' } });

    // Agreements by entity type
    const entityTypeStats = await CommissionAgreement.findAll({
      attributes: [
        'entity_type',
        [CommissionAgreement.sequelize.fn('COUNT', CommissionAgreement.sequelize.col('id')), 'count']
      ],
      group: ['entity_type'],
      raw: true
    });

    // Agreements by commission type
    const commissionTypeStats = await CommissionAgreement.findAll({
      attributes: [
        'commission_type',
        [CommissionAgreement.sequelize.fn('COUNT', CommissionAgreement.sequelize.col('id')), 'count']
      ],
      group: ['commission_type'],
      raw: true
    });

    // Total commission earned
    const totalCommissionEarned = await CommissionAgreement.sum('total_commission_earned');

    res.json({
      success: true,
      data: {
        total_agreements: totalAgreements,
        active_agreements: activeAgreements,
        draft_agreements: draftAgreements,
        total_commission_earned: totalCommissionEarned || 0,
        entity_type_breakdown: entityTypeStats,
        commission_type_breakdown: commissionTypeStats
      }
    });
  } catch (error) {
    console.error('Error fetching commission agreement stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch commission agreement statistics',
      error: error.message
    });
  }
});

module.exports = router;
