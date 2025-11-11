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
              description: 'Get all patients',
              requiresAuth: true,
              roles: ['admin']
            },
            {
              method: 'POST',
              path: '/admin/patients',
              description: 'Create a new patient',
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
              description: 'Create a basic patient profile',
              requiresAuth: false
            },
            {
              method: 'POST',
              path: '/patients/enhanced',
              description: 'Create an enhanced patient profile',
              requiresAuth: false
            },
            {
              method: 'GET',
              path: '/patients/:patient_id',
              description: 'Get patient by ID',
              requiresAuth: true,
              roles: ['patient', 'doctor', 'admin']
            },
            {
              method: 'PUT',
              path: '/patients/:patient_id',
              description: 'Update patient profile',
              requiresAuth: true,
              roles: ['patient', 'admin']
            },
            {
              method: 'GET',
              path: '/patients/:patient_id/bookings',
              description: 'Get patient bookings',
              requiresAuth: true,
              roles: ['patient', 'doctor', 'admin']
            },
            {
              method: 'GET',
              path: '/patients/:patient_id/appointments',
              description: 'Get patient appointments',
              requiresAuth: true,
              roles: ['patient', 'doctor', 'admin']
            },
            {
              method: 'GET',
              path: '/patients/:patient_id/medical-history',
              description: 'Get patient medical history',
              requiresAuth: true,
              roles: ['patient', 'doctor', 'admin']
            },
            {
              method: 'POST',
              path: '/patients/:patient_id/vital-signs',
              description: 'Add patient vital signs',
              requiresAuth: true,
              roles: ['patient', 'doctor', 'admin']
            },
            {
              method: 'POST',
              path: '/patients/upload/insurance',
              description: 'Upload insurance document',
              requiresAuth: false,
              contentType: 'multipart/form-data'
            },
            {
              method: 'POST',
              path: '/patients/upload/medical-document',
              description: 'Upload medical document',
              requiresAuth: false,
              contentType: 'multipart/form-data'
            },
            {
              method: 'POST',
              path: '/patients/upload/prescription',
              description: 'Upload prescription',
              requiresAuth: true,
              contentType: 'multipart/form-data'
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
