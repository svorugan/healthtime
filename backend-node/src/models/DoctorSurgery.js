const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DoctorSurgery = sequelize.define('DoctorSurgery', {
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
  surgery_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'surgeries',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  experience_years: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  procedures_completed: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_primary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'doctor_surgeries',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  indexes: [
    {
      unique: true,
      fields: ['doctor_id', 'surgery_id']
    }
  ]
});

module.exports = DoctorSurgery;

