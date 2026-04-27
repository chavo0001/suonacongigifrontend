import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, SlicePipe } from '@angular/common';
import { finalize } from 'rxjs'; // Cruciale per spegnere i caricamenti
import { EventService } from '../../../core/services/event.service';
import { EventResponse } from '../../../core/models/event.model';
import { BaseComponent } from '../../../shared/base.component';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [RouterLink, DatePipe, SlicePipe],
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.css']
})
export class EventsListComponent extends BaseComponent implements OnInit {
  private eventService = inject(EventService);

  // Stato reattivo: la lista degli eventi
  events = signal<EventResponse[]>([]);
  
  // Feedback granulare sui singoli bottoni (evita che cliccando uno si blocchino tutti)
  actionLoading = signal<Record<number, boolean>>({});

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    // La barra laser globale si attiva via Interceptor
    this.eventService.getAll().subscribe({
      next: data => this.events.set(data ?? [])
    });
  }

  /**
   * Gestisce l'iscrizione o la disiscrizione.
   * La logica è centralizzata per ridurre la duplicazione.
   */
  toggleRegistration(event: EventResponse): void {
    const isRegistering = !event.registeredByCurrentUser;
    
    // Accendiamo il caricamento specifico per questo ID
    this.setLocalLoading(event.id, true);

    const request$ = isRegistering 
      ? this.eventService.register(event.id) 
      : this.eventService.unregister(event.id);

    request$.pipe(
      finalize(() => this.setLocalLoading(event.id, false))
    ).subscribe({
      next: () => {
        const message = isRegistering 
          ? `Preso! Ti aspettiamo sotto il palco per: ${event.title} 🎸` 
          : `Iscrizione rimossa per: ${event.title}. Speriamo di rivederti!`;
        
        this.notifySuccess(message);
        this.loadEvents(); // Ricarica per aggiornare i posti disponibili
      }
    });
  }

  deleteEvent(event: EventResponse): void {
    // Usiamo una conferma un po' più "Gigi style"
    const confirmDelete = confirm(`⚠️ ATTENZIONE: Vuoi davvero cancellare l'evento "${event.title}"? Questa azione è definitiva.`);
    
    if (confirmDelete) {
      this.eventService.delete(event.id).subscribe({
        next: () => {
          this.notifySuccess("Evento rimosso dalla scaletta ufficiale.");
          this.loadEvents();
        }
      });
    }
  }

  // Helper privato per gestire il record dei loading
  private setLocalLoading(id: number, state: boolean) {
    this.actionLoading.update(prev => ({ ...prev, [id]: state }));
  }
}