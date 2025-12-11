import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


import { Horario } from '../../../models/entity/horario';
import { HorarioService } from '../../../services/horario.service';
import { HorarioFormComponent } from './horario-form/horario-form.component';

@Component({
  selector: 'app-admin-horarios',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCardModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatDialogModule,
    MatSnackBarModule, MatProgressSpinnerModule
  ],
  templateUrl: './admin-horarios.component.html',
  styleUrls: ['./admin-horarios.component.css']
})
export class AdminHorariosComponent implements OnInit {
  
  displayedColumns: string[] = ['id', 'turno', 'horaInicio', 'horaFin', 'acciones'];
  dataSource!: MatTableDataSource<Horario>;
  isLoading: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private horarioService: HorarioService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarHorarios();
  }

  cargarHorarios(): void {
    this.isLoading = true;
    this.horarioService.listar().subscribe({
      next: (data) => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar horarios:', err);
        this.snackBar.open('Error al cargar los horarios.', 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
        this.isLoading = false;
      }
    });
  }

  abrirFormulario(horario?: Horario): void {
    const dialogRef = this.dialog.open(HorarioFormComponent, {
      width: '400px',
      data: { horario: horario } 
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarHorarios();
      }
    });
  }

  eliminarHorario(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este horario? Esta acción es irreversible.')) {
      this.horarioService.eliminar(id).subscribe({
        next: () => {
          this.snackBar.open('Horario eliminado exitosamente.', 'Cerrar', { duration: 2500, panelClass: ['success-snackbar'] });
          this.cargarHorarios(); 
        },
        error: (err) => {
          console.error('Error al eliminar horario:', err);
          this.snackBar.open(`Error: ${err.error?.message || 'No se pudo eliminar el horario'}`, 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
        }
      });
    }
  }
  
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}