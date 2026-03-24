import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  Input,
  OnInit,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { merge, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { IdNameFilters } from '../../../core/models/paging.model';

/**
 * Contenedor estándar para tablas de mantenedoras: filtros, scroll horizontal,
 * paginación y mensaje cuando no hay filas.
 */
@Component({
  selector: 'app-maintainer-table',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatPaginatorModule,
  ],
  templateUrl: './maintainer-table.component.html',
  styleUrl: './maintainer-table.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class MaintainerTableComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  /** Dispara el debounce unificado para filtros ID + nombre. */
  private readonly idNameFilterTrigger$ = new Subject<void>();

  readonly searchControl = new FormControl<string>('', { nonNullable: true });
  readonly idFilterControl = new FormControl<string>('', { nonNullable: true });
  readonly nameFilterControl = new FormControl<string>('', { nonNullable: true });

  @Input({ required: true }) empty!: boolean;
  @Input() emptyMessage = '';
  /** Muestra campo(s) de filtro y paginador (listados con servidor). */
  @Input() showToolbar = false;
  /** `global`: un solo campo de texto; `idName`: ID y nombre por separado. */
  @Input() toolbarMode: 'global' | 'idName' = 'global';
  @Input() length = 0;
  @Input() pageIndex = 0;
  @Input() pageSize = 10;
  @Input() pageSizeOptions: readonly number[] = [5, 10, 25, 50];
  @Input() searchPlaceholder = 'Buscar…';
  @Input() searchLabel = 'Búsqueda global';

  readonly searchChange = output<string>();
  readonly filtersChange = output<IdNameFilters>();
  readonly pageChange = output<PageEvent>();

  ngOnInit(): void {
    if (!this.showToolbar) {
      return;
    }
    if (this.toolbarMode === 'idName') {
      merge(this.idFilterControl.valueChanges, this.nameFilterControl.valueChanges)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.idNameFilterTrigger$.next());

      this.idNameFilterTrigger$
        .pipe(debounceTime(500), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.emitIdNameFilters());
    } else {
      this.searchControl.valueChanges
        .pipe(
          debounceTime(500),
          distinctUntilChanged(),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((term) => this.searchChange.emit(term ?? ''));
    }
  }

  private emitIdNameFilters(): void {
    this.filtersChange.emit({
      filterId: this.parseId(this.idFilterControl.value),
      filterName: this.normalizeNameFilter(this.nameFilterControl.value),
    });
  }

  /**
   * `type="number"` puede entregar `number` en tiempo de ejecución; no usar `.trim()` directo.
   */
  private parseId(value: unknown): number | null {
    if (value === null || value === undefined) {
      return null;
    }
    const s = typeof value === 'number' ? String(value) : String(value).trim();
    if (s === '') {
      return null;
    }
    const n = Number(s);
    if (!Number.isFinite(n) || n < 1) {
      return null;
    }
    return Math.floor(n);
  }

  private normalizeNameFilter(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value).trim();
  }
}
