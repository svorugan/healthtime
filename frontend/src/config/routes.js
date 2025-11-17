// Route configuration for the application
export const routes = {
  // Public routes
  HOME: '/',
  LOGIN_PORTAL: '/login-portal',
  
  // Authentication routes
  PATIENT_LOGIN: '/login/patient',
  DOCTOR_LOGIN: '/login/doctor', 
  ADMIN_LOGIN: '/login/admin',
  HOSPITAL_LOGIN: '/login/hospital',
  IMPLANT_LOGIN: '/login/implant',
  
  // Registration routes
  PATIENT_REGISTER: '/register/patient',
  PATIENT_REGISTER_ENHANCED: '/register/patient/enhanced',
  DOCTOR_REGISTER: '/register/doctor',
  DOCTOR_REGISTER_ENHANCED: '/register/doctor/enhanced',
  ADMIN_REGISTER: '/register/admin',
  HOSPITAL_REGISTER: '/register/hospital',
  IMPLANT_REGISTER: '/register/implant',
  
  // Dashboard routes
  PATIENT_DASHBOARD: '/patient',
  DOCTOR_DASHBOARD: '/doctor',
  ADMIN_DASHBOARD: '/admin',
  HOSPITAL_DASHBOARD: '/hospital',
  IMPLANT_DASHBOARD: '/implant',
  
  // Feature routes
  API_EXPLORER: '/api-explorer',
  SURGERY_CARDS: '/surgery-cards',
  
  // Protected routes that require authentication
  PROTECTED_ROUTES: [
    '/patient',
    '/doctor', 
    '/admin',
    '/hospital',
    '/implant'
  ],
  
  // Public routes that don't require authentication
  PUBLIC_ROUTES: [
    '/',
    '/login-portal',
    '/login/patient',
    '/login/doctor',
    '/login/admin', 
    '/login/hospital',
    '/login/implant',
    '/register/patient',
    '/register/patient/enhanced',
    '/register/doctor',
    '/register/doctor/enhanced',
    '/register/admin',
    '/register/hospital',
    '/register/implant',
    '/api-explorer',
    '/surgery-cards'
  ]
};

export default routes;
