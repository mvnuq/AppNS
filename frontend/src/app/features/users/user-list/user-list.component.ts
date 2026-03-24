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
import { User } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';
import { listFadeIn, rowAnimation } from '../../../shared/animations/list.animations';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MaintainerTableComponent } from '../../../shared/components/maintainer-table/maintainer-table.component';
import {
  UserFormComponent,
  UserFormDialogData,
} from '../user-form/user-form.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    AsyncPipe,
    MaintainerTableComponent,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  animations: [listFadeIn, rowAnimation],
})
export class UserListComponent {
  private readonly userService = inject(UserService);
  private readonly dialog = inject(MatDialog);
  private readonly refresh$ = new Subject<void>();

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

  readonly users$: Observable<User[]> = this.refresh$.pipe(
    startWith(undefined),
    switchMap(() =>
      this.userService.getAll().pipe(
        catchError(() => of([] as User[])),
      ),
    ),
  );

  trackByUserId(_index: number, user: User): number {
    return user.id;
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
          this.refresh$.next();
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
          this.refresh$.next();
        }
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
          next: () => this.refresh$.next(),
        });
      }
    });
  }
}
