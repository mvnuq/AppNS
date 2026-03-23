import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { User, UserCreatePayload } from '../models/user.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);
  private static readonly path = '/users';

  getAll(): Observable<User[]> {
    return this.api.get<User[]>(UserService.path);
  }

  getById(id: number): Observable<User> {
    return this.api.get<User>(`${UserService.path}/${String(id)}`);
  }

  create(payload: UserCreatePayload): Observable<User> {
    return this.api.post<User>(UserService.path, payload);
  }

  update(id: number, payload: UserCreatePayload): Observable<void> {
    return this.api.put<void>(`${UserService.path}/${String(id)}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete(`${UserService.path}/${String(id)}`);
  }
}
