const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AdminUser = sequelize.define('AdminUser', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  full_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(50),
    defaultValue: 'admin'
  }
}, {
  tableName: 'admin_users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  underscored: false
});

module.exports = AdminUser;
