import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { normalizePagedResponse, PagedResponse, QueryParameters } from '../models/paging.model';
import { Variable, VariablePayload } from '../models/variable.model';
import { ApiService } from './api.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class VariableService {
  private readonly api = inject(ApiService);
  private readonly notifications = inject(NotificationService);
  private static readonly path = '/variables';

  getPaged(params?: Partial<QueryParameters>): Observable<PagedResponse<Variable>> {
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
    return this.api.get<unknown>(VariableService.path, query).pipe(
      map((raw) =>
        normalizePagedResponse<Variable>(raw, {
          pageNumber: query['pageNumber'] as number,
          pageSize: query['pageSize'] as number,
        }),
      ),
    );
  }

  getAll(): Observable<Variable[]> {
    return this.getPaged().pipe(map((r) => r.items));
  }

  getById(id: number): Observable<Variable> {
    return this.api.get<Variable>(`${VariableService.path}/${String(id)}`);
  }

  create(payload: VariablePayload): Observable<Variable> {
    return this.api.post<Variable>(VariableService.path, payload).pipe(
      tap(() => this.notifications.success('Variable creada correctamente.')),
    );
  }

  update(id: number, payload: VariablePayload): Observable<void> {
    return this.api.put<void>(`${VariableService.path}/${String(id)}`, payload).pipe(
      tap(() => this.notifications.success('Variable actualizada correctamente.')),
    );
  }

  delete(id: number): Observable<void> {
    return this.api.delete(`${VariableService.path}/${String(id)}`).pipe(
      tap(() => this.notifications.success('Variable eliminada.')),
    );
  }
}
