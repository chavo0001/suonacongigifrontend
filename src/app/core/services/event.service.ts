import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';  
import { EventRequest, EventResponse } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService extends BaseService {
  
  // Specifichiamo l'endpoint di base. Il BaseService farà il resto.
  protected override readonly endpoint = 'events';

  // Nota: il costruttore è sparito! Il BaseService usa inject(HttpClient) 
  // quindi non serve più passarlo manualmente qui.

  getAll(): Observable<EventResponse[]> {
    return this.doGet<EventResponse[]>();
  }

  getById(id: number): Observable<EventResponse> {
    return this.doGet<EventResponse>(`${id}`);
  }

  create(req: EventRequest): Observable<EventResponse> {
    return this.doPost<EventResponse>('', req);
  }

  update(id: number, req: EventRequest): Observable<EventResponse> {
    return this.doPut<EventResponse>(`${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.doDelete<void>(`${id}`);
  }

  register(id: number): Observable<void> {
    return this.doPost<void>(`${id}/register`, {});
  }

  unregister(id: number): Observable<void> {
    return this.doDelete<void>(`${id}/register`);
  }
}