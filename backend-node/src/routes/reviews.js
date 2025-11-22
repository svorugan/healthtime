const express = require('express');
const { Review, User, Doctor, Hospital, Booking } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// GET /api/reviews - Get all reviews with filters
router.get('/', async (req, res) => {
  try {
    const { 
      reviewable_type, 
      reviewable_id, 
      reviewer_id,
      status = 'approved',
      rating,
      is_featured,
      page = 1, 
      limit = 10 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Build filters
    if (reviewable_type) whereClause.reviewable_type = reviewable_type;
    if (reviewable_id) whereClause.reviewable_id = reviewable_id;
    if (reviewer_id) whereClause.reviewer_id = reviewer_id;
    if (status) whereClause.status = status;
    if (rating) whereClause.rating = parseInt(rating);
    if (is_featured !== undefined) whereClause.is_featured = is_featured === 'true';

    const { count, rows } = await Review.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'reviewer',
        attributes: ['id', 'email', 'role']
      }, {
        model: Booking,
        as: 'booking',
        attributes: ['id', 'booking_date', 'status'],
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
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
});

// GET /api/reviews/:id - Get specific review
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'reviewer',
        attributes: ['id', 'email', 'role']
      }, {
        model: Booking,
        as: 'booking',
        attributes: ['id', 'booking_date', 'status'],
        required: false
      }]
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review',
      error: error.message
    });
  }
});

// POST /api/reviews - Create new review
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      reviewable_type,
      reviewable_id,
      reviewer_type,
      rating,
      review_title,
      review_text,
      detailed_ratings,
      booking_id,
      procedure_type,
      treatment_date,
      is_anonymous
    } = req.body;

    // Validate required fields
    if (!reviewable_type || !reviewable_id || !reviewer_type || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: reviewable_type, reviewable_id, reviewer_type, rating'
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Verify the reviewable entity exists
    let reviewableEntity;
    switch (reviewable_type) {
      case 'doctor':
        reviewableEntity = await Doctor.findByPk(reviewable_id);
        break;
      case 'hospital':
        reviewableEntity = await Hospital.findByPk(reviewable_id);
        break;
      case 'booking_experience':
        reviewableEntity = await Booking.findByPk(reviewable_id);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid reviewable_type'
        });
    }

    if (!reviewableEntity) {
      return res.status(404).json({
        success: false,
        message: `${reviewable_type} not found`
      });
    }

    // Check if booking exists if provided
    if (booking_id) {
      const booking = await Booking.findByPk(booking_id);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Verify the user is associated with the booking
      if (booking.patient_id !== req.user.patientProfile?.id && 
          booking.doctor_id !== req.user.doctorProfile?.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only review bookings you are associated with'
        });
      }
    }

    const review = await Review.create({
      reviewable_type,
      reviewable_id,
      reviewer_id: req.user.id,
      reviewer_type,
      rating,
      review_title,
      review_text,
      detailed_ratings,
      booking_id,
      procedure_type,
      treatment_date,
      is_anonymous: is_anonymous || false,
      status: 'pending' // Reviews need moderation
    });

    const createdReview = await Review.findByPk(review.id, {
      include: [{
        model: User,
        as: 'reviewer',
        attributes: ['id', 'email', 'role']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully and is pending moderation',
      data: createdReview
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message
    });
  }
});

// PUT /api/reviews/:id - Update review
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is authorized to update this review
    if (req.user.id !== review.reviewer_id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews'
      });
    }

    const {
      rating,
      review_title,
      review_text,
      detailed_ratings,
      procedure_type,
      treatment_date,
      is_anonymous
    } = req.body;

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    await review.update({
      rating,
      review_title,
      review_text,
      detailed_ratings,
      procedure_type,
      treatment_date,
      is_anonymous,
      status: 'pending' // Reset to pending after update
    });

    const updatedReview = await Review.findByPk(review.id, {
      include: [{
        model: User,
        as: 'reviewer',
        attributes: ['id', 'email', 'role']
      }]
    });

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
});

// DELETE /api/reviews/:id - Delete review
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is authorized to delete this review
    if (req.user.id !== review.reviewer_id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    await review.destroy();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
});

// POST /api/reviews/:id/moderate - Moderate review (admin only)
router.post('/:id/moderate', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const { status, moderation_notes, is_featured } = req.body;

    if (!['approved', 'rejected', 'flagged'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved, rejected, or flagged'
      });
    }

    await review.update({
      status,
      moderation_notes,
      is_featured: is_featured || false,
      moderated_by: req.user.id,
      moderated_at: new Date()
    });

    const moderatedReview = await Review.findByPk(review.id, {
      include: [{
        model: User,
        as: 'reviewer',
        attributes: ['id', 'email', 'role']
      }]
    });

    res.json({
      success: true,
      message: `Review ${status} successfully`,
      data: moderatedReview
    });
  } catch (error) {
    console.error('Error moderating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to moderate review',
      error: error.message
    });
  }
});

// POST /api/reviews/:id/helpful - Mark review as helpful/not helpful
router.post('/:id/helpful', authenticateToken, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const { is_helpful } = req.body;

    if (is_helpful === true) {
      await review.increment('helpful_count');
    } else if (is_helpful === false) {
      await review.increment('not_helpful_count');
    } else {
      return res.status(400).json({
        success: false,
        message: 'is_helpful must be true or false'
      });
    }

    const updatedReview = await Review.findByPk(review.id);

    res.json({
      success: true,
      message: 'Feedback recorded successfully',
      data: {
        helpful_count: updatedReview.helpful_count,
        not_helpful_count: updatedReview.not_helpful_count
      }
    });
  } catch (error) {
    console.error('Error recording helpfulness:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record feedback',
      error: error.message
    });
  }
});

// GET /api/reviews/entity/:type/:id - Get reviews for specific entity
router.get('/entity/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const { status = 'approved', page = 1, limit = 10 } = req.query;

    if (!['doctor', 'hospital', 'implant_company', 'booking_experience', 'platform'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid entity type'
      });
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Review.findAndCountAll({
      where: {
        reviewable_type: type,
        reviewable_id: id,
        status
      },
      include: [{
        model: User,
        as: 'reviewer',
        attributes: ['id', 'role']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    // Calculate average rating
    const avgRating = rows.length > 0 
      ? rows.reduce((sum, review) => sum + review.rating, 0) / rows.length 
      : 0;

    res.json({
      success: true,
      data: rows,
      statistics: {
        total_reviews: count,
        average_rating: Math.round(avgRating * 100) / 100
      },
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching entity reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
});

// GET /api/reviews/my - Get current user's reviews
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Review.findAndCountAll({
      where: { reviewer_id: req.user.id },
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
    console.error('Error fetching my reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your reviews',
      error: error.message
    });
  }
});

module.exports = router;
