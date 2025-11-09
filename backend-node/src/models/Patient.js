const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // Personal Information
  full_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  alternate_phone: {
    type: DataTypes.STRING(20)
  },
  date_of_birth: {
    type: DataTypes.DATE,
    allowNull: false
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  gender: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  occupation: {
    type: DataTypes.STRING(255)
  },
  preferred_language: {
    type: DataTypes.STRING(50),
    defaultValue: 'English'
  },
  // Address Information
  current_address: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'current_address'
  },
  permanent_address: {
    type: DataTypes.TEXT
  },
  city: {
    type: DataTypes.STRING(100)
  },
  state: {
    type: DataTypes.STRING(100)
  },
  pincode: {
    type: DataTypes.STRING(10)
  },
  // Emergency Contact
  emergency_contact_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  emergency_contact_phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  emergency_contact_relationship: {
    type: DataTypes.STRING(100)
  },
  // Communication Preferences
  preferred_communication: {
    type: DataTypes.STRING(20),
    defaultValue: 'email'
  },
  // Insurance Information
  insurance_provider: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  insurance_number: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  insurance_plan_type: {
    type: DataTypes.STRING(100)
  },
  insurance_group_number: {
    type: DataTypes.STRING(100)
  },
  policy_holder_name: {
    type: DataTypes.STRING(255)
  },
  employer_name: {
    type: DataTypes.STRING(255)
  },
  secondary_insurance_provider: {
    type: DataTypes.STRING(255)
  },
  secondary_insurance_number: {
    type: DataTypes.STRING(100)
  },
  // Insurance Files
  insurance_card_front_url: {
    type: DataTypes.STRING(500)
  },
  insurance_card_back_url: {
    type: DataTypes.STRING(500)
  },
  insurance_file_uploaded: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Financial Information
  preferred_payment_method: {
    type: DataTypes.STRING(50),
    defaultValue: 'insurance'
  },
  financial_assistance_needed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  insurance_preauth_status: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending'
  },
  // Basic Medical Information
  blood_group: {
    type: DataTypes.STRING(10)
  },
  height_cm: {
    type: DataTypes.FLOAT
  },
  weight_kg: {
    type: DataTypes.FLOAT
  },
  bmi: {
    type: DataTypes.FLOAT
  },
  // Lifestyle Factors
  smoking_status: {
    type: DataTypes.STRING(20)
  },
  alcohol_consumption: {
    type: DataTypes.STRING(20)
  },
  substance_use_history: {
    type: DataTypes.TEXT
  },
  // Current Health Status (JSON fields)
  current_medications: {
    type: DataTypes.JSONB
  },
  known_allergies: {
    type: DataTypes.JSONB
  },
  chronic_conditions: {
    type: DataTypes.JSONB
  },
  past_surgeries: {
    type: DataTypes.JSONB
  },
  family_medical_history: {
    type: DataTypes.JSONB
  },
  // Current Symptoms
  chief_complaint: {
    type: DataTypes.TEXT
  },
  current_symptoms: {
    type: DataTypes.JSONB
  },
  symptom_duration: {
    type: DataTypes.STRING(100)
  },
  pain_scale: {
    type: DataTypes.INTEGER
  },
  // Healthcare Providers
  primary_care_physician: {
    type: DataTypes.STRING(255),
    field: 'primary_care_physician'
  },
  referring_doctor: {
    type: DataTypes.STRING(255),
    field: 'referring_doctor'
  },
  // System Fields
  last_login: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'patients',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false
});

module.exports = Patient;
