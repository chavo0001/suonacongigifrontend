import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorModule } from '@hugerte/hugerte-angular';
import { MailTemplate } from 'src/app/core/models/email.model';
import { MailTemplateService } from 'src/app/core/services/email.service';


@Component({
  selector: 'app-admin-email',
  standalone: true,
  imports: [CommonModule, FormsModule, EditorModule],
  templateUrl: './admin-email.component.html',
})
export class AdminEmailComponent {
  
  private mailService = inject(MailTemplateService);

  template = signal<MailTemplate | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    this.mailService.get().subscribe({
      next: (res) => {
        this.template.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading template', err);
        this.loading.set(false);
      }
    });
  }

  save() {
    const t = this.template();

    if (!t) {
      console.warn('Template not loaded yet');
      return;
    }


    console.log('Saving template:', t);

    this.mailService.save(t).subscribe({
      next: (res) => {
        console.log('Saved successfully', res);

        // optional: update signal with response from backend
        this.template.set(res);
      },
      error: (err) => {
        console.error('Error saving template', err);
      }
    });    
  }

  editorConfig = {
  height: 400,
  menubar: true,
  plugins: 'link image table code',
  toolbar:
    'undo redo | bold italic underline | alignleft aligncenter alignright | code'
};

}