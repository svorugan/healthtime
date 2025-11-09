import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadChildren: () => import('./features/auth/registration/registration.routes').then(m => m.registrationRoutes)
  },
  {
    path: 'patient',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['patient'] },
    loadChildren: () => import('./features/patient/patient.routes').then(m => m.patientRoutes)
  },
  {
    path: 'doctor',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['doctor'] },
    loadChildren: () => import('./features/doctor/doctor.routes').then(m => m.doctorRoutes)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes)
  },
  {
    path: 'hospital',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['hospital'] },
    loadChildren: () => import('./features/hospital/hospital.routes').then(m => m.hospitalRoutes)
  },
  {
    path: 'implant',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['implant'] },
    loadChildren: () => import('./features/implant/implant.routes').then(m => m.implantRoutes)
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];

