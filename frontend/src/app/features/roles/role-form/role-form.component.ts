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
import { catchError, defer, map, Observable, of } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { RoleListItem, RolePayload } from '../../../core/models/role.model';
import { RoleService } from '../../../core/services/role.service';
import { NotificationService } from '../../../core/services/notification.service';

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
export class RoleFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly roleService = inject(RoleService);
  private readonly notifications = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<RoleFormComponent, boolean>);
  private readonly data = inject<RoleFormDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
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

  submit(vm: RoleFormViewModel): void {
    if (this.form.invalid || (vm.mode === 'edit' && vm.role === null)) {
      this.form.markAllAsTouched();
      this.notifications.warning('Revise los campos marcados antes de guardar.');
      return;
    }
    const name = this.form.controls.name.value;
    if (name === null) {
      return;
    }
    const payload: RolePayload = { name };
    if (vm.mode === 'create') {
      this.roleService.create(payload).subscribe({
        next: () => this.dialogRef.close(true),
      });
    } else if (vm.role !== null) {
      this.roleService.update(vm.role.id, payload).subscribe({
        next: () => this.dialogRef.close(true),
      });
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
