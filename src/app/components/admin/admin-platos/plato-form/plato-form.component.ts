// src/app/components/admin/admin-platos/plato-form/plato-form.component.ts

import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

// Angular Material Imports para Diálogo
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

// AJUSTA ESTAS RUTAS si es necesario
import { PlatoService } from '../../../../services/plato.service';
import { CategoriaService } from '../../../../services/categoria.service';
import { HorarioService } from '../../../../services/horario.service';
import { Plato } from '../../../../models/entity/plato';
import { Categoria } from '../../../../models/entity/categoria';
import { Horario } from '../../../../models/entity/horario';


@Component({
  selector: 'app-plato-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, 
    // Material Modules
    MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, 
    MatIconModule, MatSnackBarModule, MatProgressSpinnerModule, MatSelectModule, MatCheckboxModule
  ],
  templateUrl: './plato-form.component.html',
  styleUrl: './plato-form.component.css'
})
export class PlatoFormComponent implements OnInit {

  platoForm: FormGroup;
  isEditMode: boolean = false;
  isSubmitting: boolean = false;

  categorias: Categoria[] = [];
  horarios: Horario[] = [];
  selectedFile: File | null = null;
  currentImageUrl: string | null = null; 
  currentImageIsUrl: boolean = false; 

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PlatoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { plato: Plato },
    private platoService: PlatoService,
    private categoriaService: CategoriaService,
    private horarioService: HorarioService,
    private snackBar: MatSnackBar
  ) {
    this.isEditMode = !!data.plato;

    this.platoForm = this.fb.group({
      id: [data.plato?.id || null],
      nombre: [data.plato?.nombre || '', Validators.required],
      descripcion: [data.plato?.descripcion || ''],
      precio: [data.plato?.precio || 0, [Validators.required, Validators.min(0.01)]],
      disponible: [data.plato?.disponible ?? true],
      // Usamos idCategoria y idHorario para los Selects, luego los mapeamos
      idCategoria: [data.plato?.categoria?.id || '', Validators.required], 
      idHorario: [data.plato?.horario?.id || '', Validators.required], 
      imagenUrl: [''] // Campo para URL si no se usa archivo
    });

    if (this.isEditMode && data.plato?.imagen) {
      this.currentImageUrl = data.plato.imagen;
      this.currentImageIsUrl = data.plato.imagen.startsWith('http');
      this.platoForm.get('imagenUrl')?.setValue(this.currentImageIsUrl ? data.plato.imagen : '');
    }
  }

  ngOnInit(): void {
    this.cargarListas();
  }

  cargarListas(): void {
    this.categoriaService.listar().subscribe(data => this.categorias = data);
    this.horarioService.listar().subscribe(data => this.horarios = data);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.platoForm.get('imagenUrl')?.setValue(''); // Limpiar campo URL
      this.currentImageIsUrl = false;
      
      const reader = new FileReader();
      reader.onload = () => this.currentImageUrl = reader.result as string;
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onUrlInput(event: Event): void {
    const url = (event.target as HTMLInputElement).value;
    this.currentImageUrl = url;
    this.currentImageIsUrl = url.startsWith('http');
    
    if (url) {
      this.selectedFile = null;
      const fileInput = document.getElementById('fileInputPlato') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  }

  clearImage(): void {
    this.selectedFile = null;
    this.currentImageUrl = null;
    this.currentImageIsUrl = false;
    this.platoForm.get('imagenUrl')?.setValue('');
    const fileInput = document.getElementById('fileInputPlato') as HTMLInputElement; 
    if (fileInput) fileInput.value = '';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.platoForm.invalid) {
      this.snackBar.open('Por favor, revise los campos requeridos.', 'Cerrar', { duration: 3000 });
      return;
    }

    const formValue = this.platoForm.value;

    // 1. Construir el objeto JSON Plato
    const platoData: any = { // Usamos 'any' para evitar errores de tipado en las sub-propiedades
        id: formValue.id || null, 
        nombre: formValue.nombre,
        descripcion: formValue.descripcion,
        precio: formValue.precio,
        disponible: formValue.disponible,
        
        // Mapear los IDs seleccionados a objetos anidados
        categoria: { id: formValue.idCategoria },
        horario: { id: formValue.idHorario },
        
        // La imagen será la URL solo si no se ha seleccionado un nuevo archivo
        imagen: formValue.imagenUrl || (this.selectedFile ? null : this.currentImageUrl) 
    };


    // 2. Construir FormData
    const formData = new FormData();
    // 🚨 CLAVE: Usamos 'data' para el JSON (como en MenuDia)
    formData.append('data', JSON.stringify(platoData)); 
    
    // 3. Manejo del Archivo
    if (this.selectedFile) {
      // 🚨 CLAVE: Usamos 'imagen' para el archivo (como en MenuDiaController)
      formData.append('imagen', this.selectedFile, this.selectedFile.name); 
    }
    
    
    this.isSubmitting = true;
    let obs: Observable<Plato>;

    if (this.isEditMode && formValue.id) {
      // EDICIÓN: Usamos el nuevo método con FormData
      obs = this.platoService.editarFormData(formValue.id, formData);
    } else {
      // CREACIÓN: Requiere un archivo o una URL de imagen
      if (!this.selectedFile && !platoData.imagen) {
        this.snackBar.open('Debe seleccionar o ingresar una imagen.', 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
        this.isSubmitting = false;
        return;
      }
      // CREACIÓN: Usamos el nuevo método con FormData
      obs = this.platoService.guardarFormData(formData);
    }

    obs.subscribe({
      next: () => {
        this.snackBar.open(`Plato ${this.isEditMode ? 'actualizado' : 'creado'} con éxito.`, 'Cerrar', { duration: 2500, panelClass: ['success-snackbar'] });
        // Cierra el diálogo y retorna TRUE para indicar éxito
        this.dialogRef.close(true); 
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al guardar Plato:', err);
        const errorMessage = err.status === 403 ? 'Permiso denegado (ADMIN). Verifique su token.' : err.error?.message || 'No se pudo guardar el plato (Error de Backend/API)';
        this.snackBar.open(`Error: ${errorMessage}`, 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
        this.isSubmitting = false;
      }
    });
  }

  // Helper para MatSelect
  compareFn(o1: any, o2: any): boolean {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }
}