import { AsyncPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { catchError, defer, map, Observable, switchMap } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { User, UserCreatePayload } from '../../../core/models/user.model';
import { RoleListItem } from '../../../core/models/role.model';
import { RoleService } from '../../../core/services/role.service';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  applyBackendValidationErrors,
  getNonFieldErrors,
} from '../../../core/utils/backend-validation-errors';

export interface UserFormDialogData {
  readonly mode: 'create' | 'edit';
  readonly userId?: number;
}

interface UserFormViewModel {
  readonly mode: 'create' | 'edit';
  readonly user: User | null;
  readonly roles: RoleListItem[];
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly notifications = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<UserFormComponent, boolean>);
  private readonly data = inject<UserFormDialogData>(MAT_DIALOG_DATA);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = this.fb.group({
    fullName: [''],
    email: [''],
    roleId: [null as number | null],
  });

  readonly vm$: Observable<UserFormViewModel> = defer(() => {
    const roles$ = this.roleService.getAllForDropdown();
    if (this.data.mode === 'create') {
      return roles$.pipe(map((roles) => ({ mode: 'create' as const, user: null, roles })));
    }
    const id = this.data.userId;
    if (id === undefined) {
      return roles$.pipe(map((roles) => ({ mode: 'edit' as const, user: null, roles })));
    }
    return this.userService.getById(id).pipe(
      switchMap((user) =>
        roles$.pipe(map((roles) => ({ mode: 'edit' as const, user, roles }))),
      ),
      catchError(() =>
        roles$.pipe(map((roles) => ({ mode: 'edit' as const, user: null, roles }))),
      ),
    );
  }).pipe(
    tap((vm) => {
      this.form.reset({
        fullName: vm.user?.fullName ?? '',
        email: vm.user?.email ?? '',
        roleId: vm.user?.roleId ?? null,
      });
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  ngOnInit(): void {
    for (const key of ['fullName', 'email', 'roleId'] as const) {
      const control = this.form.get(key);
      if (!control) {
        continue;
      }
      control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        if (!control.errors?.['backend']) {
          return;
        }
        const { backend: _b, ...rest } = control.errors as Record<string, unknown>;
        control.setErrors(Object.keys(rest).length > 0 ? rest : null);
      });
    }
  }

  submit(vm: UserFormViewModel): void {
    if (vm.mode === 'edit' && vm.user === null) {
      return;
    }
    const raw = this.form.getRawValue();
    const payload: UserCreatePayload = {
      fullName: raw.fullName ?? '',
      email: raw.email ?? '',
      roleId: raw.roleId ?? 0,
    };
    const handleError = (err: unknown): void => {
      const body = err instanceof HttpErrorResponse ? err.error : null;
      applyBackendValidationErrors(this.form, body);
      const globalMsgs = getNonFieldErrors(body);
      if (globalMsgs.length > 0) {
        this.notifications.error(globalMsgs.join(' '));
      }
    };
    if (vm.mode === 'create') {
      this.userService.create(payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: handleError,
      });
    } else if (vm.user !== null) {
      this.userService.update(vm.user.id, payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: handleError,
      });
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
