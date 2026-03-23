import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RoleListItem, RolePayload } from '../models/role.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly api = inject(ApiService);
  private static readonly path = '/roles';

  getAllForDropdown(): Observable<RoleListItem[]> {
    return this.api.get<RoleListItem[]>(RoleService.path);
  }

  getById(id: number): Observable<RoleListItem> {
    return this.api.get<RoleListItem>(`${RoleService.path}/${String(id)}`);
  }

  create(payload: RolePayload): Observable<RoleListItem> {
    return this.api.post<RoleListItem>(RoleService.path, payload);
  }

  update(id: number, payload: RolePayload): Observable<void> {
    return this.api.put<void>(`${RoleService.path}/${String(id)}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete(`${RoleService.path}/${String(id)}`);
  }
}
