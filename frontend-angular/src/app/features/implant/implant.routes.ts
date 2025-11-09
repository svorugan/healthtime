import { Routes } from '@angular/router';

export const implantRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./implant-dashboard.component').then(m => m.ImplantDashboardComponent)
  }
];

