import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { map, startWith } from 'rxjs/operators'; 
import { ForumService } from '../../../core/services/forum.service';
import { PostResponse, ThreadDetail } from '../../../core/models/forum.model';
import { BaseComponent } from '../../../shared/base.component';
import { TrimValueDirective } from '../../../core/directives/trim-value.directive';

@Component({
  selector: 'app-thread-detail',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, DatePipe, UpperCasePipe, TrimValueDirective],
  templateUrl: './thread-detail.component.html',
  styleUrls: ['./thread-detail.component.css']
})
export class ThreadDetailComponent extends BaseComponent implements OnInit {
  private forumService = inject(ForumService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  readonly MAX_POST_LENGTH         = 2000;
  readonly MAX_POST_WARNING_LENGTH = 0.9 * this.MAX_POST_LENGTH;

  // Stato locale del thread
  thread = signal<ThreadDetail | null>(null);

  isSubmitDisabled = computed(() => {
    const isTooLong = this.charCount() > this.MAX_POST_LENGTH;
    const isInvalid = this.replyForm.invalid; // Nota: se il form non è un signal, questo rompe la reattività "pura"
    const isLoading = this.loading.isLoading();
    
    return isLoading || isInvalid || isTooLong;
  });

  replyForm = this.fb.nonNullable.group({
    content: ['', [Validators.required, Validators.maxLength(this.MAX_POST_LENGTH)]],
  });

  
  // Signal per il conteggio caratteri
  charCount = toSignal(
    this.replyForm.get('content')!.valueChanges.pipe(
      map(val => val?.length ?? 0),
      startWith(0)
    ),
    { initialValue: 0 }
  );

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadThread(id);
  }

  loadThread(id: number): void {
    // La barra laser si attiva automaticamente tramite LoadingService
    this.forumService.getThreadDetail(id).subscribe({
      next: data => this.thread.set(data)
    });
  }

  submitReply(): void {
    const currentThread = this.thread();
    if (this.replyForm.invalid || !currentThread) {
      this.replyForm.markAllAsTouched();
      return;
    }

    // Usiamo loading.isLoading() della base per bloccare il tasto
    this.forumService.addPost(currentThread.id, this.replyForm.getRawValue()).subscribe({
      next: post => {
        // Update reattivo del thread (evitiamo ricaricamenti pesanti)
        this.thread.update(t => t ? { ...t, posts: [...t.posts, post] } : null);
        
        this.notifySuccess("Risposta pubblicata! 🎤");
        this.replyForm.reset();
        
        // Scroll verso il nuovo post
        setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
      }
    });
  }

  deletePost(post: PostResponse): void {
    if (!confirm('Vuoi davvero eliminare questo post?')) return;
    
    this.forumService.deletePost(post.id).subscribe({
      next: () => {
        this.notifySuccess("Post rimosso correttamente.");
        this.thread.update(t => t ? {
          ...t,
          posts: t.posts.filter(p => p.id !== post.id)
        } : null);
      }
    });
  }

  isInvalid(field: string): boolean {
    const control = this.replyForm.get(field);
    return !!control && control.invalid && control.touched;
  }

}