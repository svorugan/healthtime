const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DoctorAvailability = sequelize.define('DoctorAvailability', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  doctor_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'doctors',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  available_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  available_time_slots: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  willing_to_travel: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  max_travel_distance_km: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  preferred_cities: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  consultation_fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  surgery_fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  travel_allowance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  required_equipment: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  required_support_staff: {
    type: DataTypes.INTEGER,
    defaultValue: 2
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  booking_lead_time_hours: {
    type: DataTypes.INTEGER,
    defaultValue: 48
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
  tableName: 'doctor_availability',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = DoctorAvailability;
