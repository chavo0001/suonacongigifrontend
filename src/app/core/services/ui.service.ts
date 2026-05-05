import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UiService {
  // --- Gestione Drawer (Esistente) ---
  showLogin = signal(false);
  showRegister = signal(false);

  // --- Nuova Gestione Feedback Globale ---
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Metodi per i messaggi
  showError(msg: string) {
    this.errorMessage.set(msg);
    // Sparisce dopo 6 secondi (lasciamo tempo di leggere)
    setTimeout(() => this.errorMessage.set(null), 6000);
  }

  showSuccess(msg: string) {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 3500);
  }

  // Reset e chiusura
  resetAll() {
    this.showLogin.set(false);
    this.showRegister.set(false);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  openLogin()    { this.showLogin.set(true);    this.showRegister.set(false); }
  openRegister() { this.showRegister.set(true); this.showLogin.set(false);    }
  closeAll()     { this.resetAll(); }
}