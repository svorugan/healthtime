const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OtpLog = sequelize.define('OtpLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  otp_code: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  otp_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['login', 'registration', 'password_reset', 'phone_verification', 'email_verification']]
    }
  },
  delivery_method: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      isIn: [['sms', 'email', 'whatsapp']]
    }
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'sent',
    validate: {
      isIn: [['sent', 'verified', 'expired', 'failed']]
    }
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  max_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 3
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.INET,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'otp_logs',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = OtpLog;
