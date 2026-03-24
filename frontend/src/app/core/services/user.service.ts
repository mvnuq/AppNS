import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { normalizePagedResponse, PagedResponse, QueryParameters } from '../models/paging.model';
import { User, UserCreatePayload } from '../models/user.model';
import { ApiService } from './api.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);
  private readonly notifications = inject(NotificationService);
  private static readonly path = '/users';

  getPaged(params?: Partial<QueryParameters>): Observable<PagedResponse<User>> {
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
    return this.api.get<unknown>(UserService.path, query).pipe(
      map((raw) =>
        normalizePagedResponse<User>(raw, {
          pageNumber: query['pageNumber'] as number,
          pageSize: query['pageSize'] as number,
        }),
      ),
    );
  }

  getAll(): Observable<User[]> {
    return this.getPaged().pipe(map((r) => r.items));
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
