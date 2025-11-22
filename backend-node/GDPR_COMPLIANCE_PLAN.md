# GDPR Compliance Plan for HealthTime

## Overview
This document outlines the GDPR compliance strategy for user data management in HealthTime.

## Data Classification

### Personal Data Categories
1. **Identity Data**: Name, email, phone, address
2. **Health Data**: Medical history, vital signs, conditions (Special Category - Article 9)
3. **Behavioral Data**: Login times, API usage, preferences
4. **Financial Data**: Payment information, insurance details

### Data Retention Periods
- **Active Users**: Indefinite (with consent)
- **Inactive Users**: 3 years after last login
- **Deleted Users**: 30 days for recovery, then permanent deletion
- **Medical Records**: 7 years (legal requirement)
- **Audit Logs**: 6 years (compliance requirement)

## Implementation Strategy

### 1. User Status Management
*See Database Schema Updates section below for the complete ALTER TABLE statements.*

### 2. Three-Tier Deletion System

#### Tier 1: Deactivation (Operational)
- Set `is_active = false`
- User cannot login
- Data remains for business operations
- Reversible by admin

#### Tier 2: Soft Delete (GDPR Preparation)
- Set `deleted_at = NOW()`
- User marked for deletion
- 30-day grace period for recovery
- Data anonymized in reports

#### Tier 3: Hard Delete (GDPR Compliance)
- Complete data removal
- Irreversible process
- Cascading deletion across all tables
- Audit trail maintained

### 3. API Endpoints Needed

#### Admin User Management
```
PATCH /api/admin/users/:user_id/deactivate    # Tier 1
PATCH /api/admin/users/:user_id/soft-delete   # Tier 2
POST /api/admin/users/:user_id/restore        # Restore from soft delete
DELETE /api/admin/users/:user_id              # Tier 3 (GDPR)

```

#### User Self-Service
```
POST /api/users/request-deletion              # User requests deletion
GET /api/users/download-data                  # Data portability (Article 20)
PATCH /api/users/consent                      # Update consent preferences
```

### 4. Data Anonymization Strategy

#### Anonymizable Fields
- Replace with generic values
- `email` → `deleted_user_[timestamp]@deleted.local`
- `full_name` → `Deleted User`
- `phone` → `000-000-0000`
- `address` → `[Deleted]`

#### Non-Anonymizable Data
- Medical records (legal retention required)
- Financial transactions (audit requirements)
- System logs (security requirements)

### 5. Cascading Deletion Rules

#### Legal Retention Requirements (Must be respected)
- **Medical Records**: 7 years minimum retention (patient_medical_history, patient_vital_signs)
- **Audit Logs**: 6 years minimum retention (system logs, access logs)
- **Financial Records**: 7 years minimum retention (commission_transactions, booking payments)
- **Booking Records**: 7 years minimum retention (for medical/legal purposes)

#### Immediate Deletion (Can be deleted upon GDPR request)
```sql
-- Delete order (respecting foreign key constraints)
1. landing_page_analytics (non-medical user behavior)
2. otp_logs (temporary authentication data)
3. patient_testimonials (marketing content)
4. reviews (user-generated content)
5. doctor_availability (scheduling preferences)
6. hospital_availability (scheduling preferences)
```

#### Delayed Deletion (After Legal Retention Period)
```sql
-- Only delete after retention periods are met:
-- After 7 years from last medical interaction:
1. patient_medical_history
2. patient_vital_signs
3. bookings (medical bookings)
4. commission_transactions

-- After 6 years from creation:
1. audit_logs
2. system_access_logs

-- Final step (only after ALL retention periods met):
1. patients/doctors profiles
2. users (final step)
```

#### GDPR Compliant Deletion Process
1. **Immediate**: Delete non-regulated personal data
2. **Anonymize**: Replace identifiable info in retained records
3. **Schedule**: Set deletion dates based on retention rules
4. **Automated**: System deletes after retention periods expire

## GDPR Rights Implementation

### Right to Access (Article 15)
```javascript
// GET /api/users/my-data
{
  "personal_data": { /* all user data */ },
  "processing_purposes": ["Healthcare booking", "Service delivery"],
  "data_retention": "3 years after last activity",
  "third_parties": ["Payment processor", "SMS provider"]
}
```

### Right to Rectification (Article 16)
```javascript
// PATCH /api/users/profile
// Allow users to update their personal information
```

### Right to Data Portability (Article 20)
```javascript
// GET /api/users/export-data
// Returns JSON/CSV with all user data
```

### Right to Object (Article 21)
```javascript
// PATCH /api/users/consent
{
  "marketing_emails": false,
  "analytics_tracking": false,
  "data_processing": true  // Required for service
}
```

## Automated Compliance Features

### 1. Automatic Data Cleanup (Respecting Retention Periods)
```sql
-- Daily cleanup job - Only delete after retention periods
-- Check if user can be fully deleted (all retention periods met)
WITH eligible_users AS (
  SELECT u.id 
  FROM users u
  WHERE u.deleted_at < NOW() - INTERVAL '30 days'
    AND u.deletion_reason = 'gdpr_request'
    -- Check medical record retention (7 years)
    AND NOT EXISTS (
      SELECT 1 FROM patient_medical_history pmh 
      WHERE pmh.patient_id = u.id 
      AND pmh.created_at > NOW() - INTERVAL '7 years'
    )
    AND NOT EXISTS (
      SELECT 1 FROM patient_vital_signs pvs 
      WHERE pvs.patient_id = u.id 
      AND pvs.recorded_at > NOW() - INTERVAL '7 years'
    )
    -- Check booking retention (7 years)
    AND NOT EXISTS (
      SELECT 1 FROM bookings b 
      WHERE (b.patient_id = u.id OR b.doctor_id = u.id)
      AND b.created_at > NOW() - INTERVAL '7 years'
    )
    -- Check audit log retention (6 years)
    AND NOT EXISTS (
      SELECT 1 FROM deletion_audit da 
      WHERE da.user_id = u.id 
      AND da.timestamp > NOW() - INTERVAL '6 years'
    )
)
DELETE FROM users WHERE id IN (SELECT id FROM eligible_users);

-- Immediate cleanup of non-regulated data
DELETE FROM landing_page_analytics 
WHERE user_id IN (
  SELECT id FROM users 
  WHERE deleted_at IS NOT NULL 
  AND deletion_reason = 'gdpr_request'
);

DELETE FROM otp_logs 
WHERE user_id IN (
  SELECT id FROM users 
  WHERE deleted_at IS NOT NULL 
  AND deletion_reason = 'gdpr_request'
);
```

### 2. Retention Policy Enforcement
```sql
-- Mark inactive users for review
UPDATE users 
SET data_retention_until = last_login + INTERVAL '3 years'
WHERE last_login < NOW() - INTERVAL '2 years 11 months';
```

### 3. Consent Management
```sql
-- Track consent changes
CREATE TABLE consent_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    consent_type VARCHAR(50),
    granted BOOLEAN,
    timestamp TIMESTAMP DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);
```

## Audit and Compliance

### 1. Deletion Audit Trail
```sql
CREATE TABLE deletion_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    deleted_by UUID REFERENCES users(id),
    deletion_type VARCHAR(20), -- 'deactivate', 'soft_delete', 'hard_delete'
    reason VARCHAR(100),
    data_summary JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);
```

### 2. Regular Compliance Reports
- Monthly data retention review
- Quarterly deletion audit
- Annual GDPR compliance assessment
- User consent status reports

## Technical Implementation

### 1. Database Schema Updates
```sql
-- Add GDPR compliance fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deletion_reason VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS gdpr_deletion_requested_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS data_retention_until TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_marketing BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_analytics BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_updated_at TIMESTAMP;
```

### 2. Sequelize Model Updates
```javascript
// Add to User model
deletedAt: {
  type: DataTypes.DATE,
  allowNull: true
},
deletionReason: {
  type: DataTypes.STRING(100),
  allowNull: true
},
gdprDeletionRequestedAt: {
  type: DataTypes.DATE,
  allowNull: true
},
dataRetentionUntil: {
  type: DataTypes.DATE,
  allowNull: true
},
consentMarketing: {
  type: DataTypes.BOOLEAN,
  defaultValue: false
},
consentAnalytics: {
  type: DataTypes.BOOLEAN,
  defaultValue: true
},
consentUpdatedAt: {
  type: DataTypes.DATE,
  allowNull: true
}
```

### 3. Middleware for GDPR Checks
```javascript
// Check if user is deleted
const checkUserStatus = (req, res, next) => {
  if (req.user && req.user.deleted_at) {
    return res.status(410).json({
      error: 'Account deleted',
      message: 'This account has been deleted and cannot be accessed'
    });
  }
  next();
};
```

## Privacy Policy Requirements

### Required Disclosures
1. **Data Collection**: What data we collect and why
2. **Data Usage**: How we use personal data
3. **Data Sharing**: Who we share data with
4. **Data Retention**: How long we keep data
5. **User Rights**: How to exercise GDPR rights
6. **Contact Information**: Data Protection Officer details

### Consent Management
- Clear, specific consent for each purpose
- Easy withdrawal of consent
- Granular consent options
- Consent logging and audit trail

## Implementation Priority

### Phase 1 (Immediate - 1 week)
1. Add GDPR fields to database
2. Implement user deactivation endpoint
3. Create basic deletion audit trail

### Phase 2 (Short term - 2 weeks)
1. Implement soft delete functionality
2. Add data export endpoint
3. Create consent management system

### Phase 3 (Medium term - 1 month)
1. Implement hard delete with cascading
2. Add automated cleanup jobs
3. Create compliance reporting

### Phase 4 (Long term - 2 months)
1. Full audit system
2. Advanced anonymization
3. Automated compliance monitoring

## Risk Mitigation

### Data Breach Response
1. Immediate containment
2. Impact assessment
3. Notification within 72 hours (if high risk)
4. User notification if required
5. Regulatory reporting

### Regular Compliance Checks
- Monthly data retention review
- Quarterly security assessment
- Annual GDPR compliance audit
- Ongoing staff training

This comprehensive approach ensures HealthTime meets all GDPR requirements while maintaining operational flexibility.
