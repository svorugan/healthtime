import { Routes } from '@angular/router';

export const hospitalRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./hospital-dashboard.component').then(m => m.HospitalDashboardComponent)
  }
];

