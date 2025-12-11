// src/app/admin/admin-contactos/admin-contactos.component.ts

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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // 🚨 AÑADIDO

import { ContactoService } from '../../../services/contacto.service';
import { Contacto } from '../../../models/entity/contacto';
import { ContactoFormModalComponent } from './contacto-form-modal/contacto-form-modal.component'; // 🚨 AÑADIDO

@Component({
  selector: 'app-admin-contactos',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCardModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, 
    MatSnackBarModule, MatProgressSpinnerModule, MatDialogModule // 🚨 AÑADIDO
  ],
  templateUrl: './admin-contactos.component.html',
  styleUrl: './admin-contactos.component.css' 
})
export class AdminContactosComponent implements OnInit {
  
  // Columnas para la tabla de contactos
  displayedColumns: string[] = ['id', 'nombre', 'telefono', 'mensaje', 'fecha', 'acciones'];
  dataSource!: MatTableDataSource<Contacto>;
  isLoading: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private contactoService: ContactoService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog // 🚨 AÑADIDO
  ) {}

  ngOnInit(): void {
    this.cargarContactos();
  }
  
  // --- Apertura del Formulario Modal (Guardar) ---
  abrirFormularioGuardar(): void {
    const dialogRef = this.dialog.open(ContactoFormModalComponent, {
      width: '450px',
    });

    dialogRef.afterClosed().subscribe(result => {
      // Recargar la tabla si el formulario se cerró con éxito (result = true)
      if (result) {
        this.cargarContactos();
      }
    });
  }


  // --- Lógica de Carga de Datos ---
  cargarContactos(): void {
    this.isLoading = true;
    this.contactoService.listar().subscribe({
      next: (data) => {
        // Mapear los datos para formatear la fecha si es necesario
        const formattedData = data.map(contacto => ({
            ...contacto,
            // Usa un formato de fecha local si es una cadena de fecha ISO
            fecha: contacto.fecha ? new Date(contacto.fecha).toLocaleDateString() : 'N/A'
        }));

        this.dataSource = new MatTableDataSource(formattedData);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar contactos:', err);
        this.snackBar.open('Error al cargar los mensajes de contacto.', 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
        this.isLoading = false;
      }
    });
  }

  // --- Eliminación (código existente) ---
  eliminarContacto(id: number): void {
    if (confirm('¿Está seguro de que desea ELIMINAR este mensaje de contacto?')) {
      this.contactoService.eliminar(id).subscribe({
        next: () => {
          this.snackBar.open('Mensaje de contacto eliminado exitosamente.', 'Cerrar', { duration: 2500, panelClass: ['success-snackbar'] });
          this.cargarContactos(); // Recargar la tabla
        },
        error: (err) => {
          console.error('Error al eliminar contacto:', err);
          this.snackBar.open(`Error: ${err.error?.message || 'No se pudo eliminar el mensaje'}`, 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
        }
      });
    }
  }
  
  // --- Filtro de Tabla (código existente) ---
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}