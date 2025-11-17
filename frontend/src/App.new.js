import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import routes from './config/routes';

// Import page components
import HomePage from './pages/HomePage';
import LoginPortal from './pages/auth/LoginPortal';
import PatientLoginPage from './pages/auth/PatientLoginPage';
import DoctorLoginPage from './pages/auth/DoctorLoginPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';
import HospitalLoginPage from './pages/auth/HospitalLoginPage';
import ImplantLoginPage from './pages/auth/ImplantLoginPage';

// Import registration pages
import PatientRegistrationPage from './pages/registration/PatientRegistrationPage';
import EnhancedPatientRegistrationPage from './pages/registration/EnhancedPatientRegistrationPage';
import DoctorRegistrationPage from './pages/registration/DoctorRegistrationPage';
import EnhancedDoctorRegistrationPage from './pages/registration/EnhancedDoctorRegistrationPage';
import AdminRegistrationPage from './pages/registration/AdminRegistrationPage';
import HospitalRegistrationPage from './pages/registration/HospitalRegistrationPage';
import ImplantRegistrationPage from './pages/registration/ImplantRegistrationPage';

// Import dashboard pages
import PatientDashboard from './pages/dashboards/PatientDashboard';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import HospitalDashboard from './pages/dashboards/HospitalDashboard';
import ImplantDashboard from './pages/dashboards/ImplantDashboard';

// Import other pages
import ApiExplorer from './pages/ApiExplorer';
import TestSurgeryCards from './pages/TestSurgeryCards';

// Import CSS
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path={routes.HOME} element={<HomePage />} />
            <Route path={routes.LOGIN_PORTAL} element={<LoginPortal />} />
            <Route path={routes.API_EXPLORER} element={<ApiExplorer />} />
            <Route path={routes.SURGERY_CARDS} element={<TestSurgeryCards />} />
            
            {/* Authentication Routes */}
            <Route path={routes.PATIENT_LOGIN} element={<PatientLoginPage />} />
            <Route path={routes.DOCTOR_LOGIN} element={<DoctorLoginPage />} />
            <Route path={routes.ADMIN_LOGIN} element={<AdminLoginPage />} />
            <Route path={routes.HOSPITAL_LOGIN} element={<HospitalLoginPage />} />
            <Route path={routes.IMPLANT_LOGIN} element={<ImplantLoginPage />} />
            
            {/* Registration Routes */}
            <Route path={routes.PATIENT_REGISTER} element={<PatientRegistrationPage />} />
            <Route path={routes.PATIENT_REGISTER_ENHANCED} element={<EnhancedPatientRegistrationPage />} />
            <Route path={routes.DOCTOR_REGISTER} element={<DoctorRegistrationPage />} />
            <Route path={routes.DOCTOR_REGISTER_ENHANCED} element={<EnhancedDoctorRegistrationPage />} />
            <Route path={routes.ADMIN_REGISTER} element={<AdminRegistrationPage />} />
            <Route path={routes.HOSPITAL_REGISTER} element={<HospitalRegistrationPage />} />
            <Route path={routes.IMPLANT_REGISTER} element={<ImplantRegistrationPage />} />
            
            {/* Protected Dashboard Routes */}
            <Route 
              path={routes.PATIENT_DASHBOARD} 
              element={
                <ProtectedRoute requiredRole="patient">
                  <PatientDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={routes.DOCTOR_DASHBOARD} 
              element={
                <ProtectedRoute requiredRole="doctor">
                  <DoctorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={routes.ADMIN_DASHBOARD} 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={routes.HOSPITAL_DASHBOARD} 
              element={
                <ProtectedRoute requiredRole="hospital">
                  <HospitalDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={routes.IMPLANT_DASHBOARD} 
              element={
                <ProtectedRoute requiredRole="implant">
                  <ImplantDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
          
          {/* Toast notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
