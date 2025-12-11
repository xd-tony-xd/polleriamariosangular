// src/app/components/admin/admin-publicidad/publicidad-form/publicidad-form.component.ts

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
import { Publicidad } from '../../../../models/entity/publicidad';
import { PublicidadService } from '../../../../services/publicidad.service';
import { HorarioService } from '../../../../services/horario.service'; // Asegúrate de tener este servicio

@Component({
  selector: 'app-publicidad-form',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule, 
    MatProgressSpinnerModule, MatSelectModule, MatCheckboxModule, MatDatepickerModule
  ],
  templateUrl: './publicidad-form.component.html',
  styleUrls: ['./publicidad-form.component.css']
})
export class PublicidadFormComponent implements OnInit {
  publicidadForm: FormGroup;
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  
  horarios: Horario[] = [];
  selectedFile: File | null = null;
  currentImageUrl: string | null = null;
  currentImageIsUrl: boolean = false; 

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PublicidadFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { publicidad: Publicidad },
    private publicidadService: PublicidadService,
    private horarioService: HorarioService,
    private snackBar: MatSnackBar
  ) {
    this.isEditMode = !!data.publicidad;
    
    this.publicidadForm = this.fb.group({
      id: [data.publicidad?.id || null],
      titulo: [data.publicidad?.titulo || '', Validators.required],
      descripcion: [data.publicidad?.descripcion || ''],
      idHorario: [data.publicidad?.horario?.id || '', Validators.required], 
      activo: [data.publicidad?.activo ?? true],
      fechaInicio: [data.publicidad?.fechaInicio || new Date(), Validators.required],
      fechaFin: [data.publicidad?.fechaFin || this.getOneWeekLater(), Validators.required],
      imagenUrl: ['']
    });
    
    if (this.isEditMode && data.publicidad?.imagen) {
      this.currentImageUrl = data.publicidad.imagen;
      this.currentImageIsUrl = data.publicidad.imagen.startsWith('http');
      this.publicidadForm.get('imagenUrl')?.setValue(this.currentImageIsUrl ? data.publicidad.imagen : '');
    }
  }

  ngOnInit(): void {
    this.cargarHorarios();
  }
  
  getOneWeekLater(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
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
      this.publicidadForm.get('imagenUrl')?.setValue('');
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
    this.publicidadForm.get('imagenUrl')?.setValue('');
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
    if (this.publicidadForm.invalid) {
      this.snackBar.open('Por favor, revise los campos requeridos.', 'Cerrar', { duration: 3000 });
      return;
    }
    
    const formValue = this.publicidadForm.value;
    
    // 🚨 CÓDIGO CRÍTICO: Construcción del JSON 'data' y manejo de fechas
    const publicidadData: any = {
      id: formValue.id || null, 
      titulo: formValue.titulo,
      descripcion: formValue.descripcion,
      activo: formValue.activo,
      
      // Usa 'imagen' para la URL si es externa (o la que se mantiene en edición)
      imagen: formValue.imagenUrl || (this.currentImageIsUrl ? this.currentImageUrl : null), 
      
      // Enviar el Horario como objeto anidado para el backend
      horario: { id: formValue.idHorario } 
    };

    // Formato de fecha para el backend (YYYY-MM-DD)
    const fechaInicio = formValue.fechaInicio instanceof Date ? formValue.fechaInicio : new Date(formValue.fechaInicio);
    const fechaFin = formValue.fechaFin instanceof Date ? formValue.fechaFin : new Date(formValue.fechaFin);
    
    publicidadData.fechaInicio = fechaInicio.toISOString().split('T')[0];
    publicidadData.fechaFin = fechaFin.toISOString().split('T')[0];

    // 1. Construir FormData
    const formData = new FormData();
    formData.append('data', JSON.stringify(publicidadData)); 
    
    // 2. Manejo del Archivo
    if (this.selectedFile) {
      formData.append('imagen', this.selectedFile, this.selectedFile.name); 
    }
    
    this.isSubmitting = true;
    
    let obs: Observable<Publicidad>;

    if (this.isEditMode && formValue.id) {
      obs = this.publicidadService.editarFormData(formValue.id, formData);
    } else {
      if (!this.selectedFile && !publicidadData.imagen) {
        this.snackBar.open('Debe seleccionar o ingresar una imagen.', 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
        this.isSubmitting = false;
        return;
      }
      obs = this.publicidadService.guardarFormData(formData);
    }

    obs.subscribe({
      next: () => {
        this.snackBar.open(`Publicidad ${this.isEditMode ? 'actualizada' : 'creada'} con éxito.`, 'Cerrar', { duration: 2500, panelClass: ['success-snackbar'] });
        this.dialogRef.close(true);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al guardar Publicidad:', err);
        const errorMessage = err.status === 403 ? 'Permiso denegado. No tiene rol de ADMIN.' : err.error?.message || 'No se pudo guardar la publicidad';
        this.snackBar.open(`Error: ${errorMessage}`, 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
        this.isSubmitting = false;
      }
    });
  }
}