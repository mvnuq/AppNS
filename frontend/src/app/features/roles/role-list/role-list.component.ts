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
import { RoleListItem } from '../../../core/models/role.model';
import { createPagedListResource } from '../../../core/paged-list/create-paged-list-resource';
import { RoleService } from '../../../core/services/role.service';
import { listFadeIn, rowAnimation } from '../../../shared/animations/list.animations';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MaintainerTableComponent } from '../../../shared/components/maintainer-table/maintainer-table.component';
import { openMetadataDialog } from '../../../shared/components/metadata-dialog/open-metadata-dialog';
import {
  RoleFormComponent,
  RoleFormDialogData,
} from '../role-form/role-form.component';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    MaintainerTableComponent,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss',
  animations: [listFadeIn, rowAnimation],
})
export class RoleListComponent {
  private readonly roleService = inject(RoleService);
  private readonly dialog = inject(MatDialog);

  readonly paged = createPagedListResource<RoleListItem>(
    (params) => this.roleService.getPaged(params),
    DEFAULT_PAGED_QUERY,
  );

  private static readonly formDialogConfig = {
    width: '440px',
    maxWidth: '95vw',
    disableClose: true,
    panelClass: 'neosoft-dialog',
  } as const;

  readonly displayedColumns: readonly string[] = ['id', 'name', 'actions'];

  trackByRoleId(_index: number, role: RoleListItem): number {
    return role.id;
  }

  onFiltersChange(filters: IdNameFilters): void {
    this.paged.applyFilters(filters);
  }

  onPage(event: PageEvent): void {
    this.paged.applyPage(event);
  }

  openCreate(): void {
    const data: RoleFormDialogData = { mode: 'create' };
    this.dialog
      .open(RoleFormComponent, {
        ...RoleListComponent.formDialogConfig,
        data,
      })
      .afterClosed()
      .subscribe((saved: boolean | undefined) => {
        if (saved === true) {
          this.paged.refresh();
        }
      });
  }

  edit(role: RoleListItem): void {
    const data: RoleFormDialogData = { mode: 'edit', roleId: role.id };
    this.dialog
      .open(RoleFormComponent, {
        ...RoleListComponent.formDialogConfig,
        data,
      })
      .afterClosed()
      .subscribe((saved: boolean | undefined) => {
        if (saved === true) {
          this.paged.refresh();
        }
      });
  }

  viewMetadata(role: RoleListItem): void {
    openMetadataDialog(this.dialog, {
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    });
  }

  confirmDelete(role: RoleListItem): void {
    const dialogData: ConfirmDialogData = {
      title: 'Eliminar rol',
      message: `¿Eliminar el rol ${role.name}? Esta acción no se puede deshacer.`,
    };
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      maxWidth: '95vw',
      panelClass: 'neosoft-dialog',
      data: dialogData,
    });
    ref.afterClosed().subscribe((confirmed: boolean | undefined) => {
      if (confirmed === true) {
        this.roleService.delete(role.id).subscribe({
          next: () => this.paged.refresh(),
        });
      }
    });
  }
}
