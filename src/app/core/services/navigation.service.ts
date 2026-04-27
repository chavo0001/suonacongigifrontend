import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private router = inject(Router);

  /**
   * Metodo centralizzato per muoversi nell'app senza cambiare l'URL
   */
  goTo(path: string | any[]) {
    const url = Array.isArray(path) ? path : [path];
    this.router.navigate(url, { skipLocationChange: true });
  }
}