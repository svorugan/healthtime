import { Routes } from '@angular/router';

export const patientRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./patient-dashboard.component').then(m => m.PatientDashboardComponent)
  }
];

