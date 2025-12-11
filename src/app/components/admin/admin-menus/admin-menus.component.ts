import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // 🚨 AÑADIDO DatePipe para la tabla
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


import { MenuDia } from '../../../models/entity/menu-dia';
import { MenuDiaService } from '../../../services/menu-dia.service';
import { MenuDiaFormComponent } from './menu-dia-form/menu-dia-form.component';

@Component({
  selector: 'app-admin-menus',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCardModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatDialogModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatSlideToggleModule
  ],
  templateUrl: './admin-menus.component.html',
  styleUrls: ['./admin-menus.component.css']
})
export class AdminMenusComponent implements OnInit {
  
  // 🚨 CORRECCIÓN: Añadir 'imagen' a las columnas a mostrar
  displayedColumns: string[] = ['id', 'imagen', 'fecha', 'horario.turno', 'titulo', 'precio', 'disponible', 'acciones'];
  dataSource!: MatTableDataSource<MenuDia>;
  isLoading: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private menuDiaService: MenuDiaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarMenus();
  }

  cargarMenus(): void {
    this.isLoading = true;
    this.menuDiaService.listar().subscribe({
      next: (data) => {
        // Aseguramos que la fecha se muestre correctamente si es una cadena
        data.forEach(m => m.fecha = new Date(m.fecha)); 
        
        this.dataSource = new MatTableDataSource(data);
        
        // 🚨 Implementación de la función de acceso para anidar propiedades (horario.turno)
        this.dataSource.sortingDataAccessor = (item, property) => {
          switch (property) {
            case 'horario.turno': return item.horario.turno;
            case 'fecha': return item.fecha.getTime(); // Ordenar por timestamp
            default: return (item as any)[property];
          }
        };
        
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar menús:', err);
        this.snackBar.open('Error al cargar los menús del día.', 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
        this.isLoading = false;
      }
    });
  }

  abrirFormulario(menu?: MenuDia): void {
    const dialogRef = this.dialog.open(MenuDiaFormComponent, {
      width: '600px',
      data: { menu: menu } 
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarMenus();
      }
    });
  }

  eliminarMenu(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este menú?')) {
      this.menuDiaService.eliminar(id).subscribe({
        next: () => {
          this.snackBar.open('Menú eliminado exitosamente.', 'Cerrar', { duration: 2500, panelClass: ['success-snackbar'] });
          this.cargarMenus(); 
        },
        error: (err) => {
          console.error('Error al eliminar menú:', err);
          this.snackBar.open(`Error: ${err.error?.message || 'No se pudo eliminar el menú'}`, 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
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