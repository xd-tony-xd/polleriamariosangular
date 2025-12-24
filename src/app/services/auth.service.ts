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

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = `${environment.apiBaseUrl}/auth`;
  private jwtHelper = new JwtHelperService();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginRequest).pipe(
      tap(response => {
        if (response?.token) {
          this.saveToken(response.token);
          this.saveUserData(response);
        }
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
      localStorage.setItem(
        USER_DATA_KEY,
        JSON.stringify({
          nombre: response?.nombre ?? '',
          rol: response?.rol ?? '',
          email: response?.email ?? ''
        })
      );
    }
  }

  getUserData(): { nombre: string; rol: string; email: string } | null {
    if (!this.isBrowser()) return null;
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  }

  getToken(): string | null {
    return this.isBrowser() ? localStorage.getItem(TOKEN_KEY) : null;
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.clear();
    }
  }

  isLoggedIn(): boolean {
  if (!this.isBrowser()) return false;

  const user = localStorage.getItem('user_data');
  return !!user;
}


  isAdmin(): boolean {
  const userData = this.getUserData();
  return userData?.rol === 'ADMIN' || userData?.rol === 'ROLE_ADMIN';
}


}
