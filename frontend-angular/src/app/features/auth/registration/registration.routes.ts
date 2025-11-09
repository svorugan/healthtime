import { Routes } from '@angular/router';

export const registrationRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./registration-options.component').then(m => m.RegistrationOptionsComponent)
  },
  {
    path: 'patient',
    loadComponent: () => import('./patient-registration.component').then(m => m.PatientRegistrationComponent)
  },
  {
    path: 'doctor',
    loadComponent: () => import('./doctor-registration.component').then(m => m.DoctorRegistrationComponent)
  },
  {
    path: 'hospital',
    loadComponent: () => import('./hospital-registration.component').then(m => m.HospitalRegistrationComponent)
  },
  {
    path: 'implant',
    loadComponent: () => import('./implant-registration.component').then(m => m.ImplantRegistrationComponent)
  }
];

