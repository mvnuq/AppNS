import { computed, signal, type ResourceRef, type WritableSignal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageEvent } from '@angular/material/paginator';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  DEFAULT_PAGED_QUERY,
  emptyPagedViewModel,
  IdNameFilters,
  mapPagedToViewModel,
  PagedListViewModel,
  PagedResponse,
  QueryParameters,
} from '../models/paging.model';

/**
 * Clave interna para `rxResource`: al cambiar `queryParams` o `refreshTick` se dispara
 * de nuevo el loader (equivalente a useEffect con dependencias [params, refresh]).
 */
type PagedRequestKey = QueryParameters & { readonly _refresh: number };

export interface PagedListController<T> {
  /** Estado de la petición y datos (value, isLoading, reload). */
  readonly list: ResourceRef<PagedListViewModel<T>>;
  /** Parámetros actuales de consulta (lectura para tests / depuración). */
  readonly queryParams: WritableSignal<QueryParameters>;
  /** Filtros ID + nombre: reinicia a página 1 y vuelve a pedir datos. */
  applyFilters(filters: IdNameFilters): void;
  /** Cambio de página / tamaño desde mat-paginator. */
  applyPage(event: PageEvent): void;
  /** Misma consulta: nueva petición (tras crear/editar/borrar). */
  refresh(): void;
}

/**
 * Fábrica (SRP): encapsula la reactividad tipo useEffect — `request` depende de señales;
 * cuando cambian, `rxResource` vuelve a ejecutar el loader (Observable HTTP).
 */
export function createPagedListResource<T>(
  fetchPage: (params: QueryParameters) => Observable<PagedResponse<T>>,
  initial: QueryParameters = DEFAULT_PAGED_QUERY,
): PagedListController<T> {
  const queryParams = signal<QueryParameters>({ ...initial });
  const refreshTick = signal(0);

  const requestKey = computed<PagedRequestKey>(() => ({
    ...queryParams(),
    _refresh: refreshTick(),
  }));

  const list = rxResource({
    request: () => requestKey(),
    loader: ({ request }) => {
      const params = toQueryParameters(request);
      return fetchPage(params).pipe(
        map((r) => mapPagedToViewModel(r, params)),
        catchError(() => of(emptyPagedViewModel<T>(params.pageSize))),
      );
    },
    defaultValue: emptyPagedViewModel<T>(initial.pageSize),
  });

  return {
    list,
    queryParams,
    applyFilters(filters: IdNameFilters): void {
      queryParams.update((q) => ({
        ...q,
        pageNumber: 1,
        filterId: filters.filterId,
        filterName: filters.filterName,
      }));
    },
    applyPage(event: PageEvent): void {
      const pageNumber = event.pageIndex + 1;
      const pageSize = event.pageSize;
      queryParams.update((q) => {
        if (q.pageNumber === pageNumber && q.pageSize === pageSize) {
          return q;
        }
        return { ...q, pageNumber, pageSize };
      });
    },
    refresh(): void {
      refreshTick.update((n) => n + 1);
    },
  };
}

function toQueryParameters(key: PagedRequestKey): QueryParameters {
  const { _refresh: _r, ...params } = key;
  return params;
}
