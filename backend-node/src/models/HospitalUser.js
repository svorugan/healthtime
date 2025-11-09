const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HospitalUser = sequelize.define('HospitalUser', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  hospital_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'hospitals',
      key: 'id'
    }
  },
  full_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  designation: {
    type: DataTypes.STRING(100) // Admin, Manager, Staff
  },
  department: {
    type: DataTypes.STRING(100)
  },
  is_primary_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'hospital_users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false
});

module.exports = HospitalUser;

