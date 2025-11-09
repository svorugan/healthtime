const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['admin', 'doctor', 'patient', 'hospital', 'implant']]
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  failed_login_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  account_locked_until: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['email']
    },
    {
      fields: ['role']
    },
    {
      fields: ['is_active']
    }
  ]
});

// Instance methods
User.prototype.isAccountLocked = function() {
  if (!this.account_locked_until) return false;
  return new Date() < this.account_locked_until;
};

User.prototype.incrementFailedAttempts = async function() {
  this.failed_login_attempts += 1;
  
  // Lock account after 5 failed attempts for 15 minutes
  if (this.failed_login_attempts >= 5) {
    this.account_locked_until = new Date(Date.now() + 15 * 60 * 1000);
  }
  
  await this.save();
};

User.prototype.resetFailedAttempts = async function() {
  this.failed_login_attempts = 0;
  this.account_locked_until = null;
  await this.save();
};

User.prototype.updateLastLogin = async function() {
  this.last_login = new Date();
  await this.save();
};

// Class methods
User.findByEmail = async function(email) {
  return await this.findOne({ where: { email } });
};

User.findActiveByEmail = async function(email) {
  return await this.findOne({ 
    where: { 
      email,
      is_active: true 
    } 
  });
};

module.exports = User;
