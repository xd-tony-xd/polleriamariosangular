import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/dto/login-request';
import { LoginResponse } from '../../models/dto/login-response'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], 
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/admin']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;

    const credentials: LoginRequest = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (response: LoginResponse) => {
        // Mensaje de bienvenida usando el nombre REAL de la BD
        const userName = response.nombre.split(' ')[0];
        this.snackBar.open(`¡Bienvenido, ${userName}!`, 'Cerrar', {
          duration: 2500,
          panelClass: ['success-snackbar']
        });

        this.router.navigate(['/admin']);
      },
      error: (err) => {

        // Manejo de error mejorado para capturar el cuerpo de la respuesta del Backend
        const errorMessage = err?.error?.message || err?.error || 'Credenciales incorrectas';

        this.snackBar.open(
          errorMessage,
          'Cerrar',
          { duration: 4000, panelClass: ['error-snackbar'] }
        );

        this.isLoading = false;
      }
    });
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}