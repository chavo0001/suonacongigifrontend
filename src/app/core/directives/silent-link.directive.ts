import { Directive, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Directive({
  selector: '[routerLink]', // Intercetta tutti i routerLink
  standalone: true
})
export class SilentLinkDirective implements OnInit {
  // Iniettiamo l'istanza di RouterLink presente sull'elemento
  private rl = inject(RouterLink, { self: true });

  ngOnInit() {
    // Forziamo la proprietà skipLocationChange a true
    this.rl.skipLocationChange = true;
  }
}