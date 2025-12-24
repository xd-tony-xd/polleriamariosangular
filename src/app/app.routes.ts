import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';

import { authGuard } from './guards/auth.guard';

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
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },

  {
    path: 'admin',
    component: AdminPanelComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'platos', component: AdminPlatosComponent },
      { path: 'menus', component: AdminMenusComponent },
      { path: 'publicidad', component: AdminPublicidadComponent },
      { path: 'categorias', component: AdminCategoriasComponent },
      { path: 'horarios', component: AdminHorariosComponent },
      { path: 'extras', component: AdminExtrasComponent },
      { path: 'usuarios', component: AdminUsuariosComponent },
      { path: 'contactos', component: AdminContactosComponent },
    ]
  },

  { path: '**', redirectTo: '' }
];
