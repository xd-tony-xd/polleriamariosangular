// src/app/components/admin/admin-publicidad/admin-publicidad.component.ts

import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; 
import { HttpErrorResponse } from '@angular/common/http'; 

// Angular Material Imports
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle'; 

import { Publicidad } from '../../../models/entity/publicidad'; 
import { PublicidadService } from '../../../services/publicidad.service'; 
import { PublicidadFormComponent } from './publicidad-form/publicidad-form.component';

@Component({
  selector: 'app-admin-publicidad',
  standalone: true,
  imports: [
    CommonModule, DatePipe, // DatePipe es útil para la tabla
    // Material Modules
    MatTableModule, MatPaginatorModule, MatSortModule, MatCardModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatDialogModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatSlideToggleModule
  ],
  templateUrl: './admin-publicidad.component.html',
  styleUrl: './admin-publicidad.component.css'
})
export class AdminPublicidadComponent implements OnInit {

  displayedColumns: string[] = ['id', 'imagen', 'titulo', 'horario.turno', 'fechaInicio', 'fechaFin', 'activo', 'acciones'];
  dataSource!: MatTableDataSource<Publicidad>;
  isLoading: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private publicidadService: PublicidadService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.cargarPublicidades();
  }

  cargarPublicidades(): void {
    this.isLoading = true;
    this.publicidadService.listar().subscribe({
      next: (data: Publicidad[]) => { 
        // Convertir fechas (si vienen como strings ISO)
        data.forEach(p => {
            p.fechaInicio = new Date(p.fechaInicio);
            p.fechaFin = new Date(p.fechaFin);
        });
        
        this.dataSource = new MatTableDataSource(data);
        
        this.dataSource.sortingDataAccessor = (item, property) => {
          switch (property) {
            case 'horario.turno': return item.horario.turno;
            default: return (item as any)[property];
          }
        };

        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => { 
        console.error('Error al cargar publicidades:', err);
        this.snackBar.open('Error al cargar la publicidad. Revisar conexión o permisos.', 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
        this.isLoading = false;
      }
    });
  }

  abrirFormulario(publicidad?: Publicidad): void {
    const dialogRef = this.dialog.open(PublicidadFormComponent, {
      width: '650px',
      data: { publicidad: publicidad }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) { 
        this.cargarPublicidades();
      }
    });
  }

  eliminarPublicidad(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar esta publicidad? Esta acción es irreversible.')) {
      this.publicidadService.eliminar(id).subscribe({
        next: () => {
          this.snackBar.open('Publicidad eliminada con éxito.', 'Cerrar', { duration: 2500, panelClass: ['success-snackbar'] });
          this.cargarPublicidades(); 
        },
        error: (err: HttpErrorResponse) => { 
          console.error('Error al eliminar la publicidad:', err);
          const errorMessage = err.status === 403 ? 'Permiso denegado (ADMIN). Verifique su token.' : err.error?.message || 'No se pudo eliminar la publicidad.';
          this.snackBar.open(`Error: ${errorMessage}`, 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
        }
      });
    }
  }

  // La activación/desactivación se maneja a través del formulario completo
  cambiarActivo(publicidad: Publicidad): void {
    // Si no tienes un endpoint dedicado, la forma más simple es abrir el formulario
    // Aquí solo actualizaremos localmente y la próxima edición lo reflejará, 
    // pero si deseas un toggle rápido, necesitarías un servicio dedicado (como en Plato).
    // Por simplicidad, asumiremos que se actualiza mediante edición del formulario.
    // Si quieres un toggle dedicado, deberías crear un método en PublicidadService.
    
    // Simplemente abrimos el formulario para que el usuario guarde el cambio
    this.abrirFormulario(publicidad);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}