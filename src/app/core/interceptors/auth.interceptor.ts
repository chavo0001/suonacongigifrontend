import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs'; // Importante per gestire la chiusura 
import { AuthService } from '../services/auth.service';
import { LoadingService } from '../services/loading.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const loadingService = inject(LoadingService); // Iniettiamo il servizio loading
  const token = authService.getToken();

  // --- LOGICA PRO: Accendiamo il segnale di caricamento ---
  loadingService.show();

  // Logica JWT esistente
  let requestToProcess = req;
  if (token) {
    requestToProcess = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // --- GESTIONE RISPOSTA ---
  return next(requestToProcess).pipe(
    // finalize viene eseguito SEMPRE (successo o errore)
    finalize(() => {
      // Spegniamo il caricamento
      loadingService.hide();
    })
  );
};