// src/app/components/admin/admin-usuarios/admin-usuarios.component.ts

import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; 
import { HttpErrorResponse } from '@angular/common/http'; 
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

import { Usuario } from '../../../models/entity/usuario'; 
import { UsuarioService } from '../../../services/usuario.service'; 
import { UsuarioFormComponent } from './usuario-form/usuario-form.component';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [
    CommonModule, DatePipe, 
    // Material Modules
    MatTableModule, MatPaginatorModule, MatSortModule, MatCardModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, 
    MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule, MatSlideToggleModule
  ],
  templateUrl: './admin-usuarios.component.html',
  styleUrl: './admin-usuarios.component.css'
})
export class AdminUsuariosComponent implements OnInit {

  displayedColumns: string[] = ['id', 'nombre', 'email', 'rol.nombre', 'activo', 'fechaCreacion', 'acciones'];
  dataSource!: MatTableDataSource<Usuario>;
  isLoading: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private usuarioService: UsuarioService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.isLoading = true;
    this.usuarioService.listar().subscribe({
      next: (data: Usuario[]) => { 
        this.dataSource = new MatTableDataSource(data);
        
        // Configuración para permitir ordenar por campos anidados (rol.nombre)
        this.dataSource.sortingDataAccessor = (item, property) => {
          switch (property) {
            case 'rol.nombre': return item.rol.nombre;
            default: return (item as any)[property];
          }
        };

        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => { 
        console.error('Error al cargar usuarios:', err);
        const errorMessage = err.status === 403 ? 'Permiso denegado. No tiene rol de ADMIN.' : 'Error al cargar la lista de usuarios.';
        this.snackBar.open(errorMessage, 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
        this.isLoading = false;
      }
    });
  }

  abrirFormulario(usuario?: Usuario): void {
    const dialogRef = this.dialog.open(UsuarioFormComponent, {
      width: '600px',
      data: { usuario: usuario }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) { 
        this.cargarUsuarios();
      }
    });
  }

  eliminarUsuario(id: number, nombre: string): void {
    if (confirm(`¿Está seguro de que desea eliminar al usuario ${nombre}? Esta acción es irreversible.`)) {
      this.usuarioService.eliminar(id).subscribe({
        next: () => {
          this.snackBar.open(`Usuario ${nombre} eliminado con éxito.`, 'Cerrar', { duration: 2500, panelClass: ['success-snackbar'] });
          this.cargarUsuarios(); 
        },
        error: (err: HttpErrorResponse) => { 
          console.error('Error al eliminar usuario:', err);
          const errorMessage = err.status === 403 ? 'Permiso denegado (ADMIN).' : err.error?.message || 'No se pudo eliminar el usuario.';
          this.snackBar.open(`Error: ${errorMessage}`, 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
        }
      });
    }
  }
  
  // Simular la actualización de disponibilidad mediante el formulario de edición
  cambiarActivo(usuario: Usuario): void {
    // Nota: Aunque Material ofrece el slide-toggle, la actualización real debe pasar por el backend.
    // Aquí forzamos la apertura del formulario para que el usuario guarde el cambio de estado.
    this.abrirFormulario(usuario);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}