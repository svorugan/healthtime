const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id'
    }
  },
  surgery_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'surgeries',
      key: 'id'
    }
  },
  doctor_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'doctors',
      key: 'id'
    }
  },
  implant_id: {
    type: DataTypes.UUID,
    references: {
      model: 'implants',
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
  booking_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  preferred_surgery_date: {
    type: DataTypes.DATE
  },
  actual_surgery_date: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending'
  },
  payment_status: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending'
  },
  total_cost: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  advance_payment: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  paid_amount: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  remaining_amount: {
    type: DataTypes.FLOAT
  },
  special_requirements: {
    type: DataTypes.TEXT
  },
  notes: {
    type: DataTypes.TEXT
  },
  confirmed_at: {
    type: DataTypes.DATE
  },
  completed_at: {
    type: DataTypes.DATE
  },
  cancelled_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'bookings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false
});

module.exports = Booking;
