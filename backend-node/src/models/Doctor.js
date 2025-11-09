const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Doctor = sequelize.define('Doctor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // Authentication
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  // Basic Information
  full_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  date_of_birth: {
    type: DataTypes.DATE
  },
  gender: {
    type: DataTypes.STRING(10)
  },
  // Professional Information
  primary_specialization: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'primary_specialization'
  },
  secondary_specializations: {
    type: DataTypes.JSONB
  },
  medical_council_number: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  medical_council_state: {
    type: DataTypes.STRING(100)
  },
  license_expiry_date: {
    type: DataTypes.DATE
  },
  // Experience
  experience_years: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  post_masters_years: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  bio: {
    type: DataTypes.TEXT
  },
  // Fees
  consultation_fee: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  surgery_fee: {
    type: DataTypes.FLOAT
  },
  followup_fee: {
    type: DataTypes.FLOAT
  },
  // Training & Credentials
  training_type: {
    type: DataTypes.STRING(50)
  },
  fellowships: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  procedures_completed: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Online Presence
  google_reviews_link: {
    type: DataTypes.STRING(500)
  },
  website_url: {
    type: DataTypes.STRING(500)
  },
  linkedin_url: {
    type: DataTypes.STRING(500)
  },
  // Availability
  online_consultation: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  in_person_consultation: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  emergency_services: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Location
  location: {
    type: DataTypes.STRING(255)
  },
  clinic_address: {
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
  // Rating & Status
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  total_reviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending'
  },
  verification_status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending'
  },
  // Profile Metadata
  image_url: {
    type: DataTypes.STRING(500)
  },
  profile_video_url: {
    type: DataTypes.STRING(500)
  },
  online_status: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  profile_completeness: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  verification_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Languages
  languages_spoken: {
    type: DataTypes.JSONB
  },
  // Timestamps
  last_login: {
    type: DataTypes.DATE
  },
  approved_at: {
    type: DataTypes.DATE
  },
  approved_by: {
    type: DataTypes.UUID
  }
}, {
  tableName: 'doctors',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false
});

module.exports = Doctor;
