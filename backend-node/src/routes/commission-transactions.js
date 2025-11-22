const express = require('express');
const { CommissionTransaction, CommissionAgreement, Booking, Doctor, Hospital, Patient } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// GET /api/commission-transactions - Get all commission transactions
router.get('/', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { 
      commission_agreement_id,
      booking_id,
      payment_status,
      service_type,
      start_date,
      end_date,
      page = 1, 
      limit = 20 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Build filters
    if (commission_agreement_id) whereClause.commission_agreement_id = commission_agreement_id;
    if (booking_id) whereClause.booking_id = booking_id;
    if (payment_status) whereClause.payment_status = payment_status;
    if (service_type) whereClause.service_type = service_type;
    
    if (start_date && end_date) {
      whereClause.transaction_date = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    } else if (start_date) {
      whereClause.transaction_date = { [Op.gte]: new Date(start_date) };
    } else if (end_date) {
      whereClause.transaction_date = { [Op.lte]: new Date(end_date) };
    }

    const { count, rows } = await CommissionTransaction.findAndCountAll({
      where: whereClause,
      include: [{
        model: CommissionAgreement,
        as: 'agreement',
        attributes: ['id', 'entity_type', 'entity_id', 'commission_type', 'commission_rate']
      }, {
        model: Booking,
        as: 'booking',
        attributes: ['id', 'booking_date', 'status', 'total_cost'],
        include: [{
          model: Doctor,
          as: 'doctor',
          attributes: ['id', 'first_name', 'last_name']
        }, {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'first_name', 'last_name']
        }]
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
    console.error('Error fetching commission transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch commission transactions',
      error: error.message
    });
  }
});

// GET /api/commission-transactions/:id - Get specific commission transaction
router.get('/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const transaction = await CommissionTransaction.findByPk(req.params.id, {
      include: [{
        model: CommissionAgreement,
        as: 'agreement',
        attributes: ['id', 'entity_type', 'entity_id', 'commission_type', 'commission_rate', 'payment_terms']
      }, {
        model: Booking,
        as: 'booking',
        attributes: ['id', 'booking_date', 'status', 'total_cost'],
        include: [{
          model: Doctor,
          as: 'doctor',
          attributes: ['id', 'first_name', 'last_name', 'primary_specialization']
        }, {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'first_name', 'last_name']
        }, {
          model: Hospital,
          as: 'hospital',
          attributes: ['id', 'name', 'city']
        }]
      }]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Commission transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching commission transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch commission transaction',
      error: error.message
    });
  }
});

// POST /api/commission-transactions - Create new commission transaction
router.post('/', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const {
      commission_agreement_id,
      booking_id,
      transaction_amount,
      service_type,
      transaction_date
    } = req.body;

    // Validate required fields
    if (!commission_agreement_id || !booking_id || !transaction_amount || !transaction_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: commission_agreement_id, booking_id, transaction_amount, transaction_date'
      });
    }

    // Verify commission agreement exists and is active
    const agreement = await CommissionAgreement.findByPk(commission_agreement_id);
    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: 'Commission agreement not found'
      });
    }

    if (agreement.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Commission agreement is not active'
      });
    }

    // Verify booking exists
    const booking = await Booking.findByPk(booking_id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if transaction already exists for this booking and agreement
    const existingTransaction = await CommissionTransaction.findOne({
      where: {
        commission_agreement_id,
        booking_id
      }
    });

    if (existingTransaction) {
      return res.status(409).json({
        success: false,
        message: 'Commission transaction already exists for this booking and agreement'
      });
    }

    // Calculate commission amount based on agreement
    let commissionAmount = 0;
    let commissionRateApplied = 0;

    switch (agreement.commission_type) {
      case 'percentage':
        commissionRateApplied = agreement.commission_rate;
        commissionAmount = transaction_amount * (agreement.commission_rate / 100);
        break;
      
      case 'fixed_amount':
        commissionAmount = agreement.fixed_amount;
        commissionRateApplied = (agreement.fixed_amount / transaction_amount * 100);
        break;
      
      case 'tiered':
        // Find applicable tier
        if (agreement.tiered_structure && Array.isArray(agreement.tiered_structure)) {
          for (const tier of agreement.tiered_structure) {
            if (transaction_amount >= tier.min_amount && 
                (!tier.max_amount || transaction_amount <= tier.max_amount)) {
              commissionRateApplied = tier.rate;
              commissionAmount = transaction_amount * (tier.rate / 100);
              break;
            }
          }
        }
        break;
      
      case 'hybrid':
        // Use the lesser of percentage or fixed amount
        const percentageAmount = transaction_amount * (agreement.commission_rate / 100);
        const fixedAmount = agreement.fixed_amount;
        commissionAmount = Math.min(percentageAmount, fixedAmount);
        commissionRateApplied = (commissionAmount / transaction_amount * 100);
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid commission type in agreement'
        });
    }

    const transaction = await CommissionTransaction.create({
      commission_agreement_id,
      booking_id,
      transaction_amount,
      commission_rate_applied: commissionRateApplied,
      commission_amount: commissionAmount,
      service_type,
      transaction_date
    });

    // Update agreement totals
    await agreement.increment({
      total_transactions: 1,
      total_commission_earned: commissionAmount
    });

    await agreement.update({
      last_commission_date: transaction_date
    });

    const createdTransaction = await CommissionTransaction.findByPk(transaction.id, {
      include: [{
        model: CommissionAgreement,
        as: 'agreement',
        attributes: ['id', 'entity_type', 'entity_id', 'commission_type']
      }, {
        model: Booking,
        as: 'booking',
        attributes: ['id', 'booking_date', 'status']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Commission transaction created successfully',
      data: createdTransaction
    });
  } catch (error) {
    console.error('Error creating commission transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create commission transaction',
      error: error.message
    });
  }
});

// PATCH /api/commission-transactions/:id/payment - Update payment status
router.patch('/:id/payment', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const transaction = await CommissionTransaction.findByPk(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Commission transaction not found'
      });
    }

    const { payment_status, payment_date, payment_reference } = req.body;

    if (!['pending', 'paid', 'disputed', 'refunded'].includes(payment_status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment_status. Must be: pending, paid, disputed, or refunded'
      });
    }

    const updateData = { payment_status };
    
    if (payment_status === 'paid' && payment_date) {
      updateData.payment_date = payment_date;
    }
    
    if (payment_reference) {
      updateData.payment_reference = payment_reference;
    }

    await transaction.update(updateData);

    res.json({
      success: true,
      message: `Payment status updated to ${payment_status}`,
      data: transaction
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
});

// GET /api/commission-transactions/agreement/:agreement_id - Get transactions for specific agreement
router.get('/agreement/:agreement_id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { agreement_id } = req.params;
    const { page = 1, limit = 20, payment_status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { commission_agreement_id: agreement_id };
    if (payment_status) whereClause.payment_status = payment_status;

    const { count, rows } = await CommissionTransaction.findAndCountAll({
      where: whereClause,
      include: [{
        model: Booking,
        as: 'booking',
        attributes: ['id', 'booking_date', 'status', 'total_cost'],
        include: [{
          model: Doctor,
          as: 'doctor',
          attributes: ['id', 'first_name', 'last_name']
        }, {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'first_name', 'last_name']
        }]
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    // Calculate summary statistics
    const totalCommission = await CommissionTransaction.sum('commission_amount', {
      where: whereClause
    });

    const paidCommission = await CommissionTransaction.sum('commission_amount', {
      where: { ...whereClause, payment_status: 'paid' }
    });

    res.json({
      success: true,
      data: rows,
      summary: {
        total_commission: totalCommission || 0,
        paid_commission: paidCommission || 0,
        pending_commission: (totalCommission || 0) - (paidCommission || 0)
      },
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching agreement transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agreement transactions',
      error: error.message
    });
  }
});

// GET /api/commission-transactions/stats - Get commission transaction statistics
router.get('/stats', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Total transactions and commission in period
    const totalTransactions = await CommissionTransaction.count({
      where: {
        transaction_date: { [Op.gte]: startDate }
      }
    });

    const totalCommission = await CommissionTransaction.sum('commission_amount', {
      where: {
        transaction_date: { [Op.gte]: startDate }
      }
    });

    // Commission by payment status
    const paymentStatusStats = await CommissionTransaction.findAll({
      where: {
        transaction_date: { [Op.gte]: startDate }
      },
      attributes: [
        'payment_status',
        [CommissionTransaction.sequelize.fn('COUNT', CommissionTransaction.sequelize.col('id')), 'count'],
        [CommissionTransaction.sequelize.fn('SUM', CommissionTransaction.sequelize.col('commission_amount')), 'total_amount']
      ],
      group: ['payment_status'],
      raw: true
    });

    // Commission by service type
    const serviceTypeStats = await CommissionTransaction.findAll({
      where: {
        transaction_date: { [Op.gte]: startDate }
      },
      attributes: [
        'service_type',
        [CommissionTransaction.sequelize.fn('COUNT', CommissionTransaction.sequelize.col('id')), 'count'],
        [CommissionTransaction.sequelize.fn('SUM', CommissionTransaction.sequelize.col('commission_amount')), 'total_amount']
      ],
      group: ['service_type'],
      raw: true
    });

    // Monthly commission trend (last 12 months)
    const monthlyStats = await CommissionTransaction.findAll({
      where: {
        transaction_date: { [Op.gte]: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
      },
      attributes: [
        [CommissionTransaction.sequelize.fn('DATE_TRUNC', 'month', CommissionTransaction.sequelize.col('transaction_date')), 'month'],
        [CommissionTransaction.sequelize.fn('COUNT', CommissionTransaction.sequelize.col('id')), 'count'],
        [CommissionTransaction.sequelize.fn('SUM', CommissionTransaction.sequelize.col('commission_amount')), 'total_amount']
      ],
      group: [CommissionTransaction.sequelize.fn('DATE_TRUNC', 'month', CommissionTransaction.sequelize.col('transaction_date'))],
      order: [[CommissionTransaction.sequelize.fn('DATE_TRUNC', 'month', CommissionTransaction.sequelize.col('transaction_date')), 'ASC']],
      raw: true
    });

    res.json({
      success: true,
      data: {
        period_days: parseInt(days),
        total_transactions: totalTransactions,
        total_commission: totalCommission || 0,
        payment_status_breakdown: paymentStatusStats,
        service_type_breakdown: serviceTypeStats,
        monthly_trend: monthlyStats
      }
    });
  } catch (error) {
    console.error('Error fetching commission transaction stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch commission transaction statistics',
      error: error.message
    });
  }
});

// DELETE /api/commission-transactions/:id - Delete commission transaction
router.delete('/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const transaction = await CommissionTransaction.findByPk(req.params.id, {
      include: [{
        model: CommissionAgreement,
        as: 'agreement'
      }]
    });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Commission transaction not found'
      });
    }

    // Only allow deletion of pending transactions
    if (transaction.payment_status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending transactions can be deleted'
      });
    }

    // Update agreement totals
    await transaction.agreement.decrement({
      total_transactions: 1,
      total_commission_earned: transaction.commission_amount
    });

    await transaction.destroy();

    res.json({
      success: true,
      message: 'Commission transaction deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting commission transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete commission transaction',
      error: error.message
    });
  }
});

module.exports = router;
