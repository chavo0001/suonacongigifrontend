import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UiService } from '../core/services/ui.service';
import { AuthService } from '../core/services/auth.service';
import { LoadingService } from '../core/services/loading.service';

export abstract class BaseComponent {
  // Iniezioni comuni disponibili per tutti i figli
  protected ui      = inject(UiService);
  protected auth    = inject(AuthService);
  protected router  = inject(Router);
  protected loading = inject(LoadingService);

  /**
   * Metodo rapido per mostrare un successo.
   * L'errore non serve: ci pensa l'Interceptor a chiamare ui.showError()!
   */
  protected notifySuccess(message: string) {
    this.ui.showSuccess(message);
  }

  /**
   * Se un componente ha bisogno di sapere se sta caricando
   * (ad esempio per disabilitare un tasto specifico)
   */
  protected isLoading() {
    return this.loading.isLoading();
  }
}