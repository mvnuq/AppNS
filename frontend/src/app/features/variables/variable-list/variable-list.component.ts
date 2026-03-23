import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { catchError, Observable, of, Subject, switchMap } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { Variable } from '../../../core/models/variable.model';
import { VariableService } from '../../../core/services/variable.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-variable-list',
  standalone: true,
  imports: [
    AsyncPipe,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    RouterLink,
  ],
  templateUrl: './variable-list.component.html',
  styleUrl: './variable-list.component.scss',
})
export class VariableListComponent {
  private readonly variableService = inject(VariableService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly refresh$ = new Subject<void>();

  readonly displayedColumns: readonly string[] = ['id', 'name', 'value', 'type', 'actions'];

  readonly variables$: Observable<Variable[]> = this.refresh$.pipe(
    startWith(undefined),
    switchMap(() =>
      this.variableService.getAll().pipe(
        catchError(() => of([] as Variable[])),
      ),
    ),
  );

  trackByVariableId(_index: number, row: Variable): number {
    return row.id;
  }

  edit(variable: Variable): void {
    void this.router.navigate(['/variables', variable.id, 'edit']);
  }

  confirmDelete(variable: Variable): void {
    const data: ConfirmDialogData = {
      title: 'Eliminar variable',
      message: `¿Eliminar ${variable.name}? Esta acción no se puede deshacer.`,
    };
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data,
    });
    ref.afterClosed().subscribe((confirmed: boolean | undefined) => {
      if (confirmed === true) {
        this.variableService.delete(variable.id).subscribe({
          next: () => this.refresh$.next(),
        });
      }
    });
  }
}
