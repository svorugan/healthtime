const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HospitalAvailability = sequelize.define('HospitalAvailability', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  hospital_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'hospitals',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  facility_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['operation_theater', 'consultation_room', 'diagnostic_center']]
    }
  },
  facility_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  specialization_supported: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  equipment_available: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  available_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  available_time_slots: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  facility_cost_per_hour: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  equipment_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  support_staff_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  total_package_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  booking_lead_time_hours: {
    type: DataTypes.INTEGER,
    defaultValue: 24
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
  tableName: 'hospital_availability',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = HospitalAvailability;
