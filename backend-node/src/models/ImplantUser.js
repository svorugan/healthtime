const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ImplantUser = sequelize.define('ImplantUser', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  implant_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'implants',
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
    type: DataTypes.STRING(100) // Admin, Sales Rep, Manager
  },
  is_primary_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'implant_users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'implant_id']
    }
  ]
});

module.exports = ImplantUser;

