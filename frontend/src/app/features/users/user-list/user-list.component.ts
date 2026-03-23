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
import { User } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    AsyncPipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    RouterLink,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent {
  private readonly userService = inject(UserService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly refresh$ = new Subject<void>();

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

  edit(user: User): void {
    void this.router.navigate(['/users', user.id, 'edit']);
  }

  confirmDelete(user: User): void {
    const data: ConfirmDialogData = {
      title: 'Eliminar usuario',
      message: `¿Eliminar a ${user.fullName}? Esta acción no se puede deshacer.`,
    };
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data,
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
