import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Genre, Instrument, Artist } from '../../../core/models/user.model';
import { MusicalProfileFormComponent } from '../../../shared/musical-profile-form/musical-profile-form.component';
import { BaseComponent } from '../../../shared/base.component';

// Funzione di validazione esterna per il confronto password
function passwordMatch(group: AbstractControl) {
  const pw  = group.get('password')?.value;
  const pw2 = group.get('confirmPassword')?.value;
  return pw === pw2 ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, MusicalProfileFormComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent extends BaseComponent {
  private fb = inject(FormBuilder);

  // Definizione del Form con struttura nidificata coerente con il DTO Java
  form = this.fb.nonNullable.group({
    username:        ['', [Validators.required, Validators.minLength(3)]],
    email:           ['', [Validators.required, Validators.email]],
    password:        ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],

    musicalProfile: this.fb.nonNullable.group({
      bio:             ['', [Validators.required, Validators.maxLength(1000)]],
      genres:          [[] as Genre[], [Validators.required, Validators.minLength(1)]],
      instruments:     [[] as Instrument[], [Validators.required, Validators.minLength(1)]],
      favoriteArtists: [[] as Artist[], [Validators.required, Validators.minLength(1)]],
    })
  }, { validators: passwordMatch });

  get showPasswordMismatch(): boolean {
    const confirm = this.form.get('confirmPassword');
    return this.form.hasError('passwordMismatch') && (confirm?.touched ?? false);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.ui.showError("⚠️ Controlla i dati inseriti. Assicurati di aver compilato anche il profilo musicale!");
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    // Mappatura per il backend: convertiamo gli oggetti Genre/Instrument/Artist in ID
    const payload = {
      username: raw.username,
      email: raw.email,
      password: raw.password, 
      musicalProfile: {
        bio: raw.musicalProfile.bio,
        genreIds:      raw.musicalProfile.genres.map(g => g.id),
        instrumentIds: raw.musicalProfile.instruments.map(i => i.id),
        artistIds:     raw.musicalProfile.favoriteArtists.map(a => a.id)
      }
    };

    // La chiamata attiva automaticamente la barra laser via Interceptor
    this.auth.register(payload).subscribe({
      next: () => {
        this.notifySuccess("Benvenuto nella band! 🎸 Il tuo profilo è pronto.");
        this.ui.closeAll(); // Chiudiamo il drawer di registrazione
        this.router.navigate(['/events']);
      }
      // Errori (es: email già esistente) gestiti dal GlobalErrorInterceptor
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && control.touched;
  }
}