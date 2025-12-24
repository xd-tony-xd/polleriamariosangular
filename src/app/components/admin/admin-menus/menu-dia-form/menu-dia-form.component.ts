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
    
    // Al cargar la fecha, la ajustamos para que no retroceda un día
    const fechaInicial = data.menu?.fecha ? this.ajustarFechaParaInput(data.menu.fecha) : new Date();

    this.menuForm = this.fb.group({
      id: [data.menu?.id || null],
      fecha: [fechaInicial, Validators.required],
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

  // Método para evitar el desfase al cargar fecha del backend
  private ajustarFechaParaInput(fecha: any): Date {
    const d = new Date(fecha);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    return d;
  }
  
  cargarHorarios(): void {
    this.horarioService.listar().subscribe({
      next: (data) => this.horarios = data,
      error: (err: HttpErrorResponse) => {
        this.snackBar.open('Error al cargar horarios.', 'Cerrar', { duration: 3000 });
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
  }

  onUrlInput(event: Event): void {
    const url = (event.target as HTMLInputElement).value;
    this.currentImageUrl = url;
    this.currentImageIsUrl = url.startsWith('http');
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.menuForm.invalid) {
      this.snackBar.open('Revise los campos requeridos.', 'Cerrar', { duration: 3000 });
      return;
    }
    
    const formValue = this.menuForm.value;
    
    // Construcción manual de la fecha YYYY-MM-DD para evitar ISOString UTC
    const f = new Date(formValue.fecha);
    const anio = f.getFullYear();
    const mes = (f.getMonth() + 1).toString().padStart(2, '0');
    const dia = f.getDate().toString().padStart(2, '0');
    const fechaFinalString = `${anio}-${mes}-${dia}`;

    const menuData: any = {
      id: formValue.id || null, 
      titulo: formValue.titulo,
      descripcion: formValue.descripcion,
      precio: formValue.precio,
      disponible: formValue.disponible,
      fecha: fechaFinalString, // ✅ Enviamos la fecha exacta sin desfase
      imagen: formValue.imagenUrl || (this.currentImageIsUrl ? this.currentImageUrl : null), 
      horario: { id: formValue.idHorario } 
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify(menuData)); 
    
    if (this.selectedFile) {
      formData.append('imagen', this.selectedFile, this.selectedFile.name); 
    }
    
    this.isSubmitting = true;
    let obs: Observable<MenuDia> = this.isEditMode && formValue.id 
      ? this.menuDiaService.editarFormData(formValue.id, formData)
      : this.menuDiaService.guardarFormData(formData);

    obs.subscribe({
      next: () => {
        this.snackBar.open(`Éxito al ${this.isEditMode ? 'actualizar' : 'crear'}.`, 'Cerrar', { duration: 2500 });
        this.dialogRef.close(true);
      },
      error: (err: HttpErrorResponse) => {
        this.snackBar.open('Error al guardar.', 'Cerrar', { duration: 4000 });
        this.isSubmitting = false;
      }
    });
  }
}