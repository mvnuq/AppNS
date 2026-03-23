import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, Observable, of, Subject, switchMap } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { Variable } from '../../../core/models/variable.model';
import { VariableService } from '../../../core/services/variable.service';
import { listFadeIn, rowAnimation } from '../../../shared/animations/list.animations';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  VariableFormComponent,
  VariableFormDialogData,
} from '../variable-form/variable-form.component';

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
  ],
  templateUrl: './variable-list.component.html',
  styleUrl: './variable-list.component.scss',
  animations: [listFadeIn, rowAnimation],
})
export class VariableListComponent {
  private readonly variableService = inject(VariableService);
  private readonly dialog = inject(MatDialog);
  private readonly refresh$ = new Subject<void>();

  private static readonly formDialogConfig = {
    width: '480px',
    maxWidth: '95vw',
    disableClose: true,
    panelClass: 'neosoft-dialog',
  } as const;

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

  openCreate(): void {
    const data: VariableFormDialogData = { mode: 'create' };
    this.dialog
      .open(VariableFormComponent, {
        ...VariableListComponent.formDialogConfig,
        data,
      })
      .afterClosed()
      .subscribe((saved: boolean | undefined) => {
        if (saved === true) {
          this.refresh$.next();
        }
      });
  }

  edit(variable: Variable): void {
    const data: VariableFormDialogData = { mode: 'edit', variableId: variable.id };
    this.dialog
      .open(VariableFormComponent, {
        ...VariableListComponent.formDialogConfig,
        data,
      })
      .afterClosed()
      .subscribe((saved: boolean | undefined) => {
        if (saved === true) {
          this.refresh$.next();
        }
      });
  }

  confirmDelete(variable: Variable): void {
    const dialogData: ConfirmDialogData = {
      title: 'Eliminar variable',
      message: `¿Eliminar ${variable.name}? Esta acción no se puede deshacer.`,
    };
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      maxWidth: '95vw',
      panelClass: 'neosoft-dialog',
      data: dialogData,
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
