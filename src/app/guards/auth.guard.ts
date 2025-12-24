import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('LOGGED:', authService.isLoggedIn());
  console.log('ADMIN:', authService.isAdmin());
  console.log('USER:', authService.getUserData());

  if (!authService.isLoggedIn()) {
    router.navigateByUrl('/login', { replaceUrl: true });
    return false;
  }

  if (!authService.isAdmin()) {
    router.navigateByUrl('/', { replaceUrl: true });
    return false;
  }

  return true;
};
