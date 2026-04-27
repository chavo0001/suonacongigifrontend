import { inject }            from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService }       from '../services/auth.service';

/**
 * adminGuard – protegge le rotte riservate agli amministratori.
 * Reindirizza a /events se l'utente non ha ruolo ADMIN.
 * Va usato sempre DOPO authGuard nelle route definitions.
 */
export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdmin()) return true;

  router.navigate(['/events']);
  return false;
};
