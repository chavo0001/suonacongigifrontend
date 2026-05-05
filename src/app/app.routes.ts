import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // 1. HOME (Accessibile a tutti)
  { 
    path: '', 
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) 
  },

  // 2. AUTH (Paracadute per Deep Linking)
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },

  // 3. AREA PRIVATA (Solo per chi ha il "pass" - authGuard)
  { 
    path: 'events', 
    canActivate: [authGuard], 
    loadComponent: () => import('./features/events/events-list/events-list.component').then(m => m.EventsListComponent) 
  },
  { 
    path: 'profile', 
    canActivate: [authGuard], 
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) 
  },

  // --- FORUM ---
  { 
    path: 'forum', 
    canActivate: [authGuard], 
    loadComponent: () => import('./features/forum/threads-list/threads-list.component').then(m => m.ThreadsListComponent) 
  },
  { 
    path: 'forum/threads/:id', 
    canActivate: [authGuard], 
    loadComponent: () => import('./features/forum/thread-detail/thread-detail.component').then(m => m.ThreadDetailComponent) 
  },

  // 4. AREA ADMIN (Solo per il Boss - authGuard + adminGuard)
  { 
    path: 'admin', 
    canActivate: [authGuard, adminGuard], 
    loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent) 
  },
  { 
    path: 'admin/events/new', 
    canActivate: [authGuard, adminGuard], 
    loadComponent: () => import('./features/events/event-form/event-form.component').then(m => m.EventFormComponent) 
  },
  { 
    path: 'admin/events/:id/edit', 
    canActivate: [authGuard, adminGuard], 
    loadComponent: () => import('./features/events/event-form/event-form.component').then(m => m.EventFormComponent) 
  },

  // Catch-all: se l'utente digita roba a caso, torna in Home
  { path: '**', redirectTo: '' }
];