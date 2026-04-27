import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BaseComponent } from '../../../shared/base.component';
import { TrimValueDirective } from "../../../core/directives/trim-value.directive";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, TrimValueDirective],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent extends BaseComponent {
  private fb = inject(FormBuilder);

  // Form reattivo
  public form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Il caricamento è gestito globalmente dall'Interceptor e dal LoadingService.
    // L'authInterceptor accende la barra laser appena parte la chiamata.
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        // Usiamo il metodo della Base per un feedback immediato
        this.notifySuccess('Bentornato sul palco! 🎸');
        this.router.navigate(['/events']);
      }
      // L'errore (401 Bad Credentials) lo gestisce il GlobalErrorInterceptor.
      // Non serve scrivere il blocco 'error' qui!
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && control.touched;
  }
}