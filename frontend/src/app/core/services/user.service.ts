import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User, UserCreatePayload } from '../models/user.model';
import { ApiService } from './api.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);
  private readonly notifications = inject(NotificationService);
  private static readonly path = '/users';

  getAll(): Observable<User[]> {
    return this.api.get<User[]>(UserService.path);
  }

  getById(id: number): Observable<User> {
    return this.api.get<User>(`${UserService.path}/${String(id)}`);
  }

  create(payload: UserCreatePayload): Observable<User> {
    return this.api.post<User>(UserService.path, payload).pipe(
      tap(() => this.notifications.success('Usuario creado correctamente.')),
    );
  }

  update(id: number, payload: UserCreatePayload): Observable<void> {
    return this.api.put<void>(`${UserService.path}/${String(id)}`, payload).pipe(
      tap(() => this.notifications.success('Usuario actualizado correctamente.')),
    );
  }

  delete(id: number): Observable<void> {
    return this.api.delete(`${UserService.path}/${String(id)}`).pipe(
      tap(() => this.notifications.success('Usuario eliminado.')),
    );
  }
}
