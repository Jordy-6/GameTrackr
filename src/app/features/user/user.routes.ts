import { Routes } from '@angular/router';
import { UserProfileComponent } from './components/profile';
export const USER_ROUTES: Routes = [
  {
    path: 'me',
    component: UserProfileComponent,
  },
];
