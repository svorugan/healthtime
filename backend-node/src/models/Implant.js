const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Implant = sequelize.define('Implant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  brand: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  brand_type: {
    type: DataTypes.STRING(100)
  },
  manufacturer: {
    type: DataTypes.STRING(255)
  },
  material: {
    type: DataTypes.STRING(255)
  },
  surgery_type: {
    type: DataTypes.STRING(255)
  },
  expected_life: {
    type: DataTypes.STRING(100)
  },
  range_of_motion: {
    type: DataTypes.STRING(100)
  },
  peer_reviewed_studies: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  success_rate: {
    type: DataTypes.FLOAT
  },
  warranty: {
    type: DataTypes.STRING(100)
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  features: {
    type: DataTypes.JSONB
  },
  company_highlights: {
    type: DataTypes.JSONB
  },
  suitable_age: {
    type: DataTypes.STRING(100)
  },
  activity_level: {
    type: DataTypes.STRING(100)
  },
  image_url: {
    type: DataTypes.STRING(500)
  },
  brochure_url: {
    type: DataTypes.STRING(500)
  }
}, {
  tableName: 'implants',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false
});

module.exports = Implant;
