import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data?.['roles'] as string[];
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  const user = authService.getCurrentUser();
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  if (allowedRoles.includes(user.role)) {
    return true;
  }

  // Redirect to role-specific dashboard
  const roleRoutes: { [key: string]: string } = {
    'admin': '/admin',
    'doctor': '/doctor',
    'patient': '/patient',
    'hospital': '/hospital',
    'implant': '/implant'
  };

  router.navigate([roleRoutes[user.role] || '/login']);
  return false;
};

