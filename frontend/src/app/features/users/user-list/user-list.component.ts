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
import { User } from '../../../core/models/user.model';
import { createPagedListResource } from '../../../core/paged-list/create-paged-list-resource';
import { UserService } from '../../../core/services/user.service';
import { listFadeIn, rowAnimation } from '../../../shared/animations/list.animations';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MaintainerTableComponent } from '../../../shared/components/maintainer-table/maintainer-table.component';
import { openMetadataDialog } from '../../../shared/components/metadata-dialog/open-metadata-dialog';
import {
  UserFormComponent,
  UserFormDialogData,
} from '../user-form/user-form.component';

@Component({
  selector: 'app-user-list',
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
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  animations: [listFadeIn, rowAnimation],
})
export class UserListComponent {
  private readonly userService = inject(UserService);
  private readonly dialog = inject(MatDialog);

  /**
   * Listado reactivo: `rxResource` vuelve a llamar a la API cuando cambian
   * `queryParams` o `refresh()` (dependencias explícitas, similar a useEffect).
   */
  readonly paged = createPagedListResource<User>(
    (params) => this.userService.getPaged(params),
    DEFAULT_PAGED_QUERY,
  );

  private static readonly formDialogConfig = {
    width: '520px',
    maxWidth: '95vw',
    disableClose: true,
    panelClass: 'neosoft-dialog',
  } as const;

  readonly displayedColumns: readonly string[] = [
    'id',
    'fullName',
    'email',
    'roleName',
    'actions',
  ];

  trackByUserId(_index: number, user: User): number {
    return user.id;
  }

  onFiltersChange(filters: IdNameFilters): void {
    this.paged.applyFilters(filters);
  }

  onPage(event: PageEvent): void {
    this.paged.applyPage(event);
  }

  openCreate(): void {
    const data: UserFormDialogData = { mode: 'create' };
    this.dialog
      .open(UserFormComponent, {
        ...UserListComponent.formDialogConfig,
        data,
      })
      .afterClosed()
      .subscribe((saved: boolean | undefined) => {
        if (saved === true) {
          this.paged.refresh();
        }
      });
  }

  edit(user: User): void {
    const data: UserFormDialogData = { mode: 'edit', userId: user.id };
    this.dialog
      .open(UserFormComponent, {
        ...UserListComponent.formDialogConfig,
        data,
      })
      .afterClosed()
      .subscribe((saved: boolean | undefined) => {
        if (saved === true) {
          this.paged.refresh();
        }
      });
  }

  viewMetadata(user: User): void {
    openMetadataDialog(this.dialog, {
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  confirmDelete(user: User): void {
    const dialogData: ConfirmDialogData = {
      title: 'Eliminar usuario',
      message: `¿Eliminar a ${user.fullName}? Esta acción no se puede deshacer.`,
    };
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      maxWidth: '95vw',
      panelClass: 'neosoft-dialog',
      data: dialogData,
    });
    ref.afterClosed().subscribe((confirmed: boolean | undefined) => {
      if (confirmed === true) {
        this.userService.delete(user.id).subscribe({
          next: () => this.paged.refresh(),
        });
      }
    });
  }
}
