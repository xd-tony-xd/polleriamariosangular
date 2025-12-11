import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { authGuard } from './guards/auth.guard'; // Importar el guard
// Importar todos los componentes de administración creados
import { DashboardComponent } from './components/admin/dashboard/dashboard.component';
import { AdminPlatosComponent } from './components/admin/admin-platos/admin-platos.component';
import { AdminMenusComponent } from './components/admin/admin-menus/admin-menus.component';
import { AdminPublicidadComponent } from './components/admin/admin-publicidad/admin-publicidad.component';
import { AdminCategoriasComponent } from './components/admin/admin-categorias/admin-categorias.component';
import { AdminHorariosComponent } from './components/admin/admin-horarios/admin-horarios.component';
import { AdminExtrasComponent } from './components/admin/admin-extras/admin-extras.component';
import { AdminUsuariosComponent } from './components/admin/admin-usuarios/admin-usuarios.component';
import { AdminContactosComponent } from './components/admin/admin-contactos/admin-contactos.component';


export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Pollería Marios' },
  { path: 'login', component: LoginComponent, title: 'Acceso Administración' },
  
  // RUTA PRINCIPAL DE ADMINISTRACIÓN PROTEGIDA
  { 
    path: 'admin', 
    component: AdminPanelComponent, 
    canActivate: [authGuard], // APLICAMOS EL GUARDIA AQUÍ
    children: [
      { path: '', component: DashboardComponent, title: 'Admin Dashboard' }, // admin/
      { path: 'platos', component: AdminPlatosComponent, title: 'Admin Platos' }, // admin/platos
      { path: 'menus', component: AdminMenusComponent, title: 'Admin Menús' }, // admin/menus
      { path: 'publicidad', component: AdminPublicidadComponent, title: 'Admin Promociones' },
      { path: 'categorias', component: AdminCategoriasComponent, title: 'Admin Categorías' },
      { path: 'horarios', component: AdminHorariosComponent, title: 'Admin Horarios' },
      { path: 'extras', component: AdminExtrasComponent, title: 'Admin Extras' },
      { path: 'usuarios', component: AdminUsuariosComponent, title: 'Admin Usuarios' },
      { path: 'contactos', component: AdminContactosComponent, title: 'Admin Contactos' },
    ]
  },

  // Redirige al Home si la ruta no existe
  { path: '**', redirectTo: '' }
];