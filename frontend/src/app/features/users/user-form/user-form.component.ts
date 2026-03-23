import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
export class UserFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly notifications = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<UserFormComponent, boolean>);
  private readonly data = inject<UserFormDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    roleId: [null as number | null, Validators.required],
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

  submit(vm: UserFormViewModel): void {
    if (this.form.invalid || (vm.mode === 'edit' && vm.user === null)) {
      this.form.markAllAsTouched();
      this.notifications.warning('Revise los campos marcados antes de guardar.');
      return;
    }
    const raw = this.form.getRawValue();
    const { fullName, email, roleId } = raw;
    if (fullName === null || email === null || roleId === null) {
      return;
    }
    const payload: UserCreatePayload = {
      fullName,
      email,
      roleId,
    };
    if (vm.mode === 'create') {
      this.userService.create(payload).subscribe({
        next: () => this.dialogRef.close(true),
      });
    } else if (vm.user !== null) {
      this.userService.update(vm.user.id, payload).subscribe({
        next: () => this.dialogRef.close(true),
      });
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
