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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle'; // 🚨 NECESARIO

import { Extra } from '../../../../models/entity/extra';
import { ExtraService } from '../../../../services/extra.service';

@Component({
  selector: 'app-extra-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule, 
    MatProgressSpinnerModule, MatSlideToggleModule, MatButtonToggleModule // 🚨 AGREGADO
  ],
  templateUrl: './extra-form.component.html',
  styleUrls: ['./extra-form.component.css']
})
export class ExtraFormComponent implements OnInit {
  extraForm: FormGroup;
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  showFilePicker: boolean = true; // 🚨 NUEVO: Controla si se muestra el input de archivo o la URL

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ExtraFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { extra: Extra },
    private extraService: ExtraService,
    private snackBar: MatSnackBar
  ) {
    this.isEditMode = !!data.extra;
    
    // Determinar si la imagen es una URL externa (empieza con http)
    const isExternalUrl = this.isEditMode && data.extra?.imagen && data.extra.imagen.startsWith('http');
    
    if (isExternalUrl) {
        this.showFilePicker = false;
    }

    this.extraForm = this.fb.group({
      id: [data.extra?.id || null],
      nombre: [data.extra?.nombre || '', Validators.required],
      descripcion: [data.extra?.descripcion || '', Validators.required],
      precio: [data.extra?.precio || '', [Validators.required, Validators.min(0.01), Validators.pattern('^[0-9]+([.][0-9]{1,2})?$')]],
      disponible: [data.extra?.disponible ?? true],
      // 🚨 NUEVO CAMPO: Solo se llena si es una URL externa, sino se deja vacío
      urlImagen: [isExternalUrl ? data.extra!.imagen : ''], 
    });

    if (this.isEditMode && data.extra?.imagen) {
        // Muestra la imagen actual
        this.imagePreview = data.extra.imagen; 
    }
  }

  ngOnInit(): void {}

  onCancel(): void {
    this.dialogRef.close();
  }
    
  // 🚨 Método para alternar entre FILE y URL
  toggleImageInput(useFile: boolean): void {
    this.showFilePicker = useFile;
    // Limpiar el campo opuesto al cambiar
    if (useFile) {
      this.extraForm.get('urlImagen')?.setValue('');
    } else {
      this.selectedFile = null;
      // Reestablecer la vista previa al valor de edición o null
      this.imagePreview = this.isEditMode && this.data.extra.imagen && !this.data.extra.imagen.startsWith('http') 
                        ? this.data.extra.imagen 
                        : null;
    }
  }


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
      
      // 🚨 Limpiar la URL si se selecciona un archivo
      this.extraForm.get('urlImagen')?.setValue('');
      
    } else {
        this.selectedFile = null;
        // Reestablecer el preview si se deselecciona el archivo
        this.imagePreview = this.isEditMode ? this.data.extra.imagen : null;
    }
  }
    
  onUrlChange(): void {
      // 🚨 Actualiza la vista previa con la URL ingresada
      const urlValue = this.extraForm.get('urlImagen')?.value;
      if (urlValue) {
          this.imagePreview = urlValue;
          this.selectedFile = null; // Asegurarse de que no haya archivo
      } else {
          this.imagePreview = this.isEditMode ? this.data.extra.imagen : null;
      }
  }


  onSubmit(): void {
    const urlValue = this.extraForm.get('urlImagen')?.value;
    const hasImageFile = !!this.selectedFile;
    const hasExternalUrl = !!urlValue;
    
    if (this.extraForm.invalid) {
      this.snackBar.open('Por favor, revise los campos del formulario.', 'Cerrar', { duration: 3000 });
      return;
    }

    // 🚨 Validar que se proporciona una imagen o una URL en modo creación
    if (!this.isEditMode && !hasImageFile && !hasExternalUrl) {
        this.snackBar.open('Debe seleccionar una imagen o proporcionar una URL para crear el extra.', 'Cerrar', { duration: 3000 });
        return;
    }

    this.isSubmitting = true;
    
    // Crear FormData
    const formData = new FormData();
    formData.append('nombre', this.extraForm.get('nombre')?.value);
    formData.append('descripcion', this.extraForm.get('descripcion')?.value);
    formData.append('precio', this.extraForm.get('precio')?.value);
    formData.append('disponible', this.extraForm.get('disponible')?.value.toString());
    
    if (this.isEditMode) {
      formData.append('id', this.extraForm.get('id')?.value);
    }
    
    // 🚨 Lógica para enviar la imagen/URL al Backend
    if (hasImageFile) {
        // Opción 1: Se subió un archivo (el backend lo espera en 'imagen')
        formData.append('imagen', this.selectedFile!, this.selectedFile!.name);
    } else if (hasExternalUrl) {
        // Opción 2: Se proporcionó una URL. La enviamos en un campo de texto simple llamado 'imagenUrl'.
        // **ESTO REQUIERE CAMBIOS EN EL BACKEND (ExtraServiceImpl) PARA PROCESAR 'imagenUrl'**
        formData.append('imagenUrl', urlValue); 
    } else if (this.isEditMode && this.data.extra.imagen) {
        // Opción 3 (Edición sin cambios): Enviar la URL existente para mantenerla, si no es local.
        if (this.data.extra.imagen.startsWith('http')) {
             formData.append('imagenUrl', this.data.extra.imagen);
        } else {
             // Si es ruta local y no se cambió, el backend la mantendrá por defecto.
        }
    }
    
    const obs = this.isEditMode 
      ? this.extraService.editar(this.extraForm.get('id')?.value!, formData)
      : this.extraService.guardar(formData);

    obs.subscribe({
      next: () => {
        this.snackBar.open(`Extra ${this.isEditMode ? 'actualizado' : 'creado'} con éxito.`, 'Cerrar', { duration: 2500, panelClass: ['success-snackbar'] });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error al guardar Extra:', err);
        this.snackBar.open(`Error: ${err.error?.message || 'No se pudo guardar el extra'}`, 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
        this.isSubmitting = false;
      }
    });
  }
}