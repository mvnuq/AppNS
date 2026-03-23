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
import { RoleListItem } from '../../../core/models/role.model';
import { RoleService } from '../../../core/services/role.service';
import { listFadeIn, rowAnimation } from '../../../shared/animations/list.animations';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  RoleFormComponent,
  RoleFormDialogData,
} from '../role-form/role-form.component';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    AsyncPipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
  ],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss',
  animations: [listFadeIn, rowAnimation],
})
export class RoleListComponent {
  private readonly roleService = inject(RoleService);
  private readonly dialog = inject(MatDialog);
  private readonly refresh$ = new Subject<void>();

  private static readonly formDialogConfig = {
    width: '440px',
    maxWidth: '95vw',
    disableClose: true,
    panelClass: 'neosoft-dialog',
  } as const;

  readonly displayedColumns: readonly string[] = ['id', 'name', 'actions'];

  readonly roles$: Observable<RoleListItem[]> = this.refresh$.pipe(
    startWith(undefined),
    switchMap(() =>
      this.roleService.getAllForDropdown().pipe(
        catchError(() => of([] as RoleListItem[])),
      ),
    ),
  );

  trackByRoleId(_index: number, role: RoleListItem): number {
    return role.id;
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
          this.refresh$.next();
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
          this.refresh$.next();
        }
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
          next: () => this.refresh$.next(),
        });
      }
    });
  }
}
