// src/app/admin/admin-extras/admin-extras.component.ts

import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe, SlicePipe } from '@angular/common'; // Importar CurrencyPipe y SlicePipe
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

import { ExtraFormComponent } from './extra-form/extra-form.component';
import { Extra } from '../../../models/entity/extra';
import { ExtraService } from '../../../services/extra.service';

@Component({
  selector: 'app-admin-extras',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCardModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatDialogModule,
    MatSnackBarModule, MatProgressSpinnerModule, 
    CurrencyPipe, SlicePipe // 🚨 Pipes necesarios para el HTML
  ],
  templateUrl: './admin-extras.component.html',
  styleUrls: ['./admin-extras.component.css']
})
export class AdminExtrasComponent implements OnInit {
  
  // 🚨 Columna 'disponible' (o 'estado') e 'imagen' añadidas
  displayedColumns: string[] = ['id', 'imagen', 'nombre', 'descripcion', 'precio', 'disponible', 'acciones'];
  dataSource!: MatTableDataSource<Extra>;
  isLoading: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private extraService: ExtraService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarExtras();
  }

  cargarExtras(): void {
    this.isLoading = true;
    this.extraService.listar().subscribe({
      next: (data) => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar extras:', err);
        this.snackBar.open('Error al cargar los extras.', 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
        this.isLoading = false;
      }
    });
  }

  abrirFormulario(extra?: Extra): void {
    const dialogRef = this.dialog.open(ExtraFormComponent, {
      width: '450px',
      data: { extra: extra } 
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarExtras();
      }
    });
  }

  eliminarExtra(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este extra? Esta acción es irreversible.')) {
      this.extraService.eliminar(id).subscribe({
        next: () => {
          this.snackBar.open('Extra eliminado exitosamente.', 'Cerrar', { duration: 2500, panelClass: ['success-snackbar'] });
          this.cargarExtras(); 
        },
        error: (err) => {
          console.error('Error al eliminar extra:', err);
          this.snackBar.open(`Error: ${err.error?.message || 'No se pudo eliminar el extra'}`, 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
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