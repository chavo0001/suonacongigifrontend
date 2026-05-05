import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseService } from './base.service';
import { Genre, Instrument, Artist } from '../models/user.model';
import { PageableResponse } from '../models/pageable.model';

@Injectable({ providedIn: 'root' })
export class ProfileService extends BaseService {
  protected override readonly endpoint = ''; 

  getGenres(): Observable<Genre[]> { 
    return this.doGet<Genre[]>('genres'); 
  }

  getInstruments(): Observable<Instrument[]> { 
    return this.doGet<Instrument[]>('instruments'); 
  }

  getArtists(): Observable<Artist[]> {
    const params = { page: 0, size: 100, sort: 'name,ASC' };
    return this.doGet<PageableResponse<Artist>>('artists', params).pipe(
      map(page => page.content) // Secondo spacchettamento: PageableResponse -> Artist[]
    );
  }
}