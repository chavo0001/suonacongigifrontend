import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import { 
  CategoryResponse, 
  ThreadSummary, 
  ThreadDetail, 
  ThreadRequest, 
  PostRequest, 
  PostResponse 
} from '../models/forum.model';

@Injectable({ providedIn: 'root' })
export class ForumService extends BaseService {

  // 1. Definiamo l'endpoint principale del modulo forum
  protected override readonly endpoint = 'forum';

  // ── Categorie ──────────────────────────────────────────────
  getCategories(): Observable<CategoryResponse[]> {
    return this.doGet<CategoryResponse[]>('categories');
  }

  // ── Thread ──────────────────────────────────────────────────
  getThreads(categoryId?: number): Observable<ThreadSummary[]> {
    return this.doGet<ThreadSummary[]>(`categories/${categoryId}/threads`);
  }

  getThreadDetail(id: number): Observable<ThreadDetail> {
    return this.doGet<ThreadDetail>(`threads/${id}`);
  }

  createThread(req: ThreadRequest): Observable<ThreadSummary> {
    return this.doPost<ThreadSummary>('threads', req);
  }

  deleteThread(id: number): Observable<void> {
    return this.doDelete<void>(`threads/${id}`);
  }

  // ── Post (Risposte) ─────────────────────────────────────────
  addPost(threadId: number, req: PostRequest): Observable<PostResponse> {
    // Percorso dinamico: forum/threads/{id}/posts
    return this.doPost<PostResponse>(`threads/${threadId}/posts`, req);
  }

  deletePost(id: number): Observable<void> {
    // Percorso: forum/posts/{id}
    return this.doDelete<void>(`posts/${id}`);
  }
}