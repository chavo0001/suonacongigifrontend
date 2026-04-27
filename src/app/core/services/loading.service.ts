import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  isLoading = signal(false);
  private activeRequests = 0;
  private startTime = 0;
  private minDisplayTime = 600; // Millisecondi minimi di visibilità

  show() {
    if (this.activeRequests === 0) {
      this.startTime = Date.now();
      this.isLoading.set(true);
    }
    this.activeRequests++;
  }

  hide() {
    this.activeRequests--;
    if (this.activeRequests <= 0) {
      this.activeRequests = 0;
      
      const elapsed = Date.now() - this.startTime;
      const remaining = this.minDisplayTime - elapsed;

      // Se la chiamata è stata troppo veloce, ritardiamo lo spegnimento
      if (remaining > 0) {
        setTimeout(() => {
          // Ricontrolliamo che nel frattempo non siano partite altre chiamate
          if (this.activeRequests === 0) this.isLoading.set(false);
        }, remaining);
      } else {
        this.isLoading.set(false);
      }
    }
  }
}