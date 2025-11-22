const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CommissionTransaction = sequelize.define('CommissionTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  commission_agreement_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'commission_agreements',
      key: 'id'
    }
  },
  booking_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'bookings',
      key: 'id'
    }
  },
  transaction_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  commission_rate_applied: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  commission_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  payment_status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'paid', 'disputed', 'refunded']]
    }
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  payment_reference: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  service_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  transaction_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
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
  tableName: 'commission_transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = CommissionTransaction;
