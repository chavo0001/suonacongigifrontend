import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../../shared/base.component';

@Component({
  selector: 'app-email-verify',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email.component.html'
})
export class EmailComponent extends BaseComponent implements OnInit {

  message = signal<string>('Verifying your email...');
  success = signal<boolean>(false);

  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.auth.logout();
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.message.set('Invalid verification link.');
      this.success.set(false);
      return;
    }

    this.auth.verifyEmail(token).subscribe({
      next: (res) => {
        this.success.set(true);
        this.message.set(res ?? 'Email verified successfully');

        this.notifySuccess('Email verified successfully');

        // optional: redirect after success
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },

      error: () => {
        this.success.set(false);
        this.message.set('Verification failed or expired link.');
      },

    });
  }
}