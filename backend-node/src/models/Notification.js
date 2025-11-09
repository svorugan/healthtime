const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
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
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(50),
    defaultValue: 'info', // info, success, warning, error
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(50), // booking, appointment, payment, system, etc.
    defaultValue: 'system'
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  read_at: {
    type: DataTypes.DATE
  },
  action_url: {
    type: DataTypes.STRING(500) // URL to navigate when notification is clicked
  },
  metadata: {
    type: DataTypes.JSONB // Additional data (booking_id, etc.)
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['is_read']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Notification;

