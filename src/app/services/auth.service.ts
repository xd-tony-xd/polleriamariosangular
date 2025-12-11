// src/app/services/auth.service.ts

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment.development';

import { LoginRequest } from '../models/dto/login-request';
import { LoginResponse } from '../models/dto/login-response'; 

const USER_DATA_KEY = 'user_data';
const TOKEN_KEY = 'token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiBaseUrl}/auth`;
  private jwtHelper = new JwtHelperService();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any
  ) { }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Proceso de Login: Recibe los datos reales de la BD.
   */
  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginRequest).pipe(
      tap(response => {
        // Guardar el token (string)
        this.saveToken(response.token);
        // Guardar los datos dinámicos (nombre, rol, email)
        this.saveUserData(response); 
      })
    );
  }

  saveToken(token: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  private saveUserData(response: LoginResponse): void {
    if (this.isBrowser()) {
      // Se guardan los datos recibidos de la BD:
      const userData = {
        nombre: response.nombre,
        rol: response.rol,
        email: response.email 
      };
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    }
  }

  /**
   * Obtiene los datos del usuario (nombre, rol, email) del localStorage.
   */
  getUserData(): { nombre: string, rol: string, email: string } | null {
    if (this.isBrowser()) {
      const data = localStorage.getItem(USER_DATA_KEY);
      return data ? JSON.parse(data) : null;
    }
    return null;
  }

  getToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
    }
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return token != null && !this.jwtHelper.isTokenExpired(token);
  }

  isAdmin(): boolean {
    const userData = this.getUserData();
    return userData?.rol === 'ADMIN'; 
  }
}