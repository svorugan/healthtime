const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');

/**
 * API Documentation Route
 * Provides comprehensive API documentation for admin users
 */

// Get all API endpoints documentation
router.get('/endpoints', authenticate, authorize('admin'), async (req, res) => {
  try {
    const apiDocumentation = {
      version: '1.0.0',
      baseUrl: process.env.API_BASE_URL || 'http://localhost:8000/api',
      categories: [
        {
          name: 'Authentication',
          description: 'User authentication and registration endpoints',
          endpoints: [
            {
              method: 'POST',
              path: '/auth/login',
              description: 'Login user with email and password',
              requiresAuth: false,
              body: {
                email: 'string (required)',
                password: 'string (required)'
              },
              response: {
                access_token: 'string',
                token_type: 'string',
                user_role: 'string',
                user_id: 'string',
                email: 'string'
              }
            },
            {
              method: 'POST',
              path: '/auth/register/patient',
              description: 'Register a new patient',
              requiresAuth: false,
              body: {
                email: 'string (required)',
                password: 'string (required)',
                full_name: 'string (required)',
                phone: 'string (required)',
                date_of_birth: 'date (required)',
                gender: 'string (required)'
              }
            },
            {
              method: 'POST',
              path: '/auth/register/doctor',
              description: 'Register a new doctor (requires approval)',
              requiresAuth: false,
              body: {
                email: 'string (required)',
                password: 'string (required)',
                full_name: 'string (required)',
                primary_specialization: 'string (required)',
                medical_council_number: 'string (required)',
                phone: 'string (required)',
                experience_years: 'number (required)',
                consultation_fee: 'number (required)'
              }
            },
            {
              method: 'POST',
              path: '/auth/register/hospital',
              description: 'Register a new hospital (requires approval)',
              requiresAuth: false
            },
            {
              method: 'POST',
              path: '/auth/register/implant',
              description: 'Register an implant manufacturer (requires approval)',
              requiresAuth: false
            },
            {
              method: 'GET',
              path: '/auth/registration-options',
              description: 'Get available registration types',
              requiresAuth: false
            }
          ]
        },
        {
          name: 'Admin',
          description: 'Admin-only endpoints for managing the platform',
          endpoints: [
            {
              method: 'GET',
              path: '/admin/doctors',
              description: 'Get all doctors',
              requiresAuth: true,
              roles: ['admin']
            },
            {
              method: 'GET',
              path: '/admin/patients',
              description: 'Get all patients with comprehensive data',
              requiresAuth: true,
              roles: ['admin'],
              response: 'Array of patient objects with user info, contact details, insurance, and medical data'
            },
            {
              method: 'GET',
              path: '/admin/patients/:patient_id',
              description: 'Get single patient with complete details including all medical history',
              requiresAuth: true,
              roles: ['admin'],
              response: 'Complete patient object with all fields including JSONB medical data'
            },
            {
              method: 'POST',
              path: '/admin/patients',
              description: 'Create a new patient (admin)',
              requiresAuth: true,
              roles: ['admin'],
              body: {
                email: 'string',
                password: 'string',
                full_name: 'string',
                phone: 'string',
                date_of_birth: 'date',
                gender: 'string'
              }
            },
            {
              method: 'POST',
              path: '/admin/doctors',
              description: 'Create a new doctor',
              requiresAuth: true,
              roles: ['admin']
            },
            {
              method: 'GET',
              path: '/admin/bookings',
              description: 'Get all bookings',
              requiresAuth: true,
              roles: ['admin']
            },
            {
              method: 'POST',
              path: '/admin/hospitals',
              description: 'Create a new hospital',
              requiresAuth: true,
              roles: ['admin']
            },
            {
              method: 'DELETE',
              path: '/admin/hospitals/:hospital_id',
              description: 'Delete a hospital',
              requiresAuth: true,
              roles: ['admin']
            },
            {
              method: 'POST',
              path: '/admin/implants',
              description: 'Create a new implant',
              requiresAuth: true,
              roles: ['admin']
            },
            {
              method: 'DELETE',
              path: '/admin/implants/:implant_id',
              description: 'Delete an implant',
              requiresAuth: true,
              roles: ['admin']
            },
            {
              method: 'PATCH',
              path: '/admin/doctors/:doctor_id/approve',
              description: 'Approve a pending doctor',
              requiresAuth: true,
              roles: ['admin']
            },
            {
              method: 'PATCH',
              path: '/admin/doctors/:doctor_id/reject',
              description: 'Reject a pending doctor',
              requiresAuth: true,
              roles: ['admin']
            }
          ]
        },
        {
          name: 'Patients',
          description: 'Patient management endpoints',
          endpoints: [
            {
              method: 'POST',
              path: '/patients',
              description: 'Create a basic patient profile with user account (email/password required, age must be provided)',
              requiresAuth: false,
              body: {
                email: 'string (required) - User email',
                password: 'string (required) - User password',
                full_name: 'string (required)',
                phone: 'string (required)',
                date_of_birth: 'date (required)',
                age: 'integer (required) - Must be provided by client',
                gender: 'string (required)',
                current_address: 'text (required)',
                emergency_contact_name: 'string (required)',
                emergency_contact_phone: 'string (required)',
                insurance_provider: 'string (required)',
                insurance_number: 'string (required)',
                alternate_phone: 'string (optional)',
                occupation: 'string (optional)',
                preferred_language: 'string (optional)',
                city: 'string (optional)',
                state: 'string (optional)',
                pincode: 'string (optional)'
              },
              response: {
                id: 'uuid - Patient ID',
                user_id: 'uuid - User ID',
                email: 'string - User email',
                full_name: 'string',
                phone: 'string',
                age: 'integer',
                gender: 'string',
                address: 'string',
                insurance_provider: 'string',
                insurance_number: 'string',
                insurance_file_uploaded: 'boolean',
                created_at: 'timestamp'
              },
              notes: 'Creates user account first with role=patient, then creates patient record. Email must be unique.'
            },
            {
              method: 'POST',
              path: '/patients/enhanced',
              description: 'Create an enhanced patient profile with comprehensive medical information (age and BMI auto-calculated)',
              requiresAuth: false,
              body: {
                email: 'string (required) - User email',
                password: 'string (required) - User password',
                full_name: 'string (required)',
                phone: 'string (required)',
                date_of_birth: 'date (required) - Age will be auto-calculated',
                gender: 'string (required)',
                current_address: 'text (required)',
                emergency_contact_name: 'string (required)',
                emergency_contact_phone: 'string (required)',
                insurance_provider: 'string (required)',
                insurance_number: 'string (required)',
                height_cm: 'float (optional) - For BMI calculation',
                weight_kg: 'float (optional) - For BMI calculation',
                blood_group: 'string (optional)',
                smoking_status: 'string (optional)',
                alcohol_consumption: 'string (optional)',
                current_medications: 'jsonb (optional) - Array of medication objects',
                known_allergies: 'jsonb (optional) - Array of allergy objects',
                chronic_conditions: 'jsonb (optional) - Array of condition objects',
                past_surgeries: 'jsonb (optional) - Array of surgery objects',
                family_medical_history: 'jsonb (optional) - Array of family history objects',
                chief_complaint: 'text (optional)',
                current_symptoms: 'jsonb (optional) - Array of symptom objects',
                pain_scale: 'integer (optional) - 1-10',
                primary_care_physician: 'string (optional)',
                referring_doctor: 'string (optional)'
              },
              response: {
                message: 'string',
                patient_id: 'uuid',
                user_id: 'uuid',
                email: 'string',
                profile_completeness: 'integer - Percentage',
                next_steps: 'array - Suggested next actions'
              },
              notes: 'Auto-calculates age from date_of_birth and BMI from height/weight. Creates user account with role=patient.'
            },
            {
              method: 'GET',
              path: '/patients/:patient_id',
              description: 'Get patient by ID with medical history and vital signs',
              requiresAuth: true,
              roles: ['patient', 'doctor', 'admin'],
              response: 'Complete patient object with medical history and vital signs'
            },
            {
              method: 'PUT',
              path: '/patients/:patient_id',
              description: 'Update patient profile (auto-recalculates age and BMI if relevant fields updated)',
              requiresAuth: true,
              roles: ['patient', 'admin'],
              body: {
                any_patient_field: 'value (optional)',
                note: 'Cannot update id or user_id. Age and BMI recalculated automatically.'
              },
              response: {
                message: 'string',
                patient: 'object - Updated patient',
                profile_completeness: 'integer'
              }
            },
            {
              method: 'GET',
              path: '/patients/:patient_id/bookings',
              description: 'Get patient bookings with surgery, doctor, and hospital details',
              requiresAuth: true,
              roles: ['patient', 'doctor', 'admin']
            },
            {
              method: 'GET',
              path: '/patients/:patient_id/appointments',
              description: 'Get patient appointments (formatted booking data)',
              requiresAuth: true,
              roles: ['patient', 'doctor', 'admin']
            },
            {
              method: 'GET',
              path: '/patients/:patient_id/medical-history',
              description: 'Get comprehensive patient medical history including medications, allergies, conditions, surgeries, and family history',
              requiresAuth: true,
              roles: ['patient', 'doctor', 'admin'],
              response: {
                patient_id: 'uuid',
                current_medications: 'array',
                known_allergies: 'array',
                chronic_conditions: 'array',
                past_surgeries: 'array',
                family_medical_history: 'array',
                medical_history_records: 'array'
              }
            },
            {
              method: 'POST',
              path: '/patients/:patient_id/vital-signs',
              description: 'Add patient vital signs record',
              requiresAuth: true,
              roles: ['patient', 'doctor', 'admin'],
              body: {
                blood_pressure_systolic: 'integer (optional)',
                blood_pressure_diastolic: 'integer (optional)',
                heart_rate: 'integer (optional)',
                temperature: 'float (optional)',
                oxygen_saturation: 'float (optional)',
                respiratory_rate: 'integer (optional)',
                notes: 'text (optional)'
              }
            },
            {
              method: 'POST',
              path: '/patients/upload/insurance',
              description: 'Upload insurance card (front or back)',
              requiresAuth: false,
              contentType: 'multipart/form-data',
              body: {
                file: 'file (required) - JPEG, PNG, or PDF',
                patient_id: 'uuid (required)',
                document_type: 'string (optional) - insurance_card_front or insurance_card_back'
              },
              response: {
                file_url: 'string - S3 URL',
                file_name: 'string',
                file_size: 'integer',
                upload_date: 'timestamp',
                file_type: 'string'
              }
            },
            {
              method: 'POST',
              path: '/patients/upload/medical-document',
              description: 'Upload medical document (lab report, imaging, etc.)',
              requiresAuth: false,
              contentType: 'multipart/form-data',
              body: {
                file: 'file (required) - JPEG, PNG, or PDF',
                patient_id: 'uuid (required)',
                document_type: 'string (optional) - lab_report, imaging, etc.'
              }
            },
            {
              method: 'POST',
              path: '/patients/upload/prescription',
              description: 'Upload prescription document',
              requiresAuth: true,
              contentType: 'multipart/form-data',
              body: {
                file: 'file (required) - JPEG, PNG, or PDF',
                patient_id: 'uuid (required)'
              }
            },
            {
              method: 'GET',
              path: '/patients/:patient_id/prescriptions',
              description: 'Get patient prescriptions (placeholder - feature coming soon)',
              requiresAuth: true,
              roles: ['patient', 'doctor', 'admin']
            }
          ]
        },
        {
          name: 'Doctors',
          description: 'Doctor/Surgeon management endpoints',
          endpoints: [
            {
              method: 'GET',
              path: '/doctors/surgeons',
              description: 'Get all approved surgeons/doctors',
              requiresAuth: false,
              queryParams: {
                surgery_id: 'string (optional)',
                location: 'string (optional)'
              }
            },
            {
              method: 'GET',
              path: '/doctors/:doctor_id',
              description: 'Get doctor by ID',
              requiresAuth: false
            },
            {
              method: 'PUT',
              path: '/doctors/:doctor_id',
              description: 'Update doctor profile',
              requiresAuth: true,
              roles: ['doctor']
            },
            {
              method: 'GET',
              path: '/doctors/:doctor_id/bookings',
              description: 'Get doctor bookings',
              requiresAuth: true,
              roles: ['doctor', 'admin']
            },
            {
              method: 'GET',
              path: '/doctors/:doctor_id/schedule',
              description: 'Get doctor schedule',
              requiresAuth: true,
              roles: ['doctor', 'admin']
            },
            {
              method: 'GET',
              path: '/doctors/:doctor_id/patients',
              description: 'Get doctor patients',
              requiresAuth: true,
              roles: ['doctor', 'admin']
            },
            {
              method: 'PUT',
              path: '/doctors/:doctor_id/availability',
              description: 'Update doctor availability',
              requiresAuth: true,
              roles: ['doctor']
            },
            {
              method: 'GET',
              path: '/doctors/:doctor_id/surgeries',
              description: 'Get doctor surgery types',
              requiresAuth: false
            },
            {
              method: 'PUT',
              path: '/doctors/:doctor_id/surgeries',
              description: 'Update doctor surgery types',
              requiresAuth: true,
              roles: ['doctor']
            },
            {
              method: 'GET',
              path: '/doctors/admin/pending',
              description: 'Get pending doctors (admin only)',
              requiresAuth: true,
              roles: ['admin']
            },
            {
              method: 'PATCH',
              path: '/doctors/admin/:doctor_id/approve',
              description: 'Approve doctor',
              requiresAuth: true,
              roles: ['admin']
            },
            {
              method: 'PATCH',
              path: '/doctors/admin/:doctor_id/reject',
              description: 'Reject doctor',
              requiresAuth: true,
              roles: ['admin']
            },
            {
              method: 'POST',
              path: '/doctors/upload/verification',
              description: 'Upload doctor verification document',
              requiresAuth: false,
              contentType: 'multipart/form-data'
            }
          ]
        },
        {
          name: 'Surgeries',
          description: 'Surgery type management endpoints',
          endpoints: [
            {
              method: 'GET',
              path: '/surgeries',
              description: 'Get all surgeries',
              requiresAuth: false
            },
            {
              method: 'GET',
              path: '/surgeries/:surgery_id',
              description: 'Get surgery by ID',
              requiresAuth: false
            }
          ]
        },
        {
          name: 'Bookings',
          description: 'Booking management endpoints',
          endpoints: [
            {
              method: 'POST',
              path: '/bookings',
              description: 'Create a new booking',
              requiresAuth: false,
              body: {
                patient_id: 'string',
                surgery_id: 'string',
                surgeon_id: 'string',
                implant_id: 'string (optional)',
                hospital_id: 'string'
              }
            },
            {
              method: 'GET',
              path: '/bookings/:booking_id',
              description: 'Get booking by ID',
              requiresAuth: false
            },
            {
              method: 'PUT',
              path: '/bookings/:booking_id',
              description: 'Update booking status',
              requiresAuth: true,
              roles: ['admin', 'doctor', 'patient']
            },
            {
              method: 'DELETE',
              path: '/bookings/:booking_id',
              description: 'Cancel booking',
              requiresAuth: true,
              roles: ['admin', 'patient', 'doctor']
            },
            {
              method: 'GET',
              path: '/bookings/patient/:patient_id',
              description: 'Get bookings for a patient',
              requiresAuth: true,
              roles: ['patient', 'admin']
            },
            {
              method: 'GET',
              path: '/bookings/doctor/:doctor_id',
              description: 'Get bookings for a doctor',
              requiresAuth: true,
              roles: ['doctor', 'admin']
            },
            {
              method: 'GET',
              path: '/bookings/hospital/:hospital_id',
              description: 'Get bookings for a hospital',
              requiresAuth: true,
              roles: ['hospital', 'admin']
            }
          ]
        },
        {
          name: 'Hospitals',
          description: 'Hospital management endpoints',
          endpoints: [
            {
              method: 'GET',
              path: '/hospitals',
              description: 'Get all hospitals',
              requiresAuth: false
            },
            {
              method: 'GET',
              path: '/hospitals/:hospital_id',
              description: 'Get hospital by ID',
              requiresAuth: false
            },
            {
              method: 'PUT',
              path: '/hospitals/:hospital_id',
              description: 'Update hospital',
              requiresAuth: true,
              roles: ['hospital', 'admin']
            },
            {
              method: 'GET',
              path: '/hospitals/:hospital_id/bookings',
              description: 'Get hospital bookings',
              requiresAuth: true,
              roles: ['hospital', 'admin']
            },
            {
              method: 'GET',
              path: '/hospitals/:hospital_id/staff',
              description: 'Get hospital staff',
              requiresAuth: true,
              roles: ['hospital', 'admin']
            },
            {
              method: 'POST',
              path: '/hospitals/:hospital_id/staff',
              description: 'Add hospital staff',
              requiresAuth: true,
              roles: ['hospital', 'admin']
            },
            {
              method: 'GET',
              path: '/hospitals/:hospital_id/analytics',
              description: 'Get hospital analytics',
              requiresAuth: true,
              roles: ['hospital', 'admin']
            },
            {
              method: 'POST',
              path: '/hospitals/upload/hospital-document',
              description: 'Upload hospital document',
              requiresAuth: true,
              roles: ['hospital', 'admin'],
              contentType: 'multipart/form-data'
            }
          ]
        },
        {
          name: 'Implants',
          description: 'Implant management endpoints',
          endpoints: [
            {
              method: 'GET',
              path: '/implants',
              description: 'Get all implants',
              requiresAuth: false,
              queryParams: {
                surgery_id: 'string (optional)'
              }
            },
            {
              method: 'GET',
              path: '/implants/:implant_id',
              description: 'Get implant by ID',
              requiresAuth: false
            },
            {
              method: 'PUT',
              path: '/implants/:implant_id',
              description: 'Update implant',
              requiresAuth: true,
              roles: ['implant', 'admin']
            },
            {
              method: 'GET',
              path: '/implants/:implant_id/bookings',
              description: 'Get implant bookings',
              requiresAuth: true,
              roles: ['implant', 'admin']
            },
            {
              method: 'GET',
              path: '/implants/:implant_id/analytics',
              description: 'Get implant analytics',
              requiresAuth: true,
              roles: ['implant', 'admin']
            },
            {
              method: 'POST',
              path: '/implants/:implant_id/pricing',
              description: 'Update implant pricing',
              requiresAuth: true,
              roles: ['implant', 'admin']
            },
            {
              method: 'POST',
              path: '/implants/upload/implant-certificate',
              description: 'Upload implant certificate',
              requiresAuth: true,
              roles: ['implant', 'admin'],
              contentType: 'multipart/form-data'
            }
          ]
        },
        {
          name: 'Notifications',
          description: 'Notification management endpoints',
          endpoints: [
            {
              method: 'POST',
              path: '/notifications/send',
              description: 'Send a notification (admin only)',
              requiresAuth: true,
              roles: ['admin'],
              body: {
                user_id: 'string',
                title: 'string',
                message: 'string',
                type: 'string (optional)',
                category: 'string (optional)',
                action_url: 'string (optional)'
              }
            },
            {
              method: 'GET',
              path: '/notifications/user/:user_id',
              description: 'Get user notifications',
              requiresAuth: true,
              roles: ['patient', 'doctor', 'admin', 'hospital', 'implant']
            },
            {
              method: 'PUT',
              path: '/notifications/:notification_id/read',
              description: 'Mark notification as read',
              requiresAuth: true
            },
            {
              method: 'PUT',
              path: '/notifications/user/:user_id/read-all',
              description: 'Mark all notifications as read',
              requiresAuth: true
            },
            {
              method: 'DELETE',
              path: '/notifications/:notification_id',
              description: 'Delete notification',
              requiresAuth: true
            }
          ]
        }
      ]
    };

    return res.json(apiDocumentation);
  } catch (error) {
    console.error('API documentation error:', error);
    return res.status(500).json({ 
      detail: 'Failed to fetch API documentation',
      message: error.message 
    });
  }
});

// Test an API endpoint (admin only)
router.post('/test', authenticate, authorize('admin'), async (req, res) => {
  const { method, path, body, headers, queryParams } = req.body;

  try {
    // This is a placeholder for API testing functionality
    // In a real implementation, you would make the actual API call
    return res.json({
      message: 'API testing endpoint',
      request: {
        method,
        path,
        body,
        headers,
        queryParams
      },
      note: 'This is a placeholder. Implement actual API testing logic here.'
    });
  } catch (error) {
    console.error('API test error:', error);
    return res.status(500).json({ 
      detail: 'API test failed',
      message: error.message 
    });
  }
});

module.exports = router;
