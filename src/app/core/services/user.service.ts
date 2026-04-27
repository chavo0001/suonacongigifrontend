import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import { UserProfile } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService extends BaseService {
  
  protected override readonly endpoint = 'users';

  getMe(): Observable<UserProfile> {
    return this.doGet<UserProfile>('me');
  }

  updateMusicalProfile(data: any): Observable<UserProfile> {
    return this.doPut<UserProfile>('me', data);
  }
}