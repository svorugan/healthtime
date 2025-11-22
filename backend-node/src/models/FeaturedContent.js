const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FeaturedContent = sequelize.define('FeaturedContent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['doctor', 'hospital', 'testimonial', 'procedure']]
    }
  },
  entity_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  display_order: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  region: {
    type: DataTypes.STRING(10),
    defaultValue: 'global'
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'featured_content',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = FeaturedContent;
