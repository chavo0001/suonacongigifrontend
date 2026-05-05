// Riassunto: Componente dashboard admin che mostra statistiche aggregate e rapide.
import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DashboardService, Stats } from '../../core/services/dashboard.service';
import { UserService } from '../../core/services/user.service';
import { BaseComponent } from '../../shared/base.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent extends BaseComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private userService = inject(UserService);

  stats = signal<Stats | null>(null);

  ngOnInit(): void {
    this.caricaStats();
  }

  caricaStats(): void {
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => this.stats.set(data)
    });
  }

  eliminaUtente(id: number, username: string): void {
    if (!confirm(`Sei sicuro di voler eliminare l'utente "${username}"? L'operazione è irreversibile.`)) return;

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.notifySuccess(`Utente "${username}" eliminato con successo`);
        this.caricaStats(); // ricarica la tabella
      }
    });
  }
}