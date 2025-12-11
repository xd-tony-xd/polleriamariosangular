import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, PercentPipe, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, forkJoin, map } from 'rxjs';

// Importación de Servicios
import { PlatoService } from '../../../services/plato.service';
import { ContactoService } from '../../../services/contacto.service';
import { CategoriaService } from '../../../services/categoria.service';
import { HorarioService } from '../../../services/horario.service';
import { ExtraService } from '../../../services/extra.service';
import { MenuDiaService } from '../../../services/menu-dia.service';
import { PublicidadService } from '../../../services/publicidad.service';

// Definición de la interfaz de estadísticas
interface DashboardStats {
  // DATOS REALES (Contados por la longitud de la respuesta del servicio)
  totalPlatosDisponibles: number; // Platos con disponible=true
  totalMensajes: number;         // ContactoService.listar().length
  totalCategorias: number;       // CategoriaService.listar().length
  totalHorarios: number;         // HorarioService.listar().length
  totalMenusDia: number;         // MenuDiaService.listar().length
  totalExtras: number;           // ExtraService.listar().length
  totalPublicidadActiva: number; // PublicidadService.listar().filter(p => p.activo).length
  
  // DATOS SIMULADOS MÍNIMOS (Por falta de AnalyticsService/OrdenService)
  totalWebVisits: number;        // Simulación de visitas al HomeComponent
  visitasCrecimientoMensual: number; // Porcentaje fijo para la simulación
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatProgressSpinnerModule,
    
    PercentPipe, 
    DecimalPipe
  ], 
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  stats: DashboardStats | null = null;
  isLoading: boolean = true;
  
  constructor(
    private platoService: PlatoService,
    private contactoService: ContactoService,
    private categoriaService: CategoriaService,
    private horarioService: HorarioService,
    private extraService: ExtraService,
    private menuDiaService: MenuDiaService,
    private publicidadService: PublicidadService
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.isLoading = true;
    
    // 1. Definición de Observables para TODAS las llamadas a la API
    const platos$ = this.platoService.listar().pipe(
      map(platos => platos.filter(p => p.disponible).length)
    );
    
    const contactos$ = this.contactoService.listar().pipe(
      map(contactos => contactos.length)
    );
    
    const categorias$ = this.categoriaService.listar().pipe(
      map(categorias => categorias.length)
    );
    
    const horarios$ = this.horarioService.listar().pipe(
      map(horarios => horarios.length)
    );

    const extras$ = this.extraService.listar().pipe(
      map(extras => extras.length)
    );

    const menusDia$ = this.menuDiaService.listar().pipe(
      map(menus => menus.length)
    );
    
    const publicidad$ = this.publicidadService.listar().pipe(
      map(publicidades => publicidades.filter(p => p.activo).length)
    );

    // 2. Ejecutar todas las llamadas concurrentemente con forkJoin
    forkJoin({
      platosDisponibles: platos$,
      mensajes: contactos$,
      categorias: categorias$,
      horarios: horarios$,
      extras: extras$,
      menusDia: menusDia$,
      publicidadActiva: publicidad$
    }).subscribe({
      next: (results) => {
        // Mapear los resultados REALES y añadir la simulación mínima
        this.stats = {
          totalPlatosDisponibles: results.platosDisponibles,
          totalMensajes: results.mensajes,
          totalCategorias: results.categorias,
          totalHorarios: results.horarios,
          totalExtras: results.extras,
          totalMenusDia: results.menusDia,
          totalPublicidadActiva: results.publicidadActiva,
          
          // Valores simulados para visitas (sustituyendo Órdenes)
          totalWebVisits: 8750, // Ejemplo de visitas mensuales/semanales
          visitasCrecimientoMensual: 0.08, // 8% Fijo
        };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar datos del Dashboard:', err);
        this.isLoading = false;
        // Fallback en caso de error de API
        this.stats = {
          totalPlatosDisponibles: 0, totalMensajes: 0, totalCategorias: 0,
          totalHorarios: 0, totalExtras: 0, totalMenusDia: 0, 
          totalPublicidadActiva: 0, totalWebVisits: 0,
          visitasCrecimientoMensual: 0
        };
      }
    });
  }

  // Funciones de ayuda para iconos y colores de tendencia (cosméticas)
  getTrendIcon(value: number): string {
    return value > 0 ? 'trending_up' : (value < 0 ? 'trending_down' : 'horizontal_rule');
  }

  getTrendClass(value: number): string {
    return value > 0 ? 'text-green-400' : (value < 0 ? 'text-red-400' : 'text-gray-400');
  }
}