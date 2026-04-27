import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { UiService } from '../services/ui.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const ui = inject(UiService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Si è verificato un errore imprevisto nella comunicazione con il server.';

      // Se il backend ha mandato un errore strutturato (ApiResponse)
      if (error.error && error.error.message) {
        message = error.error.message;
      } 
      // Altrimenti usiamo il messaggio dell'eccezione JS (es. lanciato da unpack)
      else if (error.message && !error.status) {
        message = error.message;
      }

      // Mostriamo l'errore nel segnale globale del UiService
      ui.showError(message);

      return throwError(() => error);
    })
  );
};