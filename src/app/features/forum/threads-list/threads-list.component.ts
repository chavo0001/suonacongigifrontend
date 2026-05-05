import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { switchMap, tap } from 'rxjs/operators';
import { ForumService } from '../../../core/services/forum.service';
import { CategoryResponse, ThreadSummary } from '../../../core/models/forum.model';
import { BaseComponent } from '../../../shared/base.component';

@Component({
  selector: 'app-threads-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, DatePipe],
  templateUrl: './threads-list.component.html',
  styleUrls: ['./threads-list.component.css']
})
export class ThreadsListComponent extends BaseComponent implements OnInit {
  private forumService = inject(ForumService);
  private fb = inject(FormBuilder);

  // Stato reattivo specifico
  categories = signal<CategoryResponse[]>([]);
  threads = signal<ThreadSummary[]>([]);
  selectedCategoryId = signal<number | null>(null);
  showForm = signal(false);

  threadForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    categoryId: ['', Validators.required],
    content: ['', [Validators.required, Validators.minLength(10)]]
  });

  ngOnInit(): void {
    this.initialLoad();
  }

  /**
   * CARICAMENTO SEQUENZIALE
   * Carica le categorie e, a cascata, i thread della prima categoria.
   */
  initialLoad(): void {
    // La barra laser si attiva via Interceptor
    this.forumService.getCategories().pipe(
      tap(cats => {
        this.categories.set(cats);
        if (cats.length > 0 && !this.selectedCategoryId()) {
          this.selectedCategoryId.set(cats[0].id);
        }
      }),
      switchMap(() => this.forumService.getThreads(this.selectedCategoryId() ?? undefined))
    ).subscribe({
      next: threads => this.threads.set(threads)
      // Errori gestiti globalmente
    });
  }

  loadThreads(): void {
    this.forumService.getThreads(this.selectedCategoryId() ?? undefined).subscribe({
      next: data => this.threads.set(data)
    });
  }

  filterByCategory(id: number | null): void {
    this.selectedCategoryId.set(id);
    this.loadThreads();
  }

  toggleForm(): void {
    this.showForm.update(val => !val);
  }

  createThread(): void {
    if (this.threadForm.invalid) {
      this.ui.showError("Titolo troppo breve o categoria mancante!");
      this.threadForm.markAllAsTouched();
      return;
    }

    const payload = {
      title: this.threadForm.getRawValue().title,
      categoryId: Number(this.threadForm.getRawValue().categoryId),
      content: this.threadForm.getRawValue().content
    };

    this.forumService.createThread(payload).subscribe({
      next: () => {
        this.notifySuccess("Nuova discussione aperta! Chi la dura la vince 🎸");
        this.threadForm.reset();
        this.showForm.set(false);
        this.initialLoad(); // Ricarichiamo per aggiornare contatori e lista
      }
    });
  }

  deleteThread(t: ThreadSummary): void {
    if (!confirm(`Vuoi davvero eliminare "${t.title}"?`)) return;
    
    this.forumService.deleteThread(t.id).subscribe({
      next: () => {
        this.notifySuccess("Discussione rimossa.");
        this.loadThreads();
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.threadForm.get(field);
    return !!control && control.invalid && control.touched;
  }
}