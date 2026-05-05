// Riassunto: Componente pagina profilo utente che mostra e permette la modifica del profilo musicale.
import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { UserProfile, Genre, Instrument, Artist, MusicalProfileDto } from '../../core/models/user.model';
import { MusicalProfileFormComponent } from '../../shared/musical-profile-form/musical-profile-form.component';
import { BaseComponent } from '../../shared/base.component';
import { CensuraService } from '../../core/services/censura.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, MusicalProfileFormComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent extends BaseComponent implements OnInit {
  // --- Dependency Injection ---
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  readonly censura = inject(CensuraService); // Servizio per il filtro parole volgari

  // --- State Management ---
  profile = signal<UserProfile | null>(null);

  // --- Form Reattivo ---
  musicalForm = this.fb.nonNullable.group({
    bio: ['', [Validators.required, Validators.maxLength(1000)]],
    genres: [[] as Genre[], [Validators.required, Validators.minLength(1)]],
    instruments: [[] as Instrument[], [Validators.required, Validators.minLength(1)]],
    favoriteArtists: [[] as Artist[], [Validators.required, Validators.minLength(1)]],
  });

  ngOnInit(): void {
    // Caricamento profilo utente all'avvio
    this.userService.getMe().subscribe({
      next: p => {
        this.profile.set(p);
        if (p.musicalProfile) {
          this.musicalForm.patchValue(p.musicalProfile);
        }
      }
    });

    // Sincronizziamo lo stato della censura con il database
    this.censura.caricaStato().subscribe();
  }

  /**
   * Salva le modifiche all'identità musicale (Bio, Generi, ecc.)
   */
  saveMusicalProfile(): void {
    if (this.musicalForm.invalid) {
      this.ui.showError("⚠️ Il profilo è incompleto. Controlla Bio, Strumenti, Generi e Artisti!");
      this.musicalForm.markAllAsTouched();
      return;
    }

    const raw = this.musicalForm.getRawValue();
    const dto: MusicalProfileDto = {
      bio: raw.bio,
      genreIds: raw.genres.map(g => g.id),
      instrumentIds: raw.instruments.map(i => i.id),
      artistIds: raw.favoriteArtists.map(a => a.id)
    };

    this.userService.updateMusicalProfile(dto).subscribe({
      next: p => {
        this.profile.set(p);
        this.notifySuccess('Profilo musicale aggiornato! Ora sei pronto per il palco. 🎸');
      }
    });
  }

  /**
   * Attiva/Disattiva il filtro volgarità (Metodo chiamato dal click nell'HTML)
   */
  cambiaCensura(): void {
    this.censura.toggleCensura().subscribe({
      next: () => {
        // Mostriamo il messaggio dinamico (🛡️ Filtro attivo / 🔓 Filtro disattivo)
        const messaggio = this.censura.etichettaToggle();
        this.notifySuccess(messaggio);
      },
      error: () => {
        this.ui.showError('Ops! Errore durante il cambio del filtro.');
      }
    });
  }
}
