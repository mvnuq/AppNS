import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RoleListItem, RolePayload } from '../models/role.model';
import { ApiService } from './api.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly api = inject(ApiService);
  private readonly notifications = inject(NotificationService);
  private static readonly path = '/roles';

  getAllForDropdown(): Observable<RoleListItem[]> {
    return this.api.get<RoleListItem[]>(RoleService.path);
  }

  getById(id: number): Observable<RoleListItem> {
    return this.api.get<RoleListItem>(`${RoleService.path}/${String(id)}`);
  }

  create(payload: RolePayload): Observable<RoleListItem> {
    return this.api.post<RoleListItem>(RoleService.path, payload).pipe(
      tap(() => this.notifications.success('Rol creado correctamente.')),
    );
  }

  update(id: number, payload: RolePayload): Observable<void> {
    return this.api.put<void>(`${RoleService.path}/${String(id)}`, payload).pipe(
      tap(() => this.notifications.success('Rol actualizado correctamente.')),
    );
  }

  delete(id: number): Observable<void> {
    return this.api.delete(`${RoleService.path}/${String(id)}`).pipe(
      tap(() => this.notifications.success('Rol eliminado.')),
    );
  }
}
