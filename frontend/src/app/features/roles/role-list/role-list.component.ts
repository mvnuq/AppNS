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
import { RoleListItem } from '../../../core/models/role.model';
import { RoleService } from '../../../core/services/role.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';

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
    RouterLink,
  ],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss',
})
export class RoleListComponent {
  private readonly roleService = inject(RoleService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly refresh$ = new Subject<void>();

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

  edit(role: RoleListItem): void {
    void this.router.navigate(['/roles', role.id, 'edit']);
  }

  confirmDelete(role: RoleListItem): void {
    const data: ConfirmDialogData = {
      title: 'Eliminar rol',
      message: `¿Eliminar el rol ${role.name}? Esta acción no se puede deshacer.`,
    };
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data,
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
