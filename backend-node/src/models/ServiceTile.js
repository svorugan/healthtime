const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ServiceTile = sequelize.define('ServiceTile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  service_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  display_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  icon_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  avg_cost_min: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  avg_cost_max: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'INR'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  display_order: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  region: {
    type: DataTypes.STRING(10),
    defaultValue: 'global'
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
  tableName: 'service_tiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ServiceTile;
