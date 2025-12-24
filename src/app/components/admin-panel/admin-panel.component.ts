import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service'; 
import { filter } from 'rxjs/operators'; 

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    RouterModule 
  ],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent implements OnInit {
    
    // Valores iniciales limpios
    userName: string = ''; 
    userRole: string = ''; 
    userEmail: string = ''; 
    isSidebarOpen: boolean = false; 
    isMobile: boolean = false; 

    constructor(private router: Router, public authService: AuthService) {
        // Lógica para detectar si está en móvil y para cerrar la barra al navegar
        this.checkIfMobile();
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            // Si está en móvil, cerrar el sidebar después de la navegación
            if (this.isMobile && this.isSidebarOpen) {
                this.isSidebarOpen = false;
            }
        });
    } 
    
    ngOnInit(): void {
        this.loadUserData();
        // Escuchar cambios de tamaño de pantalla
        window.addEventListener('resize', this.checkIfMobile);
    }

    checkIfMobile = () => {
        this.isMobile = window.innerWidth < 768;
        
        // Lógica de visibilidad del sidebar según el dispositivo
        const shouldBeOpen = !this.isMobile; // Debe estar abierto en escritorio
        if (this.isSidebarOpen !== shouldBeOpen) {
            this.isSidebarOpen = shouldBeOpen;
        }
    }
    
    // Función de carga de datos sin valores estáticos (else)
   loadUserData() {
  const userData = this.authService.getUserData();

  this.userName =
    userData?.nombre && userData.nombre.length > 0
      ? userData.nombre.split(' ')[0]
      : 'Usuario';

  this.userRole = userData?.rol ?? '';
  this.userEmail = userData?.email ?? '';
}

    
    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
    }

    volverHome() {
        this.authService.logout();
        this.router.navigate(['/']);
    }
}