import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { EventService } from '../../../core/services/event.service';
import { BaseComponent } from '../../../shared/base.component';
import { TrimValueDirective } from "../../../core/directives/trim-value.directive";

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DatePipe, TrimValueDirective],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent extends BaseComponent implements OnInit {
  private fb = inject(FormBuilder);
  private eventService = inject(EventService);
  private route = inject(ActivatedRoute);

  // --- Stato del Form ---
  form = this.fb.nonNullable.group({
    title:       ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    eventDate:   ['', Validators.required],
    location:    [''],
    maxSeats:    [50, [Validators.required, Validators.min(1)]],
  });

  // Anteprima reattiva: questo Signal locale ha senso perché serve solo al template
  formValues = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  // Segnali di identità
  eventId = signal<number | null>(null);
  isEdit  = computed(() => !!this.eventId());

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventId.set(Number(id));
      this.loadEvent();
    }
  }

  private loadEvent(): void {
    if (!this.eventId()) return;

    // La barra laser si attiva via Interceptor
    this.eventService.getById(this.eventId()!).subscribe({
      next: event => {
        // Formattazione data per l'input datetime-local (ISO -> yyyy-MM-ddThh:mm)
        const localDate = event.eventDate.slice(0, 16);
        this.form.patchValue({ ...event, eventDate: localDate });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.ui.showError("⚠️ Il modulo contiene errori. Controlla i campi obbligatori.");
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.form.getRawValue(),
      eventDate: this.form.getRawValue().eventDate + ':00', // Aggiungiamo i secondi per il backend
    };

    const action$ = this.isEdit()
      ? this.eventService.update(this.eventId()!, payload)
      : this.eventService.create(payload);

    action$.subscribe({
      next: () => {
        const msg = this.isEdit() ? 'Scaletta aggiornata con successo! ✏️' : 'Nuovo evento in locandina! 🎵';
        this.notifySuccess(msg);
        
        // Piccolo delay per far leggere il toast prima di navigare
        setTimeout(() => this.router.navigate(['/events']), 1500);
      }
      // Errori gestiti dal GlobalErrorInterceptor
    });
  }

  // --- Helpers per il Template ---
  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && control.touched;
  }

  getErrorMessage(field: string): string {
    const control = this.form.get(field);
    if (control?.hasError('required'))  return 'Campo obbligatorio';
    if (control?.hasError('minlength')) return `Minimo ${control.errors?.['minlength'].requiredLength} caratteri`;
    if (control?.hasError('min'))       return 'Il valore deve essere maggiore di 0';
    return '';
  }
}