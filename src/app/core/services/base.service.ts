import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export abstract class BaseService {
  protected http = inject(HttpClient);
  protected abstract readonly endpoint: string;

  protected get baseApiUrl(): string {
    const baseUrl = environment.apiUrl;
    return this.endpoint ? `${baseUrl}/${this.endpoint}` : baseUrl;
  }

  private buildUrl(path: string): string {
    if (!path) return this.baseApiUrl;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${this.baseApiUrl}/${cleanPath}`;
  }

  /**
   * Logica centrale di spacchettamento. 
   * Se il backend dovesse mandare success: false con uno status 200, 
   * qui lo intercettiamo e lanciamo un errore che l'interceptor catturerà.
   */
  private unpack<T>(res: ApiResponse<T>): T {
    if (!res.success) {
      throw new Error(res.message || 'Errore nella risposta del server');
    }
    return res.data;
  }

  protected doGet<T>(path = '', params?: any): Observable<T> {
    return this.http.get<ApiResponse<T>>(this.buildUrl(path), { params }).pipe(
      map(res => this.unpack(res))
    );
  }

  protected doPost<T>(path = '', body: any): Observable<T> {
    return this.http.post<ApiResponse<T>>(this.buildUrl(path), body).pipe(
      map(res => this.unpack(res))
    );
  }

  protected doPut<T>(path = '', body: any): Observable<T> {
    return this.http.put<ApiResponse<T>>(this.buildUrl(path), body).pipe(
      map(res => this.unpack(res))
    );
  }

  protected doDelete<T>(path = ''): Observable<T> {
    return this.http.delete<ApiResponse<T>>(this.buildUrl(path)).pipe(
      map(res => this.unpack(res))
    );
  }
}