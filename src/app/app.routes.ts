import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/games',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'user',
    canActivate: [authGuard],
    loadChildren: () => import('./features/user/user.routes').then((m) => m.USER_ROUTES),
  },
  {
    path: 'games',
    loadChildren: () => import('./features/game/game.routes').then((m) => m.GAME_ROUTES),
  },
  {
    path: 'admin',
    canActivate: [authGuard, AdminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
];
