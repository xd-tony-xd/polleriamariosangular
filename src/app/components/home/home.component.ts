import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

// Importa tus servicios y modelos
import { PlatoService } from '../../services/plato.service';
import { MenuDiaService } from '../../services/menu-dia.service';
import { PublicidadService } from '../../services/publicidad.service';
import { HorarioService } from '../../services/horario.service';
import { ContactoService } from '../../services/contacto.service';
import { Plato } from '../../models/entity/plato';
import { MenuDia } from '../../models/entity/menu-dia';
import { Publicidad } from '../../models/entity/publicidad';
import { Horario } from '../../models/entity/horario';
import { Contacto } from '../../models/entity/contacto';

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
  
  // Horario activo según la hora actual
  horarioActivo: string = ''; 
  // El turno seleccionado por el usuario para filtrar
  horarioSeleccionado: string = ''; 
  
  isLoading: boolean = true;
  
  currentYear = new Date().getFullYear();

  constructor(
    private platoService: PlatoService,
    private menuDiaService: MenuDiaService,
    private publicidadService: PublicidadService,
    private horarioService: HorarioService,
    private contactoService: ContactoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  /**
   * Filtra la lista completa de menús del día por el turno actualmente seleccionado.
   */
  get menusDelDiaFiltrados(): MenuDia[] {
    // Aseguramos que solo se muestren menús que tienen un horario válido y coinciden con el turno.
    return this.menusDelDia.filter(menu => 
      menu.horario && menu.horario.turno === this.horarioSeleccionado
    );
  }

  /**
   * Actualiza el horario seleccionado por el usuario y se desplaza a la sección de menú.
   */
  seleccionarHorario(turno: string): void {
    this.horarioSeleccionado = turno;
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  }

  cargarDatos(): void {
    this.isLoading = true;
    let horariosCargados = false;
    let menusCargados = false;
    
    const checkLoading = () => {
        if (horariosCargados && menusCargados) {
            this.isLoading = false;
        }
    };
    
    // Cargar horarios primero, ya que es la clave para determinar el filtro inicial.
    this.horarioService.listar().subscribe({
      next: (horarios) => {
        this.horarios = horarios;
        // 🚨 CLAVE: Usamos los horarios de la BD para determinar el turno activo.
        this.determinarHorarioActivo();
        // Establece el filtro inicial al horario activo determinado.
        this.horarioSeleccionado = this.horarioActivo; 
        horariosCargados = true;
        checkLoading();
      },
      error: (error) => {
        console.error('Error cargando horarios:', error);
        this.horarios = [];
        // Si fallan los horarios, usamos un valor por defecto para evitar errores.
        this.horarioActivo = 'Pollería'; 
        this.horarioSeleccionado = this.horarioActivo; 
        horariosCargados = true;
        checkLoading();
      }
    });

    // Cargar menús del día (hoy) - La fecha debe ser precisa al día
    const hoy = new Date().toISOString().split('T')[0];
    this.menuDiaService.buscarPorFecha(hoy).subscribe({
      next: (menus) => {
        this.menusDelDia = menus;
        menusCargados = true;
        checkLoading();
      },
      error: (error) => {
        console.error('Error cargando menús:', error);
        this.menusDelDia = [];
        menusCargados = true;
        checkLoading();
      }
    });

    // Cargar platos destacados
    this.platoService.listar().subscribe({
      next: (platos) => {
        // Filtra platos destacados (si tienes un campo para eso) o solo toma los primeros 6.
        this.platos = platos.slice(0, 6);
      },
      error: (error) => {
        console.error('Error cargando platos:', error);
        this.platos = [];
      }
    });

    // Cargar publicidades activas
    this.publicidadService.listar().subscribe({
      next: (publicidades) => {
        this.publicidades = publicidades.filter(p => p.activo).slice(0, 3);
      },
      error: (error) => {
        console.error('Error cargando publicidades:', error);
        this.publicidades = [];
      }
    });


    // Cargar contactos 
    this.contactoService.listar().subscribe({
      next: (contactos) => {
        this.contactos = contactos.slice(0, 4); 
      },
      error: (error) => {
        console.error('Error cargando contactos:', error);
        this.contactos = [];
      }
    });
  }

  /**
   * Determina el horario (turno) activo comparando la hora actual 
   * con los rangos de inicio/fin de los horarios obtenidos de la BD.
   */
  determinarHorarioActivo(): void {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    // Convertir la hora actual a un formato comparable (HHMM)
    const currentTime = currentHour * 100 + currentMinute;
    
    // Ordenar los horarios por hora de inicio para un manejo secuencial
    const horariosOrdenados = [...this.horarios].sort((a, b) => {
      return this.timeToMinutes(a.horaInicio) - this.timeToMinutes(b.horaInicio);
    });

    // Buscar el turno que está activo AHORA
    for (const horario of horariosOrdenados) {
      const startMinutes = this.timeToMinutes(horario.horaInicio);
      const endMinutes = this.timeToMinutes(horario.horaFin);
      const currentMinutes = this.timeToMinutes(`${currentHour}:${currentMinute}`);

      // Si la hora de inicio es menor que la de fin (ej: 07:00 a 16:00)
      if (startMinutes < endMinutes) {
        if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
          this.horarioActivo = horario.turno;
          return;
        }
      } else {
        // Caso de rango que cruza la medianoche (ej: 20:00 a 03:00)
        if (currentMinutes >= startMinutes || currentMinutes < endMinutes) {
          this.horarioActivo = horario.turno;
          return;
        }
      }
    }

    // Si no se encontró ningún horario activo (ej. fuera de los horarios de atención)
    // Se establece el primer horario como defecto si existe, o un valor fijo.
    this.horarioActivo = horariosOrdenados[0]?.turno || 'Pollería';
  }
    
    /**
     * Convierte una cadena de tiempo (HH:MM) a minutos del día para fácil comparación.
     * Ejemplo: "11:30" -> 690 minutos.
     */
    private timeToMinutes(timeString: string): number {
        if (!timeString) return 0;
        const [hour, minute] = timeString.split(':').map(Number);
        return (hour * 60) + (minute || 0);
    }
    
    // 🚨 FUNCIÓN MODIFICADA: Ahora se desplaza al contacto
    /**
     * Desplaza al usuario a la sección de contacto (id="#contacto") al hacer clic en Pedir.
     */
    hacerPedido(item: any): void {
      const nombreItem = item.nombre || item.titulo || 'Artículo';
      console.log(`Cliente quiere ordenar: ${nombreItem}. Desplazando a Contacto.`);
    
      // Lógica principal: Desplazar a la sección #contacto
      setTimeout(() => {
        const contactoElement = document.getElementById('contacto');
        if (contactoElement) {
          contactoElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start'      
          });
        } else {
          console.error('El elemento con id="contacto" no fue encontrado.');
        }
      }, 100); 
    }

  formatearPrecio(precio: number): string {
    return `S/ ${precio.toFixed(2)}`;
  }

  formatearFecha(fechaString: string): string {
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return fechaString;
    }
  }

  irALogin(): void {
    this.router.navigate(['/login']);
  }

  llamarContacto(telefono: string): void {
    window.open(`tel:${telefono}`, '_self');
  }
}