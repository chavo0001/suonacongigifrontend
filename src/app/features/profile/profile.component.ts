import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { UserProfile, Genre, Instrument, Artist, MusicalProfileDto } from '../../core/models/user.model';
import { MusicalProfileFormComponent } from '../../shared/musical-profile-form/musical-profile-form.component';
import { BaseComponent } from '../../shared/base.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, MusicalProfileFormComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent extends BaseComponent implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  profile = signal<UserProfile | null>(null);

  // Form reattivo per l'identità musicale
  musicalForm = this.fb.nonNullable.group({
    bio: ['', [Validators.required, Validators.maxLength(1000)]],
    genres: [[] as Genre[], [Validators.required, Validators.minLength(1)]],
    instruments: [[] as Instrument[], [Validators.required, Validators.minLength(1)]],
    favoriteArtists: [[] as Artist[], [Validators.required, Validators.minLength(1)]],
  });

  ngOnInit(): void {
    // Il caricamento iniziale attiva automaticamente la barra laser globale
    this.userService.getMe().subscribe({
      next: p => {
        this.profile.set(p);
        if (p.musicalProfile) {
          this.musicalForm.patchValue(p.musicalProfile);
        }
      }
    });
  }

  saveMusicalProfile(): void {
    if (this.musicalForm.invalid) {
      // Usiamo il UiService centralizzato invece dell'alert grezzo
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

    // La barra laser si attiva via Interceptor, gli errori via ErrorInterceptor
    this.userService.updateMusicalProfile(dto).subscribe({
      next: p => {
        this.profile.set(p);
        // Usiamo il metodo ereditato dal BaseComponent
        this.notifySuccess('Profilo musicale aggiornato! Ora sei pronto per il palco. 🎸');
      }
    });
  }
}