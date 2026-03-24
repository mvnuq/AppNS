import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DEFAULT_PAGED_QUERY, IdNameFilters } from '../../../core/models/paging.model';
import { Variable } from '../../../core/models/variable.model';
import { createPagedListResource } from '../../../core/paged-list/create-paged-list-resource';
import { VariableService } from '../../../core/services/variable.service';
import { listFadeIn, rowAnimation } from '../../../shared/animations/list.animations';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MaintainerTableComponent } from '../../../shared/components/maintainer-table/maintainer-table.component';
import { openMetadataDialog } from '../../../shared/components/metadata-dialog/open-metadata-dialog';
import {
  VariableFormComponent,
  VariableFormDialogData,
} from '../variable-form/variable-form.component';

@Component({
  selector: 'app-variable-list',
  standalone: true,
  imports: [
    MaintainerTableComponent,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './variable-list.component.html',
  styleUrl: './variable-list.component.scss',
  animations: [listFadeIn, rowAnimation],
})
export class VariableListComponent {
  private readonly variableService = inject(VariableService);
  private readonly dialog = inject(MatDialog);

  readonly paged = createPagedListResource<Variable>(
    (params) => this.variableService.getPaged(params),
    DEFAULT_PAGED_QUERY,
  );

  private static readonly formDialogConfig = {
    width: '480px',
    maxWidth: '95vw',
    disableClose: true,
    panelClass: 'neosoft-dialog',
  } as const;

  readonly displayedColumns: readonly string[] = ['id', 'name', 'value', 'type', 'actions'];

  trackByVariableId(_index: number, row: Variable): number {
    return row.id;
  }

  onFiltersChange(filters: IdNameFilters): void {
    this.paged.applyFilters(filters);
  }

  onPage(event: PageEvent): void {
    this.paged.applyPage(event);
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
          this.paged.refresh();
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
          this.paged.refresh();
        }
      });
  }

  viewMetadata(variable: Variable): void {
    openMetadataDialog(this.dialog, {
      createdAt: variable.createdAt,
      updatedAt: variable.updatedAt,
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
          next: () => this.paged.refresh(),
        });
      }
    });
  }
}
