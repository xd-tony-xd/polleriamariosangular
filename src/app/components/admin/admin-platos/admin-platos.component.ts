// src/app/components/admin/admin-platos/admin-platos.component.ts

import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common'; 
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

import { Plato } from '../../../models/entity/plato'; 
import { PlatoService } from '../../../services/plato.service'; 
import { PlatoFormComponent } from './plato-form/plato-form.component';

@Component({
  selector: 'app-admin-platos',
  standalone: true,
  imports: [
    // Módulos necesarios
    CommonModule, 
    MatTableModule, MatPaginatorModule, MatSortModule, MatCardModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatDialogModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatSlideToggleModule
  ],
  templateUrl: './admin-platos.component.html',
  styleUrl: './admin-platos.component.css'
})
export class AdminPlatosComponent implements OnInit {

  displayedColumns: string[] = ['id', 'imagen', 'nombre', 'categoria.nombre', 'horario.turno', 'precio', 'disponible', 'acciones'];
  dataSource!: MatTableDataSource<Plato>;
  isLoading: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private platoService: PlatoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.cargarPlatos();
  }

  cargarPlatos(): void {
    this.isLoading = true;
    this.platoService.listar().subscribe({
      next: (data: Plato[]) => { 
        this.dataSource = new MatTableDataSource(data);
        
        this.dataSource.sortingDataAccessor = (item, property) => {
          switch (property) {
            case 'categoria.nombre': return item.categoria.nombre;
            case 'horario.turno': return item.horario.turno;
            default: return (item as any)[property];
          }
        };

        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => { 
        console.error('Error al cargar platos:', err);
        this.snackBar.open('Error al cargar los platos. Revisar conexión o permisos.', 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
        this.isLoading = false;
      }
    });
  }

  abrirFormulario(plato?: Plato): void {
    const dialogRef = this.dialog.open(PlatoFormComponent, {
      width: '650px',
      data: { plato: plato }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) { 
        this.cargarPlatos();
      }
    });
  }

  eliminarPlato(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este plato? Esta acción es irreversible.')) {
      this.platoService.eliminar(id).subscribe({
        next: () => {
          this.snackBar.open('Plato eliminado con éxito.', 'Cerrar', { duration: 2500, panelClass: ['success-snackbar'] });
          this.cargarPlatos(); 
        },
        error: (err: HttpErrorResponse) => { 
          console.error('Error al eliminar el plato:', err);
          const errorMessage = err.status === 403 ? 'Permiso denegado (ADMIN). Verifique su token.' : err.error?.message || 'No se pudo eliminar el plato.';
          this.snackBar.open(`Error: ${errorMessage}`, 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
        }
      });
    }
  }

  cambiarDisponibilidad(plato: Plato): void {
    // 🚨 CORRECCIÓN CLAVE: Usamos el método dedicado en el servicio.
    const nuevoEstado = !plato.disponible;
    
    this.platoService.cambiarDisponibilidad(plato.id, nuevoEstado).subscribe({
      next: (data: Plato) => { 
        plato.disponible = nuevoEstado; // Actualizamos localmente
        this.snackBar.open('Disponibilidad actualizada.', 'Cerrar', { duration: 1500 });
      },
      error: (err: HttpErrorResponse) => { 
        console.error('Error al cambiar disponibilidad:', err);
        const errorMessage = err.status === 403 ? 'Permiso denegado (ADMIN). Verifique su token.' : err.error?.message || 'Error al actualizar disponibilidad.';
        this.snackBar.open(`Error: ${errorMessage}`, 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}