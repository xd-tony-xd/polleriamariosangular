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


import { CategoriaFormComponent } from './categoria-form/categoria-form.component'; 
import { Categoria } from '../../../models/entity/categoria';
import { CategoriaService } from '../../../services/categoria.service';

@Component({
  selector: 'app-admin-categorias',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCardModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatDialogModule,
    MatSnackBarModule, MatProgressSpinnerModule
  ],
  templateUrl: './admin-categorias.component.html',
  styleUrl: './admin-categorias.component.css'
})
export class AdminCategoriasComponent implements OnInit {
  
  displayedColumns: string[] = ['id', 'nombre', 'acciones'];
  dataSource!: MatTableDataSource<Categoria>;
  isLoading: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private categoriaService: CategoriaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
  }

  // --- Lógica de Carga de Datos ---
  cargarCategorias(): void {
    this.isLoading = true;
    this.categoriaService.listar().subscribe({
      next: (data) => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
        this.snackBar.open('Error al cargar las categorías.', 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
        this.isLoading = false;
      }
    });
  }

  // --- Apertura del Formulario Modal (Crear/Editar) ---
  abrirFormulario(categoria?: Categoria): void {
    const dialogRef = this.dialog.open(CategoriaFormComponent, {
      width: '400px',
      data: { categoria: categoria } // Pasar la categoría si es edición
    });

    dialogRef.afterClosed().subscribe(result => {
      // Recargar la tabla si el formulario se cerró con éxito (result = true)
      if (result) {
        this.cargarCategorias();
      }
    });
  }

  // --- Eliminación ---
  eliminarCategoria(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar esta categoría? Esto podría afectar a los platos asociados.')) {
      this.categoriaService.eliminar(id).subscribe({
        next: () => {
          this.snackBar.open('Categoría eliminada exitosamente.', 'Cerrar', { duration: 2500, panelClass: ['success-snackbar'] });
          this.cargarCategorias(); // Recargar la tabla
        },
        error: (err) => {
          console.error('Error al eliminar categoría:', err);
          this.snackBar.open(`Error: ${err.error?.message || 'No se pudo eliminar la categoría'}`, 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
        }
      });
    }
  }
  
  // --- Filtro de Tabla ---
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}