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
import { MatSelectModule } from '@angular/material/select'; // 🚨 NECESARIO PARA EL CAMPO TURNO
import { Horario } from '../../../../models/entity/horario';
import { HorarioService } from '../../../../services/horario.service';



@Component({
  selector: 'app-horario-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule, 
    MatProgressSpinnerModule, MatSelectModule // 🚨 AGREGADO
  ],
  templateUrl: './horario-form.component.html',
  styleUrls: ['./horario-form.component.css']
})
export class HorarioFormComponent implements OnInit {
  horarioForm: FormGroup;
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  
  turnos: string[] = ['Desayuno', 'Almuerzo', 'Cena (Pollería)', 'Especial']; // O los turnos que manejes

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<HorarioFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { horario: Horario },
    private horarioService: HorarioService,
    private snackBar: MatSnackBar
  ) {
    this.isEditMode = !!data.horario;

    this.horarioForm = this.fb.group({
      id: [data.horario?.id || null],
      turno: [data.horario?.turno || '', Validators.required],
      // Aseguramos que los campos de hora tengan el formato HH:mm:ss
      horaInicio: [data.horario?.horaInicio?.slice(0, 5) || '', [Validators.required, Validators.pattern(/^[0-9]{2}:[0-9]{2}$/)]],
      horaFin: [data.horario?.horaFin?.slice(0, 5) || '', [Validators.required, Validators.pattern(/^[0-9]{2}:[0-9]{2}$/)]],
    });
  }

  ngOnInit(): void {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.horarioForm.invalid) {
      this.snackBar.open('Por favor, revise los campos del formulario.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;
    
    // Mapear el DTO para el backend, asegurando el formato HH:mm:ss
    const formValue = this.horarioForm.value;
    const horarioData: Horario = {
        id: formValue.id,
        turno: formValue.turno,
        horaInicio: formValue.horaInicio + ':00', // Añadimos :00
        horaFin: formValue.horaFin + ':00',      // Añadimos :00
    };
    
    const obs = this.isEditMode 
      ? this.horarioService.editar(horarioData.id!, horarioData)
      : this.horarioService.guardar(horarioData);

    obs.subscribe({
      next: () => {
        this.snackBar.open(`Horario ${this.isEditMode ? 'actualizado' : 'creado'} con éxito.`, 'Cerrar', { duration: 2500, panelClass: ['success-snackbar'] });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error al guardar Horario:', err);
        // Error 403 es probable si el token no se envía o no es ADMIN
        const errorMessage = err.status === 403 ? 'Permiso denegado. No tiene rol de ADMIN.' : err.error?.message || 'No se pudo guardar el horario';
        this.snackBar.open(`Error: ${errorMessage}`, 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
        this.isSubmitting = false;
      }
    });
  }
}