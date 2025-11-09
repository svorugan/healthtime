const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Notification, User } = require('../models');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');

// Send notification
router.post('/send', authenticate, authorize('admin'), async (req, res) => {
  const { user_id, title, message, type = 'info', category = 'system', action_url, metadata } = req.body;

  try {
    if (!user_id || !title || !message) {
      return res.status(400).json({ detail: 'user_id, title, and message are required' });
    }

    const notification = await Notification.create({
      user_id,
      title,
      message,
      type,
      category,
      action_url,
      metadata
    });

    return res.status(201).json({
      message: 'Notification sent successfully',
      notification: notification
    });
  } catch (error) {
    console.error('Send notification error:', error);
    return res.status(500).json({ detail: 'Failed to send notification: ' + error.message });
  }
});

// Get user notifications
router.get('/user/:user_id', authenticate, authorize('patient', 'doctor', 'admin', 'hospital', 'implant'), async (req, res) => {
  const { user_id } = req.params;
  const { unread_only = false, limit = 50 } = req.query;

  try {
    // Check if user is accessing their own notifications or is admin
    if (req.user.role !== 'admin' && req.user.user_id !== user_id) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    const whereClause = { user_id };
    if (unread_only === 'true') {
      whereClause.is_read = false;
    }

    const notifications = await Notification.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit)
    });

    return res.json({
      user_id: user_id,
      total: notifications.length,
      unread_count: notifications.filter(n => !n.is_read).length,
      notifications: notifications
    });
  } catch (error) {
    console.error('Get user notifications error:', error);
    return res.status(500).json({ detail: 'Failed to fetch notifications: ' + error.message });
  }
});

// Mark notification as read
router.put('/:notification_id/read', authenticate, authorize('patient', 'doctor', 'admin', 'hospital', 'implant'), async (req, res) => {
  const { notification_id } = req.params;

  try {
    const notification = await Notification.findByPk(notification_id);
    if (!notification) {
      return res.status(404).json({ detail: 'Notification not found' });
    }

    // Check if user owns this notification or is admin
    if (req.user.role !== 'admin' && notification.user_id !== req.user.user_id) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    notification.is_read = true;
    notification.read_at = new Date();
    await notification.save();

    return res.json({
      message: 'Notification marked as read',
      notification: notification
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return res.status(500).json({ detail: 'Failed to mark notification as read: ' + error.message });
  }
});

// Mark all notifications as read for a user
router.put('/user/:user_id/read-all', authenticate, authorize('patient', 'doctor', 'admin', 'hospital', 'implant'), async (req, res) => {
  const { user_id } = req.params;

  try {
    // Check if user is accessing their own notifications or is admin
    if (req.user.role !== 'admin' && req.user.user_id !== user_id) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    const result = await Notification.update(
      {
        is_read: true,
        read_at: new Date()
      },
      {
        where: {
          user_id: user_id,
          is_read: false
        }
      }
    );

    return res.json({
      message: 'All notifications marked as read',
      updated_count: result[0]
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return res.status(500).json({ detail: 'Failed to mark notifications as read: ' + error.message });
  }
});

// Delete notification
router.delete('/:notification_id', authenticate, authorize('patient', 'doctor', 'admin', 'hospital', 'implant'), async (req, res) => {
  const { notification_id } = req.params;

  try {
    const notification = await Notification.findByPk(notification_id);
    if (!notification) {
      return res.status(404).json({ detail: 'Notification not found' });
    }

    // Check if user owns this notification or is admin
    if (req.user.role !== 'admin' && notification.user_id !== req.user.user_id) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    await notification.destroy();

    return res.json({
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    return res.status(500).json({ detail: 'Failed to delete notification: ' + error.message });
  }
});

module.exports = router;

