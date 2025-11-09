const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PatientVitalSigns = sequelize.define('PatientVitalSigns', {
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
  blood_pressure_systolic: {
    type: DataTypes.INTEGER
  },
  blood_pressure_diastolic: {
    type: DataTypes.INTEGER
  },
  heart_rate: {
    type: DataTypes.INTEGER
  },
  temperature: {
    type: DataTypes.FLOAT
  },
  respiratory_rate: {
    type: DataTypes.INTEGER
  },
  oxygen_saturation: {
    type: DataTypes.FLOAT
  },
  blood_glucose: {
    type: DataTypes.FLOAT
  },
  weight_kg: {
    type: DataTypes.FLOAT
  },
  height_cm: {
    type: DataTypes.FLOAT
  },
  bmi: {
    type: DataTypes.FLOAT
  },
  measured_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  measured_by: {
    type: DataTypes.STRING(255)
  },
  measurement_context: {
    type: DataTypes.STRING(100)
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'patient_vital_signs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  underscored: false
});

module.exports = PatientVitalSigns;
