import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // ASEGÚRATE DE QUE LA RUTA SEA CORRECTA
import { MatSnackBar } from '@angular/material/snack-bar'; // Necesitas importar MatSnackBar y HttpClientModule en tu proyecto

export const authGuard: CanActivateFn = (route, state) => {
  
  // Inyección de servicios
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  // 1. Verificar si el usuario está logueado (usando la lógica de tu AuthService)
  if (authService.isLoggedIn()) {
    // Si la ruta es el login y ya está logueado, redirigir al panel admin
    if (state.url === '/login') {
      router.navigate(['/admin']);
      return false; 
    }
    // Permite el acceso a /admin
    return true;
  } else {
    // 2. Si no está logueado y trata de acceder a /admin
    if (state.url.startsWith('/admin')) {
      snackBar.open('Acceso denegado. Por favor, inicia sesión.', 'Cerrar', { 
        duration: 3500, 
        panelClass: ['bg-red-600', 'text-white'] 
      });
      router.navigate(['/login']);
      return false;
    }
    // Permite acceso a /home o /login
    return true;
  }
};