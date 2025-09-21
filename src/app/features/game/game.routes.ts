import { Routes } from '@angular/router';
import { GameLibraryComponent } from './components/game/game-library.component';
import { PersonalLibraryComponent } from './components/personal/personal-library.component';
import { authGuard } from '../../core/guards/auth.guard';

export const GAME_ROUTES: Routes = [
  {
    path: '',
    component: GameLibraryComponent,
  },
  {
    path: 'my-library',
    canActivate: [authGuard],
    component: PersonalLibraryComponent,
  },
];
