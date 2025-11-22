const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CommissionAgreement = sequelize.define('CommissionAgreement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  entity_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['doctor', 'hospital', 'implant_company']]
    }
  },
  entity_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  commission_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['percentage', 'fixed_amount', 'tiered', 'hybrid']]
    }
  },
  commission_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  fixed_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  tiered_structure: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  minimum_monthly_volume: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  payment_terms: {
    type: DataTypes.STRING(50),
    defaultValue: 'net_30'
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'INR'
  },
  applicable_services: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  excluded_services: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'draft',
    validate: {
      isIn: [['draft', 'active', 'suspended', 'terminated', 'expired']]
    }
  },
  effective_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  expiry_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  auto_renewal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  agreement_document_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  tax_treatment: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  compliance_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  total_transactions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_commission_earned: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  last_commission_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  approved_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
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
  tableName: 'commission_agreements',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = CommissionAgreement;
