const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FeatureConfiguration = sequelize.define('FeatureConfiguration', {
  config_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  deployment_id: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  deployment_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  module_config: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  auth_config: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  branding_config: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  landing_page_config: {
    type: DataTypes.JSONB,
    allowNull: true
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
  tableName: 'feature_configurations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = FeatureConfiguration;
