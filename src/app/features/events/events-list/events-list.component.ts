import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, SlicePipe } from '@angular/common';
import { catchError, finalize, forkJoin, map, of } from 'rxjs';
import { EventService } from '../../../core/services/event.service';
import { EventLikeResponse, EventResponse } from '../../../core/models/event.model';
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
  searchTerm = signal('');
  
  // Feedback granulare sui singoli bottoni (evita che cliccando uno si blocchino tutti)
  actionLoading = signal<Record<number, boolean>>({});
  likeLoading = signal<Record<number, boolean>>({});

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    // La barra laser globale si attiva via Interceptor
    this.eventService.getAll(this.searchTerm().trim()).subscribe({
      next: data => {
        const loadedEvents = data ?? [];
        this.events.set(loadedEvents);
        this.loadLikes(loadedEvents);
      }
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.loadEvents();
  }

  private loadLikes(events: EventResponse[]): void {
    if (!events.length) {
      return;
    }

    const requests = events.map(event =>
      this.eventService.getLikes(event.id).pipe(
        catchError(() => of<EventLikeResponse>({
          eventId: event.id,
          likeCount: event.likeCount ?? 0,
          likedByCurrentUser: event.likedByCurrentUser ?? false
        }))
      )
    );

    forkJoin(requests).pipe(
      map(likes => new Map(likes.map(like => [like.eventId, like])))
    ).subscribe({
      next: likesByEventId => {
        this.events.update(currentEvents => currentEvents.map(event => {
          const like = likesByEventId.get(event.id);
          return like ? { ...event, ...like } : event;
        }));
      }
    });
  }

  toggleLike(event: EventResponse): void {
    const isLiking = !event.likedByCurrentUser;
    this.setLikeLoading(event.id, true);

    const request$ = isLiking
      ? this.eventService.like(event.id)
      : this.eventService.unlike(event.id);

    request$.pipe(
      finalize(() => this.setLikeLoading(event.id, false))
    ).subscribe({
      next: like => this.applyLike(like)
    });
  }

  private applyLike(like: EventLikeResponse): void {
    this.events.update(currentEvents => currentEvents.map(event =>
      event.id === like.eventId ? { ...event, ...like } : event
    ));
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
  approveEvent(id: number): void {
    this.eventService.updateStatus(id, 'APPROVED').subscribe({
      next: () => {
        this.notifySuccess('Evento approvato!');
        this.loadEvents();
      }
    });
  }

  rejectEvent(id: number): void {
    this.eventService.updateStatus(id, 'REFUSED').subscribe({
      next: () => {
        this.notifySuccess('Evento rifiutato.');
        this.loadEvents();
      }
    });
  }

  // Helper privato per gestire il record dei loading
  private setLocalLoading(id: number, state: boolean) {
    this.actionLoading.update(prev => ({ ...prev, [id]: state }));
  }

  private setLikeLoading(id: number, state: boolean) {
    this.likeLoading.update(prev => ({ ...prev, [id]: state }));
  }
}
