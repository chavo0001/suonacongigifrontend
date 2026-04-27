import { Component, inject, OnInit, signal } from '@angular/core'; 
import { DatePipe } from '@angular/common';
import { DashboardService, Stats } from '../../core/services/dashboard.service';
import { BaseComponent } from '../../shared/base.component'; // Import della base

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent extends BaseComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  // Teniamo solo il segnale dei dati
  stats = signal<Stats | null>(null);

  ngOnInit(): void {
    // La chiamata HTTP attiva automaticamente il LoadingService (barra laser)
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => this.stats.set(data)
      // L'errore non va gestito qui: se il server "stecca", 
      // il GlobalErrorInterceptor lo urla nel toast globale.
    });
  }
}