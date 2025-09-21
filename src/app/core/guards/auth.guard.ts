import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth';
import { map, take } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  // Convert the signal to an observable before using pipe
  return toObservable(authService.getCurrentUserSignal()).pipe(
    take(1), // Prendre seulement la première valeur
    map((user) => {
      if (user) {
        return true; // Accès autorisé
      } else {
        // Rediriger vers login avec l'URL de retour
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: state.url },
        });
        return false; // Accès refusé
      }
    }),
  );
};
