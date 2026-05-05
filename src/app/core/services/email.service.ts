import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MailTemplate } from '../models/email.model';
import { BaseService } from './base.service';


@Injectable({providedIn: 'root'})
export class MailTemplateService extends BaseService{

protected override readonly endpoint = 'email';
private readonly DEFAULT_ID = 'verification';
  // Nota: il costruttore è sparito! Il BaseService usa inject(HttpClient) 
  // quindi non serve più passarlo manualmente qui.

  get(): Observable<MailTemplate> {
    return this.doGet<MailTemplate>(this.DEFAULT_ID);
  }

  save(template: MailTemplate): Observable<MailTemplate> {
    return this.doPut<MailTemplate>(this.DEFAULT_ID, template);
  }
}