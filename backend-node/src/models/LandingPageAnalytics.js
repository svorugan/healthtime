const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LandingPageAnalytics = sequelize.define('LandingPageAnalytics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  session_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  user_location: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  clicked_tile: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  search_query: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  conversion_action: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  page_section: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'landing_page_analytics',
  timestamps: false,
  createdAt: false,
  updatedAt: false
});

module.exports = LandingPageAnalytics;
