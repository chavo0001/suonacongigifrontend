import { Component, inject, OnInit, signal, input, computed } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms'; 
import { forkJoin } from 'rxjs';
import { ProfileService } from '../../core/services/profile.service';
import { Genre, Instrument, Artist } from '../../core/models/user.model';
import { BaseComponent } from '../../shared/base.component';
import { TrimValueDirective } from "../../core/directives/trim-value.directive"; // Importa la base

@Component({
  selector: 'app-musical-profile-form',
  standalone: true,
  imports: [ReactiveFormsModule, TrimValueDirective],
  templateUrl: './musical-profile-form.component.html',
  styleUrls: ['./musical-profile-form.component.css']
})
export class MusicalProfileFormComponent extends BaseComponent implements OnInit {
  private profileService = inject(ProfileService);

  // Input del form parent
  formGroup = input.required<FormGroup>();

  // Dati dal server (Specifici del componente)
  allGenres = signal<Genre[]>([]);
  allInstruments = signal<Instrument[]>([]);
  allArtists = signal<Artist[]>([]);
  
  artistSearchQuery = signal('');

  // Costanti per la logica della bio
  readonly MAX_BIO_LENGTH         = 1000;
  readonly MAX_BIO_WARNING_LENGTH = 0.9 * this.MAX_BIO_LENGTH;

  // PERFORMANCE: Filtro computato
  filteredArtists = computed(() => {
    const query = this.artistSearchQuery().toLowerCase().trim();
    if (query.length < 2) return [];
    return this.allArtists()
      .filter(a => a.name.toLowerCase().includes(query))
      .slice(0, 10);
  });

  ngOnInit() { 
    forkJoin({
      g: this.profileService.getGenres(),
      i: this.profileService.getInstruments(),
      a: this.profileService.getArtists()
    }).subscribe({
      next: ({ g, i, a }) => {
        this.allGenres.set(g);
        this.allInstruments.set(i);
        this.allArtists.set(a);
      } 
    });
  }

  // --- LOGICA BIO ---
  get bioControl() {
    return this.formGroup().get('bio');
  }

  // Funzione di utilità per calcolare la percentuale (opzionale ma utile)
  get bioLength(): number {
    return this.formGroup().get('bio')?.value?.length || 0;
  }
  
  // --- LOGICA ARTISTI ---
  onSearchArtist(event: Event) {
    const input = event.target as HTMLInputElement;
    this.artistSearchQuery.set(input.value);
  }

  addArtist(artist: Artist) {
    const control = this.formGroup().get('favoriteArtists')!;
    const current = [...(control.value || [])];
    if (!current.some(a => a.id === artist.id)) {
      control.setValue([...current, artist]);
      control.markAsTouched();
    }
    this.artistSearchQuery.set('');
  }

  removeArtist(id: number) {
    const control = this.formGroup().get('favoriteArtists')!;
    const current = (control.value || []).filter((a: any) => a.id !== id);
    control.setValue(current);
  }

  // --- LOGICA GENERI/STRUMENTI ---
  onToggleItem(collectionName: string, item: any) {
    const control = this.formGroup().get(collectionName);
    if (!control) return;

    const currentValues = Array.isArray(control.value) ? [...control.value] : [];
    const index = currentValues.findIndex(v => v.id === item.id);

    if (index > -1) {
      currentValues.splice(index, 1);
    } else {
      currentValues.push(item);
    }

    control.setValue(currentValues);
    control.markAsDirty();
    control.markAsTouched();
    control.updateValueAndValidity();
  }

  isSelected(collectionName: string, id: number): boolean {
    const control = this.formGroup().get(collectionName);
    return (control?.value || []).some((v: any) => v.id === id);
  }
}