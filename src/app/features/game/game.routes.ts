import { Routes } from '@angular/router';

export const GAME_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/game/game-library.component').then((c) => c.GameLibraryComponent),
  },
  {
    path: 'my-library',
    loadComponent: () =>
      import('./components/personal/personal-library.component').then(
        (c) => c.PersonalLibraryComponent,
      ),
  },
];
