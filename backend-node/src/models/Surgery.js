const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Surgery = sequelize.define('Surgery', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.STRING(100)
  },
  duration: {
    type: DataTypes.STRING(100)
  },
  recovery_time: {
    type: DataTypes.STRING(100)
  },
  anesthesia_type: {
    type: DataTypes.STRING(100)
  },
  image_url: {
    type: DataTypes.STRING(500)
  },
  video_url: {
    type: DataTypes.STRING(500)
  },
  base_cost: {
    type: DataTypes.FLOAT
  },
  prerequisites: {
    type: DataTypes.JSONB
  },
  risks: {
    type: DataTypes.JSONB
  },
  success_rate: {
    type: DataTypes.FLOAT
  }
}, {
  tableName: 'surgeries',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false
});

module.exports = Surgery;
