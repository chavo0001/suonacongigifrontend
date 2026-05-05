import { Injectable } from '@angular/core';
import { forkJoin, Observable, map, switchMap, of } from 'rxjs';
import { BaseService } from './base.service';
import { EventResponse } from '../models/event.model';
import { UserProfile } from '../models/user.model'; // Usiamo il tuo modello ufficiale

export interface Stats {
  totalUsers:     number;
  totalEvents:    number;
  totalThreads:   number;
  upcomingEvents: EventResponse[];
  recentUsers:    UserProfile[]; // Qui usiamo UserProfile
}

@Injectable({ providedIn: 'root' })
export class DashboardService extends BaseService {
  
  protected override readonly endpoint = '';

  getDashboardStats(): Observable<Stats> {
    return forkJoin({
      events:     this.doGet<EventResponse[]>('events'),
      users:      this.doGet<UserProfile[]>('users'),
      categories: this.doGet<any[]>('forum/categories')
    }).pipe(
      switchMap(({ events, users, categories }) => {
        if (!categories || categories.length === 0) {
          return of({ events, users, totalThreads: 0 });
        }

        // Chiamate parallele per contare i thread di ogni categoria
        const threadRequests = categories.map(cat => 
          this.doGet<any[]>(`forum/categories/${cat.id}/threads`)
        );

        return forkJoin(threadRequests).pipe(
          map(allThreadsArrays => {
            const totalThreads = allThreadsArrays.reduce((acc, curr) => acc + (curr?.length || 0), 0);
            return { events, users, totalThreads };
          })
        );
      }),
      map(({ events, users, totalThreads }) => ({
        totalUsers:     users.length,
        totalEvents:    events.length,
        totalThreads:   totalThreads,
        upcomingEvents: events.slice(0, 5),
        recentUsers:    users.slice(0, 6)
      }))
    );
  }
}