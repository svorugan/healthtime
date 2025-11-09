import { Routes } from '@angular/router';

export const doctorRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./doctor-dashboard.component').then(m => m.DoctorDashboardComponent)
  }
];

