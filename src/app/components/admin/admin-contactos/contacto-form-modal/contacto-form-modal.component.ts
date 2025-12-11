// src/app/components/admin/admin-contactos/contacto-form-modal/contacto-form-modal.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Contacto } from '../../../../models/entity/contacto'; // Ajustar la ruta del modelo
import { ContactoService } from '../../../../services/contacto.service'; // Ajustar la ruta del servicio

@Component({
  selector: 'app-contacto-form-modal',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule
  ],
  templateUrl: './contacto-form-modal.component.html', // Usaremos el HTML del siguiente punto
  styleUrl: './contacto-form-modal.component.css'
})
export class ContactoFormModalComponent implements OnInit {
  contactoForm!: FormGroup;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ContactoFormModalComponent>,
    private contactoService: ContactoService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.contactoForm = this.fb.group({
      nombre: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]+$')]], // Solo números
      mensaje: ['', Validators.required],
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.contactoForm.invalid) return;

    this.isSubmitting = true;
    const contacto: Contacto = this.contactoForm.value;
    
    // Llamada al servicio 'guardar'
    this.contactoService.guardar(contacto).subscribe({
      next: () => {
        this.snackBar.open('Mensaje de prueba enviado exitosamente.', 'Cerrar', { duration: 2500, panelClass: ['success-snackbar'] });
        this.dialogRef.close(true); // Cierra y notifica a la tabla para recargar
      },
      error: (err) => {
        console.error('Error al enviar mensaje:', err);
        this.snackBar.open(`Error: ${err.error?.message || 'No se pudo enviar el mensaje'}`, 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
        this.isSubmitting = false;
      }
    });
  }
}