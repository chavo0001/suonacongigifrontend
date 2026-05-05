import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const loggedIn = auth.isLoggedIn();

  // Se l'utente è loggato e prova a tornare al Login o alla Home pubblica
  if (loggedIn && (state.url === '/login' || state.url === '/')) {
    router.navigate(['/events']);
    return false;
  }

  // Se non è loggato e prova ad accedere a rotte protette
  if (!loggedIn) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};