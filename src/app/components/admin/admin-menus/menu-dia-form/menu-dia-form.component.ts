// src/app/admin/admin-menus/menu-dia-form/menu-dia-form.component.ts
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Horario } from '../../../../models/entity/horario';
import { MenuDia } from '../../../../models/entity/menu-dia';
import { MenuDiaService } from '../../../../services/menu-dia.service';
import { HorarioService } from '../../../../services/horario.service';

@Component({
  selector: 'app-menu-dia-form',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule, 
    MatProgressSpinnerModule, MatSelectModule, MatCheckboxModule, MatDatepickerModule
  ],
  templateUrl: './menu-dia-form.component.html',
  styleUrls: ['./menu-dia-form.component.css']
})
export class MenuDiaFormComponent implements OnInit {
  menuForm: FormGroup;
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  
  horarios: Horario[] = [];
  selectedFile: File | null = null;
  currentImageUrl: string | null = null;
  currentImageIsUrl: boolean = false; 

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<MenuDiaFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { menu: MenuDia },
    private menuDiaService: MenuDiaService,
    private horarioService: HorarioService,
    private snackBar: MatSnackBar
  ) {
    this.isEditMode = !!data.menu;
    
    this.menuForm = this.fb.group({
      id: [data.menu?.id || null],
      fecha: [data.menu?.fecha || new Date(), Validators.required],
      idHorario: [data.menu?.horario?.id || '', Validators.required], 
      titulo: [data.menu?.titulo || '', Validators.required],
      descripcion: [data.menu?.descripcion || '', Validators.required],
      precio: [data.menu?.precio || 0, [Validators.required, Validators.min(0.01)]],
      disponible: [data.menu?.disponible ?? true],
      imagenUrl: ['']
    });
    
    if (this.isEditMode && data.menu?.imagen) {
      this.currentImageUrl = data.menu.imagen;
      this.currentImageIsUrl = data.menu.imagen.startsWith('http');
      this.menuForm.get('imagenUrl')?.setValue(this.currentImageIsUrl ? data.menu.imagen : '');
    }
  }

  ngOnInit(): void {
    this.cargarHorarios();
  }
  
  cargarHorarios(): void {
    this.horarioService.listar().subscribe({
      next: (data) => this.horarios = data,
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar horarios:', err);
        this.snackBar.open('Error al cargar la lista de horarios disponibles.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.menuForm.get('imagenUrl')?.setValue('');
      this.currentImageIsUrl = false;
      
      const reader = new FileReader();
      reader.onload = () => this.currentImageUrl = reader.result as string;
      reader.readAsDataURL(this.selectedFile);
    }
  }
  
  clearImage(): void {
    this.selectedFile = null;
    this.currentImageUrl = null;
    this.currentImageIsUrl = false;
    this.menuForm.get('imagenUrl')?.setValue('');
    const fileInput = document.getElementById('fileInput') as HTMLInputElement; 
    if (fileInput) fileInput.value = '';
  }

  onUrlInput(event: Event): void {
    const url = (event.target as HTMLInputElement).value;
    this.currentImageUrl = url;
    this.currentImageIsUrl = url.startsWith('http');
    
    if (url) {
      this.selectedFile = null;
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.menuForm.invalid) {
      this.snackBar.open('Por favor, revise los campos requeridos.', 'Cerrar', { duration: 3000 });
      return;
    }
    
    const formValue = this.menuForm.value;
    
    // 🚨 CÓDIGO CRÍTICO CORREGIDO: Construcción del JSON 'data'
    const menuData: any = {
      id: formValue.id || null, 
      titulo: formValue.titulo,
      descripcion: formValue.descripcion,
      precio: formValue.precio,
      disponible: formValue.disponible,
      
      // Usa 'imagen' para la URL si es externa (o la que se mantiene en edición)
      imagen: formValue.imagenUrl || (this.currentImageIsUrl ? this.currentImageUrl : null), 
      
      // Enviar el Horario como objeto anidado para el backend
      horario: { id: formValue.idHorario } 
    };

    // Formato de fecha para el backend (YYYY-MM-DD)
    const fecha = formValue.fecha instanceof Date ? formValue.fecha : new Date(formValue.fecha);
    menuData.fecha = fecha.toISOString().split('T')[0];

    // 1. Construir FormData
    const formData = new FormData();
    formData.append('data', JSON.stringify(menuData)); 
    
    // 2. Manejo del Archivo
    if (this.selectedFile) {
      formData.append('imagen', this.selectedFile, this.selectedFile.name); 
    }
    
    this.isSubmitting = true;
    
    let obs: Observable<MenuDia>;

    if (this.isEditMode && formValue.id) {
      obs = this.menuDiaService.editarFormData(formValue.id, formData);
    } else {
      obs = this.menuDiaService.guardarFormData(formData);
    }

    obs.subscribe({
      next: () => {
        this.snackBar.open(`Menú ${this.isEditMode ? 'actualizado' : 'creado'} con éxito.`, 'Cerrar', { duration: 2500, panelClass: ['success-snackbar'] });
        this.dialogRef.close(true);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al guardar Menú:', err);
        const errorMessage = err.status === 403 ? 'Permiso denegado. No tiene rol de ADMIN.' : err.error?.message || 'No se pudo guardar el menú';
        this.snackBar.open(`Error: ${errorMessage}`, 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
        this.isSubmitting = false;
      }
    });
  }
}