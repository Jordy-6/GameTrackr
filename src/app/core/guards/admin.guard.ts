import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

export const AdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.user$;

  return toObservable(currentUser).pipe(
    map((user) => {
      if (user && user.role === 'admin') {
        return true;
      } else {
        router.navigate(['/']);
        return false;
      }
    }),
  );
};
