const express = require('express');
const { LandingPageAnalytics, User } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// POST /api/landing-page-analytics/track - Track user interaction
router.post('/track', async (req, res) => {
  try {
    const {
      session_id,
      user_location,
      clicked_tile,
      search_query,
      conversion_action,
      page_section
    } = req.body;

    // Get client IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Add IP-based location to user_location if not provided
    const locationData = {
      ...user_location,
      ip_address: ipAddress,
      user_agent: userAgent
    };

    const analytics = await LandingPageAnalytics.create({
      session_id,
      user_id: req.user?.id || null, // Optional - only if user is logged in
      user_location: locationData,
      clicked_tile,
      search_query,
      conversion_action,
      page_section
    });

    res.status(201).json({
      success: true,
      message: 'Analytics event tracked successfully',
      data: { id: analytics.id }
    });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track analytics event',
      error: error.message
    });
  }
});

// GET /api/landing-page-analytics - Get analytics data (admin only)
router.get('/', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { 
      start_date,
      end_date,
      page_section,
      conversion_action,
      clicked_tile,
      page = 1, 
      limit = 100 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Build filters
    if (page_section) whereClause.page_section = page_section;
    if (conversion_action) whereClause.conversion_action = conversion_action;
    if (clicked_tile) whereClause.clicked_tile = clicked_tile;
    
    if (start_date && end_date) {
      whereClause.timestamp = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    } else if (start_date) {
      whereClause.timestamp = { [Op.gte]: new Date(start_date) };
    } else if (end_date) {
      whereClause.timestamp = { [Op.lte]: new Date(end_date) };
    }

    const { count, rows } = await LandingPageAnalytics.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'role'],
        required: false
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['timestamp', 'DESC']]
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
    console.error('Error fetching analytics data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data',
      error: error.message
    });
  }
});

// GET /api/landing-page-analytics/dashboard - Get dashboard analytics (admin only)
router.get('/dashboard', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Total page views
    const totalViews = await LandingPageAnalytics.count({
      where: {
        timestamp: { [Op.gte]: startDate }
      }
    });

    // Unique sessions
    const uniqueSessions = await LandingPageAnalytics.count({
      distinct: true,
      col: 'session_id',
      where: {
        timestamp: { [Op.gte]: startDate }
      }
    });

    // Top clicked tiles
    const topTiles = await LandingPageAnalytics.findAll({
      where: {
        timestamp: { [Op.gte]: startDate },
        clicked_tile: { [Op.not]: null }
      },
      attributes: [
        'clicked_tile',
        [LandingPageAnalytics.sequelize.fn('COUNT', LandingPageAnalytics.sequelize.col('id')), 'clicks']
      ],
      group: ['clicked_tile'],
      order: [[LandingPageAnalytics.sequelize.fn('COUNT', LandingPageAnalytics.sequelize.col('id')), 'DESC']],
      limit: 10,
      raw: true
    });

    // Top search queries
    const topSearches = await LandingPageAnalytics.findAll({
      where: {
        timestamp: { [Op.gte]: startDate },
        search_query: { [Op.not]: null }
      },
      attributes: [
        'search_query',
        [LandingPageAnalytics.sequelize.fn('COUNT', LandingPageAnalytics.sequelize.col('id')), 'searches']
      ],
      group: ['search_query'],
      order: [[LandingPageAnalytics.sequelize.fn('COUNT', LandingPageAnalytics.sequelize.col('id')), 'DESC']],
      limit: 10,
      raw: true
    });

    // Conversion actions
    const conversions = await LandingPageAnalytics.findAll({
      where: {
        timestamp: { [Op.gte]: startDate },
        conversion_action: { [Op.not]: null }
      },
      attributes: [
        'conversion_action',
        [LandingPageAnalytics.sequelize.fn('COUNT', LandingPageAnalytics.sequelize.col('id')), 'count']
      ],
      group: ['conversion_action'],
      order: [[LandingPageAnalytics.sequelize.fn('COUNT', LandingPageAnalytics.sequelize.col('id')), 'DESC']],
      raw: true
    });

    // Page section engagement
    const sectionEngagement = await LandingPageAnalytics.findAll({
      where: {
        timestamp: { [Op.gte]: startDate },
        page_section: { [Op.not]: null }
      },
      attributes: [
        'page_section',
        [LandingPageAnalytics.sequelize.fn('COUNT', LandingPageAnalytics.sequelize.col('id')), 'interactions']
      ],
      group: ['page_section'],
      order: [[LandingPageAnalytics.sequelize.fn('COUNT', LandingPageAnalytics.sequelize.col('id')), 'DESC']],
      raw: true
    });

    // Daily trend (last 30 days)
    const dailyTrend = await LandingPageAnalytics.findAll({
      where: {
        timestamp: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      },
      attributes: [
        [LandingPageAnalytics.sequelize.fn('DATE', LandingPageAnalytics.sequelize.col('timestamp')), 'date'],
        [LandingPageAnalytics.sequelize.fn('COUNT', LandingPageAnalytics.sequelize.col('id')), 'views'],
        [LandingPageAnalytics.sequelize.fn('COUNT', LandingPageAnalytics.sequelize.fn('DISTINCT', LandingPageAnalytics.sequelize.col('session_id'))), 'unique_sessions']
      ],
      group: [LandingPageAnalytics.sequelize.fn('DATE', LandingPageAnalytics.sequelize.col('timestamp'))],
      order: [[LandingPageAnalytics.sequelize.fn('DATE', LandingPageAnalytics.sequelize.col('timestamp')), 'ASC']],
      raw: true
    });

    // Calculate conversion rate
    const totalConversions = conversions.reduce((sum, conv) => sum + parseInt(conv.count), 0);
    const conversionRate = uniqueSessions > 0 ? (totalConversions / uniqueSessions * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        period_days: parseInt(days),
        overview: {
          total_views: totalViews,
          unique_sessions: uniqueSessions,
          total_conversions: totalConversions,
          conversion_rate: parseFloat(conversionRate)
        },
        top_tiles: topTiles,
        top_searches: topSearches,
        conversions: conversions,
        section_engagement: sectionEngagement,
        daily_trend: dailyTrend
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard analytics',
      error: error.message
    });
  }
});

// GET /api/landing-page-analytics/heatmap - Get heatmap data (admin only)
router.get('/heatmap', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get click data by page section and tile
    const heatmapData = await LandingPageAnalytics.findAll({
      where: {
        timestamp: { [Op.gte]: startDate },
        clicked_tile: { [Op.not]: null },
        page_section: { [Op.not]: null }
      },
      attributes: [
        'page_section',
        'clicked_tile',
        [LandingPageAnalytics.sequelize.fn('COUNT', LandingPageAnalytics.sequelize.col('id')), 'clicks']
      ],
      group: ['page_section', 'clicked_tile'],
      order: [[LandingPageAnalytics.sequelize.fn('COUNT', LandingPageAnalytics.sequelize.col('id')), 'DESC']],
      raw: true
    });

    // Group by page section
    const heatmapBySection = {};
    heatmapData.forEach(item => {
      if (!heatmapBySection[item.page_section]) {
        heatmapBySection[item.page_section] = [];
      }
      heatmapBySection[item.page_section].push({
        tile: item.clicked_tile,
        clicks: parseInt(item.clicks)
      });
    });

    res.json({
      success: true,
      data: {
        period_days: parseInt(days),
        heatmap_by_section: heatmapBySection,
        raw_data: heatmapData
      }
    });
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch heatmap data',
      error: error.message
    });
  }
});

// GET /api/landing-page-analytics/user-journey - Get user journey data (admin only)
router.get('/user-journey', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { session_id, days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    let whereClause = {
      timestamp: { [Op.gte]: startDate }
    };

    if (session_id) {
      whereClause.session_id = session_id;
    }

    const journeyData = await LandingPageAnalytics.findAll({
      where: whereClause,
      order: [['session_id', 'ASC'], ['timestamp', 'ASC']],
      limit: session_id ? 100 : 1000 // Limit results for performance
    });

    // Group by session
    const journeysBySession = {};
    journeyData.forEach(event => {
      if (!journeysBySession[event.session_id]) {
        journeysBySession[event.session_id] = [];
      }
      journeysBySession[event.session_id].push({
        timestamp: event.timestamp,
        page_section: event.page_section,
        clicked_tile: event.clicked_tile,
        search_query: event.search_query,
        conversion_action: event.conversion_action,
        user_location: event.user_location
      });
    });

    // Calculate journey statistics
    const journeyStats = {
      total_sessions: Object.keys(journeysBySession).length,
      avg_events_per_session: journeyData.length / Object.keys(journeysBySession).length,
      sessions_with_conversions: 0,
      most_common_entry_points: {},
      most_common_exit_points: {}
    };

    Object.values(journeysBySession).forEach(journey => {
      // Check for conversions
      if (journey.some(event => event.conversion_action)) {
        journeyStats.sessions_with_conversions++;
      }

      // Track entry points
      if (journey.length > 0) {
        const entryPoint = journey[0].page_section || 'unknown';
        journeyStats.most_common_entry_points[entryPoint] = 
          (journeyStats.most_common_entry_points[entryPoint] || 0) + 1;

        // Track exit points
        const exitPoint = journey[journey.length - 1].page_section || 'unknown';
        journeyStats.most_common_exit_points[exitPoint] = 
          (journeyStats.most_common_exit_points[exitPoint] || 0) + 1;
      }
    });

    res.json({
      success: true,
      data: {
        period_days: parseInt(days),
        statistics: journeyStats,
        journeys: session_id ? journeysBySession : Object.keys(journeysBySession).slice(0, 10).reduce((obj, key) => {
          obj[key] = journeysBySession[key];
          return obj;
        }, {}) // Return only first 10 sessions if no specific session requested
      }
    });
  } catch (error) {
    console.error('Error fetching user journey data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user journey data',
      error: error.message
    });
  }
});

// DELETE /api/landing-page-analytics/cleanup - Clean up old analytics data (admin only)
router.delete('/cleanup', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { days = 90 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const deletedCount = await LandingPageAnalytics.destroy({
      where: {
        timestamp: { [Op.lt]: cutoffDate }
      }
    });

    res.json({
      success: true,
      message: 'Analytics data cleanup completed successfully',
      data: {
        deleted_records: deletedCount,
        cutoff_date: cutoffDate
      }
    });
  } catch (error) {
    console.error('Error cleaning up analytics data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup analytics data',
      error: error.message
    });
  }
});

module.exports = router;
