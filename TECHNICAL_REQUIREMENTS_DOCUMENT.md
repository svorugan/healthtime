# HealthTime - Technical Requirements Document (TRD)

**Document Version:** 1.0  
**Date:** November 21, 2024  
**Project:** HealthTime Healthcare Platform - Modular Architecture  
**Organization:** TX Cart  
**Related Document:** Business Requirements Document v1.0

---

## 1. Executive Summary

### 1.1 Technical Overview
This document defines the technical architecture for implementing a **modular, feature-flag driven HealthTime platform** with **multi-authentication support**. The system will support selective deployment of healthcare modules (Patients, Doctors, Hospitals, Clinics, Implants) with configurable authentication strategies.

### 1.2 Key Technical Objectives
- **Modular Architecture:** Enable selective feature deployment via admin controls
- **Multi-Authentication:** Support Database, Google OAuth, Apple Sign-In, and Microsoft Entra ID
- **Scalable Design:** React lazy loading and feature flags for performance
- **Compliance Ready:** HIPAA and DPDP 2023 compliant authentication flows
- **Cost Effective:** Minimize external service dependencies

---

## 2. Expedia-Style Landing Page Technical Specifications

### 2.1 Landing Page Architecture

#### 2.1.1 Component Structure
```javascript
const LandingPageComponents = {
  hero_section: {
    search_bar: "Multi-specialty healthcare search",
    location_detection: "Auto geo-location for regional content",
    cta_buttons: "Book Now, Find Doctors, Emergency Care"
  },
  service_tiles: {
    orthopedic: { icon: "bone", avg_cost: "₹50,000-₹2,00,000", top_doctors: 5 },
    cosmetic: { icon: "beauty", avg_cost: "₹30,000-₹1,50,000", top_doctors: 5 },
    dental: { icon: "tooth", avg_cost: "₹5,000-₹50,000", top_doctors: 5 },
    cardiology: { icon: "heart", avg_cost: "₹1,00,000-₹5,00,000", top_doctors: 5 }
  },
  featured_carousels: {
    top_doctors: "Rating-based doctor carousel with specializations",
    top_hospitals: "Location and rating-based hospital carousel", 
    patient_reviews: "Verified testimonials with ratings",
    success_stories: "Before/after cases with patient consent"
  },
  trust_indicators: {
    compliance_badges: ["HIPAA Compliant", "DPDP 2023", "ISO 27001"],
    statistics: "Surgeries completed, Patient satisfaction, Doctor network",
    certifications: "Medical board certifications and hospital accreditations"
  }
}
```

#### 2.1.2 Dynamic Content System
```javascript
const DynamicContentConfig = {
  geo_location: {
    india: {
      currency: "INR",
      compliance_badges: ["DPDP 2023", "Clinical Establishments Act"],
      payment_methods: ["UPI", "RuPay", "Net Banking"],
      language_options: ["English", "Hindi"]
    },
    usa: {
      currency: "USD", 
      compliance_badges: ["HIPAA", "FDA Approved"],
      payment_methods: ["Insurance", "Credit Card", "HSA"],
      language_options: ["English", "Spanish"]
    }
  },
  content_personalization: {
    returning_users: "Show recent searches and bookings",
    new_users: "Show popular procedures and top-rated doctors",
    mobile_users: "Optimize for touch and quick booking"
  }
}
```

### 2.2 Landing Page Database Requirements

#### 2.2.1 New Tables for Landing Page
```sql
-- Featured content management
CREATE TABLE featured_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type VARCHAR(50) NOT NULL, -- 'doctor', 'hospital', 'testimonial', 'procedure'
  entity_id UUID NOT NULL, -- References doctors.id, hospitals.id, etc.
  display_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  region VARCHAR(10), -- 'india', 'usa', 'global'
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Landing page analytics
CREATE TABLE landing_page_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(100),
  user_location JSONB, -- IP-based location data
  clicked_tile VARCHAR(50), -- Which service tile was clicked
  search_query VARCHAR(255),
  conversion_action VARCHAR(50), -- 'registration', 'booking', 'doctor_view'
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service tile configuration
CREATE TABLE service_tiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  icon_url VARCHAR(500),
  description TEXT,
  avg_cost_min INTEGER,
  avg_cost_max INTEGER,
  currency VARCHAR(10) DEFAULT 'INR',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER,
  region VARCHAR(10) DEFAULT 'global'
);
```

---

## 3. Modular Architecture Specifications

### 2.1 Feature Module System

#### 2.1.1 Core Modules
```javascript
const CORE_MODULES = {
  authentication: { required: true, always_enabled: true },
  patients: { required: false, configurable: true },
  doctors: { required: false, configurable: true },
  hospitals: { required: false, configurable: true },
  clinics: { required: false, configurable: true, conflicts: ['hospitals'] },
  implants: { required: false, configurable: true },
  surgeries: { required: false, configurable: true },
  bookings: { required: false, configurable: true },
  analytics: { required: false, configurable: true }
}
```

#### 2.1.2 Feature Flag Configuration Schema
```javascript
const FEATURE_CONFIG_SCHEMA = {
  deployment_id: "string", // Unique deployment identifier
  deployment_type: "enum", // "full_platform", "clinic_focused", "doctor_network"
  modules: {
    [module_name]: {
      enabled: "boolean",
      required: "boolean",
      version: "string",
      dependencies: "array",
      conflicts: "array"
    }
  },
  authentication: {
    providers: ["database", "google", "apple", "microsoft"],
    primary_provider: "database",
    user_type_mapping: "object"
  },
  branding: {
    app_name: "string",
    theme: "string",
    logo_url: "string"
  }
}
```

### 2.2 React Implementation Architecture

#### 2.2.1 Dynamic Module Loading
```javascript
// Frontend: Module Loader System
const ModuleLoader = React.lazy(() => 
  import('./modules/ModuleLoader')
);

// Feature Flag Hook
const useFeatureFlags = () => {
  const { config } = useContext(FeatureFlagContext);
  return {
    isEnabled: (module) => config.modules[module]?.enabled,
    getConfig: () => config
  };
};
```

#### 2.2.2 Conditional Routing
```javascript
// Dynamic route generation based on enabled modules
const DynamicRoutes = () => {
  const { isEnabled } = useFeatureFlags();
  
  return (
    <Routes>
      {isEnabled('patients') && (
        <Route path="/patients/*" element={<PatientModule />} />
      )}
      {isEnabled('hospitals') && !isEnabled('clinics') && (
        <Route path="/hospitals/*" element={<HospitalModule />} />
      )}
      {isEnabled('clinics') && (
        <Route path="/clinics/*" element={<ClinicModule />} />
      )}
    </Routes>
  );
};
```

---

## 3. Multi-Authentication Technical Specifications

### 3.1 Authentication Architecture

#### 3.1.1 Implementation Phases (Revised)
```javascript
const AUTH_IMPLEMENTATION_PHASES = {
  phase_1: {
    providers: ["database", "google"],
    timeline: "2 weeks",
    cost: "$0/month",
    priority: "immediate"
  },
  phase_2: {
    providers: ["apple"],
    timeline: "1 week", 
    cost: "$99/year",
    priority: "high - mobile users"
  },
  phase_3: {
    providers: ["microsoft"],
    timeline: "1 week",
    cost: "$0-6/user/month",
    priority: "medium - enterprise"
  }
}
```

#### 3.1.2 Authentication Provider Configuration
```javascript
const AUTH_PROVIDERS = {
  database: {
    type: "primary",
    compliance: ["HIPAA", "DPDP_2023"],
    user_types: ["all"],
    implementation: "bcrypt + JWT"
  },
  google: {
    type: "oauth2",
    service: "Google OAuth 2.0",
    cost: "$0",
    user_types: ["patient", "doctor"],
    scopes: ["openid", "profile", "email"]
  },
  apple: {
    type: "oauth2", 
    service: "Apple Sign-In",
    cost: "$99/year",
    user_types: ["patient"],
    features: ["hide_email", "biometric_auth"]
  },
  microsoft: {
    type: "oauth2",
    service: "Microsoft Entra ID",
    cost: "$0-6/user/month",
    user_types: ["doctor", "hospital_admin", "backend_user"],
    authority: "https://login.microsoftonline.com/common"
  }
}
```

### 3.2 Technical Implementation Details

#### 3.2.1 Frontend Authentication Components
```javascript
// Multi-provider authentication component
const AuthenticationProvider = ({ children }) => {
  const [authConfig, setAuthConfig] = useState(null);
  
  useEffect(() => {
    // Load authentication configuration
    loadAuthConfig();
  }, []);
  
  return (
    <AuthContext.Provider value={{ authConfig }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### 3.2.2 Backend Authentication Middleware
```javascript
// Multi-provider token verification
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const provider = req.headers['x-auth-provider'];
  
  switch(provider) {
    case 'database':
      return verifyJWT(token, req, res, next);
    case 'google':
      return verifyGoogleToken(token, req, res, next);
    case 'apple':
      return verifyAppleToken(token, req, res, next);
    case 'microsoft':
      return verifyMicrosoftToken(token, req, res, next);
    default:
      return verifyJWT(token, req, res, next);
  }
};
```

---

## 4. Complete Database Schema v2.0 (Clean Implementation)

### 4.1 New Clean Schema Overview

**File Location:** `sql/complete_schema_v2.sql`

This is a complete, clean database schema that includes all requirements from scratch:
- ✅ Multi-authentication support built-in
- ✅ Landing page tables and features
- ✅ Reviews and ratings system with automatic triggers
- ✅ Modular feature configuration
- ✅ Enhanced user roles and permissions

#### 4.1.1 Core Users Table with Multi-Auth
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255), -- Nullable for SSO-only users
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'backend_user', 'doctor', 'patient', 'hospital_admin', 'implant_admin')),
    
    -- Multi-Authentication Fields
    auth_provider VARCHAR(20) DEFAULT 'database' CHECK (auth_provider IN ('database', 'google', 'apple', 'microsoft', 'otp', 'hybrid')),
    auth_provider_id VARCHAR(100), -- External provider ID (same as 'id' for database users)
    is_sso_user BOOLEAN DEFAULT FALSE,
    
    -- OTP Authentication Fields
    phone_verified BOOLEAN DEFAULT FALSE,
    otp_login_enabled BOOLEAN DEFAULT FALSE,
    
    -- Account Management
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4.1.2 Key Schema Features
- **20 Tables Total:** Complete healthcare platform schema
- **Multi-Auth Ready:** Single `auth_provider_id` field for all external providers
- **Landing Page Tables:** `service_tiles`, `featured_content`, `landing_page_analytics`
- **Reviews System:** Automatic rating calculations with triggers
- **Feature Flags:** `feature_configurations` table for modular control
- **Enhanced Indexes:** Optimized composite index on `(auth_provider, auth_provider_id)`

#### 4.1.3 Authentication Logic
```javascript
// How auth_provider_id works:
const authExamples = {
  database_user: {
    auth_provider: 'database',
    auth_provider_id: user.id // Same as the UUID primary key
  },
  google_user: {
    auth_provider: 'google', 
    auth_provider_id: 'google_unique_id_12345' // Google's user ID
  },
  apple_user: {
    auth_provider: 'apple',
    auth_provider_id: 'apple_unique_id_67890' // Apple's user ID
  },
  microsoft_user: {
    auth_provider: 'microsoft',
    auth_provider_id: 'microsoft_unique_id_abcde' // Microsoft's user ID
  },
  otp_user: {
    auth_provider: 'otp',
    auth_provider_id: user.id, // Same as UUID, but login via OTP only
    otp_login_enabled: true,
    phone_verified: true
  }
}
```

#### 4.1.4 OTP Authentication Features
- **📱 SMS OTP:** Send verification codes via SMS
- **📧 Email OTP:** Send verification codes via email  
- **📲 WhatsApp OTP:** Send codes via WhatsApp Business API
- **🔒 Security:** Rate limiting, attempt tracking, automatic expiry
- **📊 Audit Trail:** Complete OTP logs with IP tracking
- **🇮🇳 India-Friendly:** Perfect for Indian market preferences

### 4.2 Schema Migration Strategy

#### 4.2.1 Migration from Current Schema
```sql
-- To migrate from current schema to v2.0:
-- 1. Backup current data
-- 2. Run complete_schema_v2.sql
-- 3. Migrate data using custom migration scripts
-- 4. Verify data integrity
```

#### 4.2.2 Key New Tables in v2.0
- **`service_tiles`** - Landing page service configuration
- **`featured_content`** - Carousel content management  
- **`landing_page_analytics`** - User interaction tracking
- **`reviews`** - Comprehensive review system for all entities
- **`commission_agreements`** - TXCart commission structure management
- **`commission_transactions`** - Actual commission tracking and payments
- **`hospital_availability`** - Hospital facility marketplace listings
- **`doctor_availability`** - Doctor service marketplace offerings
- **`feature_configurations`** - Modular system configuration
- **`otp_logs`** - OTP tracking and security audit trail

#### 4.2.3 Enhanced Existing Tables
- **`users`** - Multi-auth fields (auth_provider, auth_provider_id)
- **`doctors`** - Landing page fields (is_featured, average_rating, profile_image_url)
- **`hospitals`** - Landing page fields (is_featured, average_rating, hospital_image_url)
- **`patient_testimonials`** - Featured content support (is_featured, consent_for_display)

### 4.3 Reviews and Commission Management Systems

#### 4.3.1 Comprehensive Reviews System
```sql
-- Polymorphic reviews table supporting all entities
CREATE TABLE reviews (
    reviewable_type VARCHAR(20) CHECK (reviewable_type IN ('doctor', 'hospital','implant_company', 'booking_experience', 'platform')),
    reviewable_id UUID NOT NULL, -- References any entity
    reviewer_id UUID NOT NULL REFERENCES users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    detailed_ratings JSONB, -- {"communication": 5, "expertise": 4, "facilities": 5}
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
    is_featured BOOLEAN DEFAULT FALSE -- For landing page testimonials
);
```

**Review Types Supported:**
- **Doctor Reviews:** Patient feedback on surgeon performance, communication, expertise
- **Hospital Reviews:** Facility quality, staff, cleanliness, equipment ratings
- **Booking Experience:** Overall platform and service experience reviews
- **Platform Reviews:** General HealthTime marketplace feedback

**Features:**
- **Moderation System:** Pending → Approved → Featured pipeline
- **Detailed Ratings:** JSONB structure for category-specific ratings
- **Automatic Aggregation:** Triggers update entity average ratings
- **Helpfulness Voting:** Community-driven review quality assessment

#### 4.3.2 TXCart Commission Management System
```sql
-- Commission agreements with flexible structures
CREATE TABLE commission_agreements (
    entity_type VARCHAR(20) CHECK (entity_type IN ('doctor', 'hospital', 'implant_company')),
    commission_type VARCHAR(20) CHECK (commission_type IN ('percentage', 'fixed_amount', 'tiered', 'hybrid')),
    commission_rate DECIMAL(5,2), -- 15.50 for 15.5%
    tiered_structure JSONB, -- Complex tiered commission structures
    applicable_services JSONB, -- ["consultation", "surgery", "facility_booking"]
    status VARCHAR(20) CHECK (status IN ('draft', 'active', 'suspended', 'terminated'))
);
```

**Commission Models Supported:**
- **Percentage:** Standard percentage of transaction value
- **Fixed Amount:** Fixed fee per transaction regardless of value
- **Tiered:** Different rates based on transaction volume/amount
- **Hybrid:** Combination of percentage and fixed amount (whichever is lower)

**Business Features:**
- **Automatic Calculation:** Built-in `calculate_commission()` function
- **Transaction Tracking:** Every booking generates commission transaction
- **Payment Management:** Track pending, paid, disputed commission payments
- **Performance Analytics:** Total transactions, commission earned, volume metrics
- **Legal Compliance:** Agreement documents, tax treatment, compliance notes

#### 4.3.3 Commission Calculation Examples
```javascript
// Example commission structures
const commissionExamples = {
  doctor_percentage: {
    entity_type: 'doctor',
    commission_type: 'percentage', 
    commission_rate: 12.5, // 12.5% of surgery fee
    applicable_services: ['consultation', 'surgery']
  },
  
  hospital_tiered: {
    entity_type: 'hospital',
    commission_type: 'tiered',
    tiered_structure: [
      {min_amount: 0, max_amount: 50000, rate: 8},      // 8% for ≤₹50K
      {min_amount: 50001, max_amount: 100000, rate: 6}, // 6% for ₹50K-₹100K  
      {min_amount: 100001, max_amount: null, rate: 4}   // 4% for >₹100K
    ]
  },
  
  implant_hybrid: {
    entity_type: 'implant_company',
    commission_type: 'hybrid',
    commission_rate: 10, // 10% of implant cost
    fixed_amount: 5000,  // Or ₹5000, whichever is lower
    applicable_services: ['implant_sales']
  }
}
```

---

## 5. API Specifications

### 5.1 Landing Page APIs
```javascript
// Landing page content APIs
const landingPageAPIs = {
  featured_content: "GET /api/landing/featured-content?region=india",
  service_tiles: "GET /api/landing/service-tiles?region=india",
  top_doctors: "GET /api/landing/top-doctors?specialty=orthopedic&limit=5",
  top_hospitals: "GET /api/landing/top-hospitals?location=mumbai&limit=5",
  testimonials: "GET /api/landing/testimonials?featured=true&limit=10",
  analytics: "POST /api/landing/analytics" // Track user interactions
}

### 5.2 Feature Management APIs
```javascript
// Feature configuration APIs
const featureAPIs = {
  get_config: "GET /api/admin/feature-config",
  update_config: "POST /api/admin/feature-config", 
  toggle_module: "PUT /api/admin/feature-config/:deploymentId/module/:moduleName"
}
```

### 5.3 Multi-Authentication APIs
```javascript
// Authentication endpoints for each provider
const authAPIs = {
  database: "POST /api/auth/login",
  google: "POST /api/auth/google",
  apple: "POST /api/auth/apple",
  microsoft: "POST /api/auth/microsoft",
  otp: {
    send_otp: "POST /api/auth/otp/send",
    verify_otp: "POST /api/auth/otp/verify",
    resend_otp: "POST /api/auth/otp/resend"
  },
  logout: "POST /api/auth/logout",
  refresh: "POST /api/auth/refresh"
}
```

### 5.4 OTP Authentication APIs
```javascript
// OTP-specific endpoints
const otpAPIs = {
  // Send OTP for login/registration
  send_otp: {
    endpoint: "POST /api/auth/otp/send",
    body: {
      phone: "+91XXXXXXXXXX", // or email
      type: "login", // login, registration, password_reset
      delivery_method: "sms" // sms, email, whatsapp
    }
  },
  
  // Verify OTP code
  verify_otp: {
    endpoint: "POST /api/auth/otp/verify", 
    body: {
      phone: "+91XXXXXXXXXX",
      otp_code: "123456",
      type: "login"
    }
  },
  
  // Enable OTP login for existing user
  enable_otp: {
    endpoint: "POST /api/auth/otp/enable",
    headers: { "Authorization": "Bearer jwt_token" }
  }
}
```

---

## 5. API Specifications

### 5.1 Feature Management APIs
```javascript
// GET /api/admin/feature-config
// POST /api/admin/feature-config
// PUT /api/admin/feature-config/:deploymentId

const featureConfigAPI = {
  endpoints: [
    "GET /api/admin/feature-config",
    "POST /api/admin/feature-config", 
    "PUT /api/admin/feature-config/:deploymentId"
  ],
  authentication: "admin role required",
  response_format: "FEATURE_CONFIG_SCHEMA"
}
```

### 5.2 Multi-Authentication APIs
```javascript
// Authentication endpoints for each provider
const authAPIs = {
  database: "POST /api/auth/login",
  google: "POST /api/auth/google",
  apple: "POST /api/auth/apple",
  microsoft: "POST /api/auth/microsoft",
  logout: "POST /api/auth/logout",
  refresh: "POST /api/auth/refresh"
}
```

---

## 6. Security & Compliance Specifications

### 6.1 HIPAA Compliance Requirements
```javascript
const hipaaCompliance = {
  data_encryption: "AES-256 at rest, TLS 1.3 in transit",
  access_controls: "Role-based with audit logging",
  session_management: "30-minute timeout for healthcare data",
  audit_logging: "All authentication and data access events",
  data_minimization: "Only necessary user claims stored"
}
```

### 6.2 Authentication Security Measures
```javascript
const securityMeasures = {
  jwt_tokens: {
    algorithm: "RS256",
    expiration: "24 hours",
    refresh_rotation: true
  },
  oauth_tokens: {
    storage: "httpOnly cookies",
    validation: "Server-side verification",
    scope_limitation: "Minimal required scopes"
  },
  rate_limiting: {
    login_attempts: "5 per 15 minutes",
    api_calls: "1000 per hour per user"
  }
}
```

---

## 7. Implementation Roadmap (Updated with Landing Page)

### 7.1 Phase 1: Core Foundation + Google Auth + OTP (Weeks 1-2)
- ✅ **Feature Flag System:** Implement modular architecture with React lazy loading
- ✅ **Database Extensions:** Add multi-auth columns, OTP tables, and landing page tables
- ✅ **Google OAuth Integration:** Patient and doctor convenience authentication
- ✅ **OTP Authentication:** SMS/Email OTP for Indian market preference
- ✅ **Basic Modular Routes:** Conditional routing based on enabled modules

### 7.2 Phase 2: Expedia-Style Landing Page (Weeks 3-4)
- 🏠 **Landing Page Components:** Hero section, service tiles, search functionality
- 🏠 **Featured Carousels:** Top doctors, hospitals, patient testimonials
- 🏠 **Geo-Location Integration:** Auto-detect region for localized content
- 🏠 **Analytics Implementation:** Track user interactions and conversions
- 🏠 **Mobile Optimization:** Responsive design for mobile-first experience

### 7.3 Phase 3: Apple Integration (Week 5)
- 🍎 **Apple Developer Setup:** Developer account and certificates
- 🍎 **Apple Sign-In Implementation:** iOS-optimized authentication flow
- 🍎 **Mobile App Integration:** Native iOS authentication experience
- 🍎 **Testing & Optimization:** Cross-device testing and performance tuning

### 7.4 Phase 4: Microsoft Integration (Week 6)
- 🏢 **Microsoft Entra ID Setup:** Enterprise authentication configuration
- 🏢 **Hospital Staff Onboarding:** Streamlined enterprise user flow
- 🏢 **Multi-tenant Support:** Support for different hospital organizations
- 🏢 **SSO Integration Testing:** End-to-end enterprise authentication testing

### 7.5 Phase 5: Admin Panel & Advanced Features (Week 7-8)
- ⚙️ **Feature Management Interface:** Real-time module toggling
- ⚙️ **Landing Page CMS:** Admin controls for featured content
- ⚙️ **Authentication Provider Controls:** Enable/disable auth methods per deployment
- ⚙️ **Analytics Dashboard:** Landing page performance and conversion metrics
- ⚙️ **Deployment Templates:** Pre-configured setups for different use cases

---

## 8. Cost Analysis & Resource Requirements

### 8.1 Development Costs
```javascript
const developmentCosts = {
  phase_1: { time: "2 weeks", cost: "$0" },
  phase_2: { time: "1 week", cost: "$99/year" },
  phase_3: { time: "1 week", cost: "$0-6/user/month" },
  total_implementation: "4-5 weeks"
}
```

### 8.2 Operational Costs
```javascript
const operationalCosts = {
  google_oauth: "$0/month",
  apple_signin: "$99/year", 
  microsoft_entra: "$0-6/user/month",
  aws_services: "$0 additional",
  total_monthly: "$0-50/month"
}
```

---

## 9. Testing & Quality Assurance

### 9.1 Authentication Testing Matrix
```javascript
const testingMatrix = {
  providers: ["database", "google", "apple", "microsoft"],
  user_types: ["patient", "doctor", "hospital_admin", "admin"],
  devices: ["web", "ios", "android"],
  scenarios: ["login", "logout", "token_refresh", "account_linking"]
}
```

### 9.2 Module Testing Requirements
```javascript
const moduleTests = {
  feature_flags: "Toggle modules on/off without errors",
  lazy_loading: "Modules load only when enabled",
  routing: "Conditional routes work correctly", 
  performance: "No performance degradation with disabled modules"
}
```

---

## 10. Deployment Configurations

### 10.1 Deployment Templates
```javascript
// Full Platform Configuration
const fullPlatform = {
  modules: { /* all enabled */ },
  auth_providers: ["database", "google", "apple", "microsoft"],
  target: "Large healthcare networks"
}

// Clinic-Focused Configuration  
const clinicFocused = {
  modules: { clinics: true, hospitals: false },
  auth_providers: ["database", "google", "apple"],
  target: "Independent clinics"
}

// Doctor Network Configuration
const doctorNetwork = {
  modules: { doctors: true, patients: true, bookings: true },
  auth_providers: ["database", "google", "microsoft"],
  target: "Professional doctor networks"
}
```

---

## 11. Success Metrics & KPIs

### 11.1 Technical Performance Metrics
- **Module Load Time:** < 2 seconds for lazy-loaded modules
- **Authentication Success Rate:** > 99.5% across all providers
- **Feature Toggle Response:** < 100ms for admin changes
- **Mobile Authentication:** < 3 seconds on iOS/Android

### 11.2 Business Impact Metrics
- **Deployment Flexibility:** Support 3+ different deployment types
- **User Onboarding:** 50% reduction in registration friction
- **Mobile Adoption:** 40%+ iOS user authentication via Apple Sign-In
- **Enterprise Adoption:** 60%+ hospital staff using Microsoft SSO

---

## 12. Risk Mitigation

### 12.1 Technical Risks
- **OAuth Provider Downtime:** Fallback to database authentication
- **Feature Flag Failures:** Safe defaults with all modules enabled
- **Token Validation Issues:** Comprehensive error handling and logging
- **Module Loading Errors:** Graceful degradation and error boundaries

### 12.2 Security Risks
- **Token Compromise:** Short-lived tokens with refresh rotation
- **Cross-Provider Attacks:** Isolated authentication flows
- **Data Leakage:** Minimal scope requests and data minimization
- **Compliance Violations:** Regular security audits and compliance checks

---

## 13. Document Control

### 13.1 Version History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 21, 2024 | Technical Team | Initial TRD creation with modular architecture and multi-auth specifications |

### 13.2 Related Documents
- **Business Requirements Document v1.0** - Business context and requirements
- **API Documentation** - Detailed API specifications
- **Security Guidelines** - HIPAA and DPDP compliance procedures
- **Deployment Guide** - Step-by-step implementation instructions

---

**Note:** This Technical Requirements Document complements the Business Requirements Document and provides detailed technical specifications for implementing the modular HealthTime platform with multi-authentication support.
