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
import { catchError, defer, map, Observable, of } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { RoleListItem, RolePayload } from '../../../core/models/role.model';
import { RoleService } from '../../../core/services/role.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  applyBackendValidationErrors,
  getNonFieldErrors,
} from '../../../core/utils/backend-validation-errors';

export interface RoleFormDialogData {
  readonly mode: 'create' | 'edit';
  readonly roleId?: number;
}

interface RoleFormViewModel {
  readonly mode: 'create' | 'edit';
  readonly role: RoleListItem | null;
}

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './role-form.component.html',
  styleUrl: './role-form.component.scss',
})
export class RoleFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly roleService = inject(RoleService);
  private readonly notifications = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<RoleFormComponent, boolean>);
  private readonly data = inject<RoleFormDialogData>(MAT_DIALOG_DATA);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = this.fb.group({
    name: [''],
  });

  readonly vm$: Observable<RoleFormViewModel> = defer(() => {
    if (this.data.mode === 'create') {
      return of({ mode: 'create' as const, role: null });
    }
    const id = this.data.roleId;
    if (id === undefined) {
      return of({ mode: 'edit' as const, role: null });
    }
    return this.roleService.getById(id).pipe(
      map((role) => ({ mode: 'edit' as const, role })),
      catchError(() => of({ mode: 'edit' as const, role: null })),
    );
  }).pipe(
    tap((vm) => {
      this.form.reset({
        name: vm.role?.name ?? '',
      });
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  ngOnInit(): void {
    const control = this.form.get('name');
    if (!control) {
      return;
    }
    control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (!control.errors?.['backend']) {
        return;
      }
      const { backend: _b, ...rest } = control.errors as Record<string, unknown>;
      control.setErrors(Object.keys(rest).length > 0 ? rest : null);
    });
  }

  submit(vm: RoleFormViewModel): void {
    if (vm.mode === 'edit' && vm.role === null) {
      return;
    }
    const payload: RolePayload = { name: this.form.getRawValue().name ?? '' };
    const handleError = (err: unknown): void => {
      const body = err instanceof HttpErrorResponse ? err.error : null;
      applyBackendValidationErrors(this.form, body);
      const globalMsgs = getNonFieldErrors(body);
      if (globalMsgs.length > 0) {
        this.notifications.error(globalMsgs.join(' '));
      }
    };
    if (vm.mode === 'create') {
      this.roleService.create(payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: handleError,
      });
    } else if (vm.role !== null) {
      this.roleService.update(vm.role.id, payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: handleError,
      });
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
