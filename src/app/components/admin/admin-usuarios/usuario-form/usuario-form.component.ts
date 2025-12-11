// src/app/components/admin/admin-usuarios/usuario-form/usuario-form.component.ts

import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rol } from '../../../../models/entity/rol';
import { Usuario } from '../../../../models/entity/usuario';
import { UsuarioService } from '../../../../services/usuario.service';
import { RolService } from '../../../../services/rol.service';



@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule, 
    MatProgressSpinnerModule, MatSelectModule, MatCheckboxModule
  ],
  templateUrl: './usuario-form.component.html',
  styleUrls: ['./usuario-form.component.css']
})
export class UsuarioFormComponent implements OnInit {
  usuarioForm: FormGroup;
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  roles: Rol[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UsuarioFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { usuario: Usuario },
    private usuarioService: UsuarioService,
    private rolService: RolService, // Inyectar RolService
    private snackBar: MatSnackBar
  ) {
    this.isEditMode = !!data.usuario;
    
    this.usuarioForm = this.fb.group({
      id: [data.usuario?.id || null],
      nombre: [data.usuario?.nombre || '', Validators.required],
      email: [data.usuario?.email || '', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]], // Password requerido solo al crear
      idRol: [data.usuario?.rol?.id || '', Validators.required], 
      activo: [data.usuario?.activo ?? true]
    });
  }

  ngOnInit(): void {
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.rolService.listar().subscribe({
      next: (data) => this.roles = data,
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar roles:', err);
        this.snackBar.open('Error al cargar la lista de roles disponibles.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.usuarioForm.invalid) {
      this.snackBar.open('Por favor, revise los campos requeridos.', 'Cerrar', { duration: 3000 });
      return;
    }
    
    this.isSubmitting = true;
    const formValue = this.usuarioForm.value;

    // Construcción del objeto Usuario para el backend
    const usuarioData: Usuario = {
      id: formValue.id || null, 
      nombre: formValue.nombre,
      email: formValue.email,
      password: formValue.password || undefined, // Incluir password solo si existe
      activo: formValue.activo,
      rol: { id: formValue.idRol } as Rol, // Enviar el Rol como objeto anidado
      fechaCreacion: this.data.usuario?.fechaCreacion || new Date() // Mantener fecha si existe
    };
    // Nota: El backend de Spring Boot es quien asignará el Rol completo y gestionará la contraseña.

    let obs: Observable<Usuario>;

    if (this.isEditMode && formValue.id) {
      // Si estamos editando y no se puso password, el backend no debería cambiarlo
      if (!formValue.password) {
        delete usuarioData.password;
      }
      obs = this.usuarioService.editar(formValue.id, usuarioData);
    } else {
      obs = this.usuarioService.guardar(usuarioData);
    }

    obs.subscribe({
      next: () => {
        this.snackBar.open(`Usuario ${this.isEditMode ? 'actualizado' : 'creado'} con éxito.`, 'Cerrar', { duration: 2500, panelClass: ['success-snackbar'] });
        this.dialogRef.close(true);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al guardar Usuario:', err);
        const errorMessage = err.status === 403 ? 'Permiso denegado. No tiene rol de ADMIN.' : err.error?.message || 'No se pudo guardar el usuario';
        this.snackBar.open(`Error: ${errorMessage}`, 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
        this.isSubmitting = false;
      }
    });
  }
}