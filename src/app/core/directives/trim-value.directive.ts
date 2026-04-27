import { Directive, HostListener, Self, ElementRef, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[trimValue], textarea[trimValue]',
  standalone: true
})
export class TrimValueDirective {
  
  constructor(
    // Aggiungiamo @Optional() così non crasha se il controllo manca
    @Optional() @Self() private ngControl: NgControl,
    private el: ElementRef<HTMLInputElement | HTMLTextAreaElement>
  ) {}

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const element = this.el.nativeElement;
    const value = element.value;

    if (typeof value === 'string') {
      const trimmedStart = value.replace(/^\s+/, '');

      if (value !== trimmedStart) {
        const selectionStart = element.selectionStart;
        const selectionEnd = element.selectionEnd;

        // Puliamo la vista (HTML)
        element.value = trimmedStart;

        // Puliamo il modello (Angular) SOLO se esiste il controllo
        if (this.ngControl && this.ngControl.control) {
          this.ngControl.control.setValue(trimmedStart, { 
            emitEvent: false, 
            emitModelToViewChange: false 
          });
        }

        const offset = value.length - trimmedStart.length;
        element.setSelectionRange((selectionStart || 0) - offset, (selectionEnd || 0) - offset);
      }
    }
  }

  @HostListener('blur')
  onBlur() {
    const element = this.el.nativeElement;
    const value = element.value;

    if (typeof value === 'string') {
      const trimmedAll = value.trim();
      
      if (value !== trimmedAll) {
        element.value = trimmedAll;
        // Aggiorniamo il modello SOLO se esiste
        if (this.ngControl && this.ngControl.control) {
          this.ngControl.control.setValue(trimmedAll);
        }
      }
    }
  }
}