import { Routes } from '@angular/router';
import { AdminComponent } from './components/admin.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full',
  },
  {
    path: 'users',
    component: AdminComponent,
  },
];
