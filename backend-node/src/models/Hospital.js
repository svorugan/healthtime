const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Hospital = sequelize.define('Hospital', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  zone: {
    type: DataTypes.STRING(100)
  },
  location: {
    type: DataTypes.STRING(255)
  },
  address: {
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
  latitude: {
    type: DataTypes.FLOAT
  },
  longitude: {
    type: DataTypes.FLOAT
  },
  facilities: {
    type: DataTypes.JSONB
  },
  total_beds: {
    type: DataTypes.INTEGER
  },
  icu_beds: {
    type: DataTypes.INTEGER
  },
  operation_theaters: {
    type: DataTypes.INTEGER
  },
  emergency_services: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  ambulance_service: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  insurance_accepted: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  accreditations: {
    type: DataTypes.JSONB
  },
  base_price: {
    type: DataTypes.FLOAT
  },
  consumables_cost: {
    type: DataTypes.FLOAT
  },
  room_charges_per_day: {
    type: DataTypes.FLOAT
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  email: {
    type: DataTypes.STRING(255)
  },
  website: {
    type: DataTypes.STRING(500)
  },
  image_url: {
    type: DataTypes.STRING(500)
  },
  images: {
    type: DataTypes.JSONB
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  total_reviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'hospitals',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false
});

module.exports = Hospital;
