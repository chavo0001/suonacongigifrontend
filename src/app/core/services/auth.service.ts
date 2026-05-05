import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';
import { UiService } from './ui.service';

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseService {
  
  //Configurazione Endpoint (ereditata da BaseService)
  protected override readonly endpoint = 'auth';

  //Injection moderna (Angular 21 style)
  private readonly router = inject(Router);

  //Unica chiave per la persistenza sul disco (LocalStorage)
  private readonly SESSION_KEY = 'sg_session'; 

  private uiService = inject(UiService);

  // ── Stato reattivo (Signals) ──────────────────────────────────────────
  
  /** * Signal privato che gestisce l'intera sessione (User + Token + Role).
   * Viene inizializzato tentando di caricare i dati dal LocalStorage.
   */
  private _session = signal<AuthResponse | null>(this.loadSession());

  /** Esposizione dei dati utente in sola lettura */
  readonly currentUser = this._session.asReadonly();

  /** Stato booleano calcolato: l'utente è autenticato? */
  readonly isLoggedIn  = computed(() => !!this._session());

  /** Stato booleano calcolato: l'utente ha permessi Admin? */
  readonly isAdmin     = computed(() => this._session()?.role === 'ADMIN');

  // ── Metodi di Autenticazione ─────────────────────────────────────────

  /** Esegue il login e, in caso di successo, salva la sessione */
  login(req: LoginRequest): Observable<AuthResponse> {
    return this.doPost<AuthResponse>('login', req).pipe(
      tap(res => this.storeSession(res))
    );
  }

  /** Esegue la registrazione e logga automaticamente l'utente */
  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.doPost<AuthResponse>('register', req).pipe(
      tap(res => this.storeSession(res))
    );
  }

  /** Pulisce lo stato, rimuove i dati dal disco e torna al login */
  logout(): void {
    this._session.set(null);          // Svuota il segnale dell'utente
    localStorage.removeItem('token'); // Rimuove il JWT
    this.uiService.resetAll();        // Chiude eventuali overlay aperti
    this.router.navigate(['/']);      // Torna alla Home
  }

  /** * Recupera il token attuale direttamente dalla RAM (Signal).
   * Utilizzato dall'Interceptor per ogni chiamata API.
   */
  getToken(): string | null {
    return this._session()?.token ?? null;
  }

  // ── Gestione Interna Sessione (Helpers) ──────────────────────────────
  
  /** Salva i dati sia nel Signal (RAM) che nel LocalStorage (Disco) */
  private storeSession(res: AuthResponse): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(res)); 
    this._session.set(res);
  }

  /** Tenta di recuperare e "idratare" la sessione dal LocalStorage all'avvio */
  private loadSession(): AuthResponse | null {
    const raw = localStorage.getItem(this.SESSION_KEY);
    if (!raw) return null;

    try {
      // Trasformiamo la stringa salvata in un oggetto TypeScript valido
      return JSON.parse(raw) as AuthResponse;
    } catch (e) {
      // In caso di JSON corrotto, puliamo per sicurezza
      localStorage.removeItem(this.SESSION_KEY);
      return null;
    }
  }
}