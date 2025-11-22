const express = require('express');
const { OtpLog, User } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { Op } = require('sequelize');
const crypto = require('crypto');

const router = express.Router();

// GET /api/otp-logs - Get OTP logs (admin only)
router.get('/', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { 
      user_id,
      phone,
      email,
      otp_type,
      status,
      delivery_method,
      page = 1, 
      limit = 20 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Build filters
    if (user_id) whereClause.user_id = user_id;
    if (phone) whereClause.phone = { [Op.iLike]: `%${phone}%` };
    if (email) whereClause.email = { [Op.iLike]: `%${email}%` };
    if (otp_type) whereClause.otp_type = otp_type;
    if (status) whereClause.status = status;
    if (delivery_method) whereClause.delivery_method = delivery_method;

    const { count, rows } = await OtpLog.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'role'],
        required: false
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['otp_code'] } // Don't expose OTP codes in logs
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
    console.error('Error fetching OTP logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch OTP logs',
      error: error.message
    });
  }
});

// GET /api/otp-logs/stats - Get OTP statistics (admin only)
router.get('/stats', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Total OTPs in period
    const totalOtps = await OtpLog.count({
      where: {
        created_at: { [Op.gte]: startDate }
      }
    });

    // OTPs by status
    const statusStats = await OtpLog.findAll({
      where: {
        created_at: { [Op.gte]: startDate }
      },
      attributes: [
        'status',
        [OtpLog.sequelize.fn('COUNT', OtpLog.sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // OTPs by type
    const typeStats = await OtpLog.findAll({
      where: {
        created_at: { [Op.gte]: startDate }
      },
      attributes: [
        'otp_type',
        [OtpLog.sequelize.fn('COUNT', OtpLog.sequelize.col('id')), 'count']
      ],
      group: ['otp_type'],
      raw: true
    });

    // OTPs by delivery method
    const deliveryStats = await OtpLog.findAll({
      where: {
        created_at: { [Op.gte]: startDate }
      },
      attributes: [
        'delivery_method',
        [OtpLog.sequelize.fn('COUNT', OtpLog.sequelize.col('id')), 'count']
      ],
      group: ['delivery_method'],
      raw: true
    });

    // Success rate
    const verifiedOtps = await OtpLog.count({
      where: {
        created_at: { [Op.gte]: startDate },
        status: 'verified'
      }
    });

    const successRate = totalOtps > 0 ? (verifiedOtps / totalOtps * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        period_days: parseInt(days),
        total_otps: totalOtps,
        verified_otps: verifiedOtps,
        success_rate: parseFloat(successRate),
        status_breakdown: statusStats,
        type_breakdown: typeStats,
        delivery_breakdown: deliveryStats
      }
    });
  } catch (error) {
    console.error('Error fetching OTP statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch OTP statistics',
      error: error.message
    });
  }
});

// POST /api/otp-logs/generate - Generate new OTP
router.post('/generate', async (req, res) => {
  try {
    const {
      user_id,
      phone,
      email,
      otp_type,
      delivery_method,
      expires_in_minutes = 10
    } = req.body;

    // Validate required fields
    if (!otp_type || !delivery_method) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: otp_type, delivery_method'
      });
    }

    // Validate delivery method matches contact info
    if (delivery_method === 'sms' && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required for SMS delivery'
      });
    }

    if (delivery_method === 'email' && !email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required for email delivery'
      });
    }

    // Check rate limiting - max 3 OTPs per phone/email in 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentOtps = await OtpLog.count({
      where: {
        [Op.or]: [
          phone ? { phone } : {},
          email ? { email } : {}
        ],
        created_at: { [Op.gte]: fiveMinutesAgo },
        status: { [Op.in]: ['sent', 'verified'] }
      }
    });

    if (recentOtps >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please wait before requesting another OTP.'
      });
    }

    // Generate 6-digit OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();
    
    // Calculate expiry time
    const expiresAt = new Date(Date.now() + expires_in_minutes * 60 * 1000);

    // Get client IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Create OTP log entry
    const otpLog = await OtpLog.create({
      user_id,
      phone,
      email,
      otp_code: otpCode,
      otp_type,
      delivery_method,
      expires_at: expiresAt,
      ip_address: ipAddress,
      user_agent: userAgent
    });

    // TODO: Integrate with actual SMS/Email service
    // For now, we'll just log the OTP (remove in production)
    console.log(`Generated OTP: ${otpCode} for ${delivery_method === 'sms' ? phone : email}`);

    res.status(201).json({
      success: true,
      message: `OTP sent successfully via ${delivery_method}`,
      data: {
        otp_id: otpLog.id,
        expires_at: expiresAt,
        delivery_method,
        // Don't return the actual OTP code in production
        ...(process.env.NODE_ENV === 'development' && { otp_code: otpCode })
      }
    });
  } catch (error) {
    console.error('Error generating OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate OTP',
      error: error.message
    });
  }
});

// POST /api/otp-logs/verify - Verify OTP
router.post('/verify', async (req, res) => {
  try {
    const {
      otp_code,
      phone,
      email,
      otp_type
    } = req.body;

    // Validate required fields
    if (!otp_code || !otp_type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: otp_code, otp_type'
      });
    }

    if (!phone && !email) {
      return res.status(400).json({
        success: false,
        message: 'Either phone or email is required'
      });
    }

    // Find the OTP log entry
    const whereClause = {
      otp_code,
      otp_type,
      status: 'sent',
      expires_at: { [Op.gt]: new Date() }
    };

    if (phone) whereClause.phone = phone;
    if (email) whereClause.email = email;

    const otpLog = await OtpLog.findOne({
      where: whereClause,
      order: [['created_at', 'DESC']]
    });

    if (!otpLog) {
      // Increment attempts for any matching OTP (even expired ones)
      await OtpLog.increment('attempts', {
        where: {
          otp_code,
          [Op.or]: [
            phone ? { phone } : {},
            email ? { email } : {}
          ]
        }
      });

      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Check max attempts
    if (otpLog.attempts >= otpLog.max_attempts) {
      await otpLog.update({ status: 'failed' });
      return res.status(400).json({
        success: false,
        message: 'Maximum verification attempts exceeded'
      });
    }

    // Verify OTP
    await otpLog.update({
      status: 'verified',
      verified_at: new Date(),
      attempts: otpLog.attempts + 1
    });

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        otp_id: otpLog.id,
        user_id: otpLog.user_id,
        verified_at: otpLog.verified_at
      }
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message
    });
  }
});

// POST /api/otp-logs/cleanup - Clean up expired OTPs (admin only)
router.post('/cleanup', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    // Update expired OTPs
    const expiredCount = await OtpLog.update(
      { status: 'expired' },
      {
        where: {
          status: 'sent',
          expires_at: { [Op.lt]: new Date() }
        }
      }
    );

    // Delete old OTP records (older than 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const deletedCount = await OtpLog.destroy({
      where: {
        created_at: { [Op.lt]: thirtyDaysAgo }
      }
    });

    res.json({
      success: true,
      message: 'OTP cleanup completed successfully',
      data: {
        expired_otps: expiredCount[0],
        deleted_old_records: deletedCount
      }
    });
  } catch (error) {
    console.error('Error cleaning up OTPs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup OTPs',
      error: error.message
    });
  }
});

// GET /api/otp-logs/user/:user_id - Get OTP logs for specific user (admin only)
router.get('/user/:user_id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { user_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await OtpLog.findAndCountAll({
      where: { user_id },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['otp_code'] }
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
    console.error('Error fetching user OTP logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user OTP logs',
      error: error.message
    });
  }
});

// DELETE /api/otp-logs/:id - Delete specific OTP log (admin only)
router.delete('/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const otpLog = await OtpLog.findByPk(req.params.id);
    
    if (!otpLog) {
      return res.status(404).json({
        success: false,
        message: 'OTP log not found'
      });
    }

    await otpLog.destroy();

    res.json({
      success: true,
      message: 'OTP log deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting OTP log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete OTP log',
      error: error.message
    });
  }
});

module.exports = router;
