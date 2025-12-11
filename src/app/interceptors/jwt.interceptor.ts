import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment.development'; // <-- IMPORTAR ENVIRONMENT

// Obtenemos la URL base de tu API para la verificación
const API_BASE_URL = environment.apiBaseUrl;

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  // 1. Verificar si la URL de la solicitud comienza con la URL de tu API.
  const isApiRequest = req.url.startsWith(API_BASE_URL);
  
  // 2. Verificar que la solicitud NO es la de login (ya que esta no necesita token)
  const isLoginRequest = req.url.includes(`${API_BASE_URL}/auth/login`);
  
  // 3. Si hay token, es una request a nuestra API, y NO es la de login, adjuntar el header.
  if (token && isApiRequest && !isLoginRequest) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};