export interface QueryParameters {
  pageNumber: number;
  pageSize: number;
  /** Filtro por ID (exacto); null o ausente = sin filtro. */
  filterId?: number | null;
  /** Filtro por nombre (parcial); vacío = sin filtro. */
  filterName?: string;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
}

export interface IdNameFilters {
  filterId: number | null;
  filterName: string;
}

/** Vista de tabla para listados paginados (servidor). */
export interface PagedListViewModel<T> {
  readonly items: T[];
  readonly totalCount: number;
  readonly totalPages: number;
  readonly pageIndex: number;
  readonly pageSize: number;
}

export function mapPagedToViewModel<T>(
  response: PagedResponse<T>,
  params: QueryParameters,
): PagedListViewModel<T> {
  return {
    items: response.items,
    totalCount: response.totalCount,
    totalPages: response.totalPages,
    pageIndex: params.pageNumber - 1,
    pageSize: params.pageSize,
  };
}

export function emptyPagedViewModel<T>(pageSize: number): PagedListViewModel<T> {
  return {
    items: [],
    totalCount: 0,
    totalPages: 0,
    pageIndex: 0,
    pageSize,
  };
}

export const DEFAULT_PAGED_QUERY: QueryParameters = {
  pageNumber: 1,
  pageSize: 10,
  filterId: null,
  filterName: '',
};

export type PagedRequestMeta = Pick<QueryParameters, 'pageNumber' | 'pageSize'>;

/**
 * Normaliza la respuesta del API. Prioriza el objeto `{ items, totalCount }` sobre un array en la raíz
 * (un JSON `[...]` se confundía con “toda la lista” y mostraba todos los registros).
 * Si llega un array plano (legado), pagina en cliente con `pageNumber` / `pageSize` solicitados.
 */
export function normalizePagedResponse<T>(raw: unknown, request?: PagedRequestMeta): PagedResponse<T> {
  if (raw !== null && typeof raw === 'object' && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    if ('items' in o || 'Items' in o) {
      const rawItems = o['items'] ?? o['Items'];
      let items = Array.isArray(rawItems) ? (rawItems as T[]) : [];
      const pageSize = request?.pageSize ?? 10;
      if (items.length > pageSize) {
        items = items.slice(0, pageSize);
      }
      const totalCount = Number(o['totalCount'] ?? o['TotalCount'] ?? items.length);
      const totalPages = Number(o['totalPages'] ?? o['TotalPages'] ?? 0);
      return {
        items,
        totalCount: Number.isFinite(totalCount) ? totalCount : 0,
        totalPages: Number.isFinite(totalPages) ? totalPages : 0,
      };
    }
  }

  if (Array.isArray(raw)) {
    const all = raw as T[];
    const pageSize = request?.pageSize ?? 10;
    const pageNumber = request?.pageNumber ?? 1;
    const start = Math.max(0, (pageNumber - 1) * pageSize);
    const items = all.slice(start, start + pageSize);
    return {
      items,
      totalCount: all.length,
      totalPages: pageSize > 0 ? Math.ceil(all.length / pageSize) : 0,
    };
  }

  return { items: [], totalCount: 0, totalPages: 0 };
}
