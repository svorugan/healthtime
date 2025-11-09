const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PatientMedicalHistory = sequelize.define('PatientMedicalHistory', {
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
  chronic_diseases: {
    type: DataTypes.JSONB
  },
  past_surgeries_detailed: {
    type: DataTypes.JSONB
  },
  current_medications_detailed: {
    type: DataTypes.JSONB
  },
  allergies_detailed: {
    type: DataTypes.JSONB
  },
  immunization_records: {
    type: DataTypes.JSONB
  },
  family_history: {
    type: DataTypes.JSONB
  },
  medical_reports_url: {
    type: DataTypes.JSONB
  },
  prescription_url: {
    type: DataTypes.JSONB
  },
  lab_reports_url: {
    type: DataTypes.JSONB
  }
}, {
  tableName: 'patient_medical_history',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false
});

module.exports = PatientMedicalHistory;
