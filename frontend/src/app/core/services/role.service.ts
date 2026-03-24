import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { normalizePagedResponse, PagedResponse, QueryParameters } from '../models/paging.model';
import { RoleListItem, RolePayload } from '../models/role.model';
import { mapAuditDates } from '../utils/audit-dates';
import { ApiService } from './api.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly api = inject(ApiService);
  private readonly notifications = inject(NotificationService);
  private static readonly path = '/roles';

  getPaged(params?: Partial<QueryParameters>): Observable<PagedResponse<RoleListItem>> {
    const query: Record<string, string | number> = {
      pageNumber: params?.pageNumber ?? 1,
      pageSize: params?.pageSize ?? 10,
    };
    const filterId = params?.filterId;
    if (filterId != null && filterId > 0) {
      query['filterId'] = filterId;
    }
    const filterName = params?.filterName?.trim();
    if (filterName) {
      query['filterName'] = filterName;
    }
    return this.api.get<unknown>(RoleService.path, query).pipe(
      map((raw) => {
        const paged = normalizePagedResponse<RoleListItem>(raw, {
          pageNumber: query['pageNumber'] as number,
          pageSize: query['pageSize'] as number,
        });
        return {
          ...paged,
          items: paged.items.map((row) => mapAuditDates(row)),
        };
      }),
    );
  }

  getAllForDropdown(): Observable<RoleListItem[]> {
    return this.api
      .get<RoleListItem[]>(`${RoleService.path}/for-dropdown`)
      .pipe(map((rows) => rows.map((row) => mapAuditDates(row))));
  }

  getById(id: number): Observable<RoleListItem> {
    return this.api
      .get<RoleListItem>(`${RoleService.path}/${String(id)}`)
      .pipe(map((row) => mapAuditDates(row)));
  }

  create(payload: RolePayload): Observable<RoleListItem> {
    return this.api.post<RoleListItem>(RoleService.path, payload).pipe(
      map((row) => mapAuditDates(row)),
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
