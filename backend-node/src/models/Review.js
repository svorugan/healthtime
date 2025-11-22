const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  reviewable_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['doctor', 'hospital', 'implant_company', 'booking_experience', 'platform']]
    }
  },
  reviewable_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  reviewer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reviewer_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['patient', 'doctor', 'hospital']]
    }
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  review_title: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  review_text: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  detailed_ratings: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  booking_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'bookings',
      key: 'id'
    }
  },
  procedure_type: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  treatment_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_anonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'approved', 'rejected', 'flagged']]
    }
  },
  moderation_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  moderated_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  moderated_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  helpful_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  not_helpful_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'reviews',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Review;
