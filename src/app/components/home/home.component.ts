import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

import { PlatoService } from '../../services/plato.service';
import { MenuDiaService } from '../../services/menu-dia.service';
import { PublicidadService } from '../../services/publicidad.service';
import { HorarioService } from '../../services/horario.service';
import { ContactoService } from '../../services/contacto.service';
import { ExtraService } from '../../services/extra.service'; 
import { Plato } from '../../models/entity/plato';
import { MenuDia } from '../../models/entity/menu-dia';
import { Publicidad } from '../../models/entity/publicidad';
import { Horario } from '../../models/entity/horario';
import { Contacto } from '../../models/entity/contacto';
import { Extra } from '../../models/entity/extra'; 

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatToolbarModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  platos: Plato[] = [];
  menusDelDia: MenuDia[] = [];
  publicidades: Publicidad[] = [];
  horarios: Horario[] = [];
  contactos: Contacto[] = [];
  extras: Extra[] = []; 
  
  horarioActivo: string = ''; 
  horarioSeleccionado: string = ''; 
  isLoading: boolean = true;
  currentYear = new Date().getFullYear();
  menuOpen = false;

  constructor(
    private platoService: PlatoService,
    private menuDiaService: MenuDiaService,
    private publicidadService: PublicidadService,
    private horarioService: HorarioService,
    private contactoService: ContactoService,
    private extraService: ExtraService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  // Getter corregido para ser más robusto con los nombres de los turnos
  get menusDelDiaFiltrados(): MenuDia[] {
    if (!this.menusDelDia) return [];
    return this.menusDelDia.filter(menu => 
      menu.horario && menu.horario.turno.trim() === this.horarioSeleccionado.trim()
    );
  }

  seleccionarHorario(turno: string): void {
    this.horarioSeleccionado = turno;
  }

  cargarDatos(): void {
    this.isLoading = true;
    
    // 1. Cargamos horarios primero para saber en qué turno estamos
    this.horarioService.listar().subscribe({
      next: (horarios) => {
        this.horarios = horarios;
        this.determinarHorarioActivo();
        // Forzamos que la pestaña seleccionada sea la del turno actual
        this.horarioSeleccionado = this.horarioActivo;
        
        // 2. Una vez que sabemos el turno, cargamos los menús de HOY
        this.cargarMenusDeHoy();
      },
      error: () => {
        this.horarioActivo = 'Desayuno';
        this.horarioSeleccionado = 'Desayuno';
        this.isLoading = false;
      }
    });

    // Cargar el resto de datos de forma independiente
    this.platoService.listar().subscribe({ next: (platos) => this.platos = platos.slice(0, 6) });
    this.publicidadService.listar().subscribe({ next: (p) => this.publicidades = p.filter(x => x.activo).slice(0, 3) });
    this.contactoService.listar().subscribe({ next: (c) => this.contactos = c.slice(0, 4) });
    this.extraService.listar().subscribe({ next: (e) => this.extras = e.filter(x => x.disponible) });
  }
cargarMenusDeHoy(): void {
  this.menuDiaService.listar().subscribe({
    next: (menus) => {
      // 1. Obtener fecha de hoy como "YYYY-MM-DD"
      const hoy = new Date();
      const anio = hoy.getFullYear();
      const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
      const dia = hoy.getDate().toString().padStart(2, '0');
      const hoyStr = `${anio}-${mes}-${dia}`;

      console.log('Buscando para hoy:', hoyStr);

      this.menusDelDia = menus.filter((menu: any) => {
        if (!menu.fecha) return false;

        // Convertimos la fecha del menú a string "YYYY-MM-DD"
        let fechaMenuStr = '';
        
        if (typeof menu.fecha === 'string') {
          // Si es string, tomamos los primeros 10 caracteres (YYYY-MM-DD)
          fechaMenuStr = menu.fecha.substring(0, 10);
        } else {
          // Si es objeto Date
          const f = new Date(menu.fecha);
          const fAnio = f.getFullYear();
          const fMes = (f.getMonth() + 1).toString().padStart(2, '0');
          const fDia = f.getDate().toString().padStart(2, '0');
          fechaMenuStr = `${fAnio}-${fMes}-${fDia}`;
        }
        
        return fechaMenuStr === hoyStr && menu.disponible === true;
      });

      this.isLoading = false;
    },
    error: (err) => {
      console.error('Error al listar menús:', err);
      this.isLoading = false;
    }
  });
}
  determinarHorarioActivo(): void {
    const now = new Date();
    const currentMinutes = (now.getHours() * 60) + now.getMinutes();
    
    if (!this.horarios || this.horarios.length === 0) {
      this.horarioActivo = 'Desayuno';
      return;
    }

    const horariosOrdenados = [...this.horarios].sort((a, b) => {
      return this.timeToMinutes(a.horaInicio) - this.timeToMinutes(b.horaInicio);
    });

    let encontrado = false;
    for (const horario of horariosOrdenados) {
      const startMinutes = this.timeToMinutes(horario.horaInicio);
      const endMinutes = this.timeToMinutes(horario.horaFin);

      // Lógica para turnos que cruzan la medianoche (ej: 22:00 a 02:00)
      if (startMinutes < endMinutes) {
        if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
          this.horarioActivo = horario.turno;
          encontrado = true;
          break;
        }
      } else {
        if (currentMinutes >= startMinutes || currentMinutes < endMinutes) {
          this.horarioActivo = horario.turno;
          encontrado = true;
          break;
        }
      }
    }

    if (!encontrado) {
      this.horarioActivo = horariosOrdenados[0].turno;
    }
  }

  private timeToMinutes(timeString: string): number {
    if (!timeString) return 0;
    const [hour, minute] = timeString.split(':').map(Number);
    return (hour * 60) + (minute || 0);
  }

  // --- MÉTODOS DE APOYO ---
  hacerPedido(item: any): void {
    setTimeout(() => {
      document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100); 
  }

  formatearPrecio(precio: number): string {
    return `S/ ${precio.toFixed(2)}`;
  }

  formatearFecha(fechaString: string): string {
    try {
      const fecha = new Date(fechaString);
      fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset()); // Ajuste de zona horaria
      return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) { return fechaString; }
  }

  irALogin(): void { this.router.navigate(['/login']); }

  llamarContacto(telefono: string): void {
    const tel = telefono.replace(/\s+/g, '');
    window.open(`https://wa.me/${tel}`, '_blank');
  }

  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
}