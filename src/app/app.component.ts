import { Component, HostListener, inject, OnInit, signal, effect } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { PlatformLocation } from '@angular/common';
import { filter } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { UiService } from './core/services/ui.service';
import { LoginComponent } from "./features/auth/login/login.component";
import { RegisterComponent } from "./features/auth/register/register.component";
import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, LoginComponent, RegisterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);
  public ui = inject(UiService); 
  public loadingService = inject(LoadingService);  
  private location = inject(PlatformLocation);
  
  isUserLogged = signal(false);
  isPublicPage = signal(true);
  private readonly SESSION_PATH = 'sg_current_path';

  constructor() {
    // Sincronizziamo lo stato del login
    effect(() => {
      this.isUserLogged.set(!!this.auth.currentUser());
      // Se l'utente entra, chiudiamo ogni cassetto aperto
      if (this.auth.currentUser()) this.ui.closeAll();
    });

    // Gestione navigazione e Masking
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      const url = e.urlAfterRedirects;
      // Ora solo la '/' è davvero pubblica, Login e Register sono overlay
      this.isPublicPage.set(url === '/');

      this.ui.errorMessage.set(null);
      
      sessionStorage.setItem(this.SESSION_PATH, url);
      history.replaceState(null, '', '/suonacongigi');
    });
  }

  ngOnInit() {
    const savedPath = sessionStorage.getItem(this.SESSION_PATH);
    const isLoggedIn = !!this.auth.currentUser();

    // RIPRISTINO POST-REFRESH (F5)
    // Fondamentale: se ero in /events, devo tornarci anche se l'URL dice /suonacongigi
    if (savedPath && savedPath !== '/') {
      if (isLoggedIn) {
        this.router.navigateByUrl(savedPath, { skipLocationChange: true });
      } else {
        this.router.navigateByUrl('/', { skipLocationChange: true });
      }
    }

    // GESTIONE TASTO INDIETRO (URL Masking)
    this.location.onPopState(() => {
      history.pushState(null, '', '/suonacongigi');
      if (!this.isPublicPage()) {
         // Se siamo nell'area privata, avvisiamo che non si torna indietro così
         alert("⚠️ Usa il menu dell'app per navigare.");
      }
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload($event: BeforeUnloadEvent) {
    $event.returnValue = true; 
  }
}