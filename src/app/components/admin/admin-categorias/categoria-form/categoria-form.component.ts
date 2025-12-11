import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Categoria } from '../../../../models/entity/categoria';
import { CategoriaService } from '../../../../services/categoria.service';

@Component({
  selector: 'app-categoria-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule
  ],
  templateUrl: './categoria-form.component.html',
})
export class CategoriaFormComponent implements OnInit {
  categoriaForm: FormGroup;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CategoriaFormComponent>,
    // data.categoria es el objeto que se pasa al abrir el modal (si estamos editando)
    @Inject(MAT_DIALOG_DATA) public data: { categoria: Categoria },
    private categoriaService: CategoriaService,
    private snackBar: MatSnackBar
  ) {
    this.isEditMode = !!data.categoria;

    // Inicialización del formulario
    this.categoriaForm = this.fb.group({
      id: [data.categoria?.id || null],
      nombre: [data.categoria?.nombre || '', Validators.required],
    });
  }

  ngOnInit(): void {
    // Si estuviéramos cargando más datos (ej. un dropdown), se haría aquí.
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.categoriaForm.invalid) {
      this.snackBar.open('El nombre de la categoría es obligatorio.', 'Cerrar', { duration: 3000 });
      return;
    }

    const categoria: Categoria = this.categoriaForm.value;
    
    // Llamar al servicio CRUD
    const obs = this.isEditMode 
      ? this.categoriaService.editar(categoria.id!, categoria)
      : this.categoriaService.guardar(categoria);

    obs.subscribe({
      next: () => {
        this.snackBar.open(`Categoría ${this.isEditMode ? 'actualizada' : 'creada'} con éxito.`, 'Cerrar', { duration: 2500, panelClass: ['success-snackbar'] });
        this.dialogRef.close(true); // Cierra y notifica a la tabla para recargar
      },
      error: (err) => {
        console.error('Error al guardar categoría:', err);
        this.snackBar.open(`Error: ${err.error?.message || 'No se pudo guardar la categoría'}`, 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
      }
    });
  }
}