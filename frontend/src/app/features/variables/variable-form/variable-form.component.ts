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
import { catchError, defer, map, Observable, of } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import {
  VARIABLE_TYPE_OPTIONS,
  Variable,
  VariablePayload,
} from '../../../core/models/variable.model';
import { VariableService } from '../../../core/services/variable.service';
import { NotificationService } from '../../../core/services/notification.service';

export interface VariableFormDialogData {
  readonly mode: 'create' | 'edit';
  readonly variableId?: number;
}

interface VariableFormViewModel {
  readonly mode: 'create' | 'edit';
  readonly variable: Variable | null;
}

@Component({
  selector: 'app-variable-form',
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
  templateUrl: './variable-form.component.html',
  styleUrl: './variable-form.component.scss',
})
export class VariableFormComponent {
  readonly typeOptions = VARIABLE_TYPE_OPTIONS;

  private readonly fb = inject(FormBuilder);
  private readonly variableService = inject(VariableService);
  private readonly notifications = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<VariableFormComponent, boolean>);
  private readonly data = inject<VariableFormDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    value: ['', Validators.required],
    type: ['', Validators.required],
  });

  readonly vm$: Observable<VariableFormViewModel> = defer(() => {
    if (this.data.mode === 'create') {
      return of({ mode: 'create' as const, variable: null });
    }
    const id = this.data.variableId;
    if (id === undefined) {
      return of({ mode: 'edit' as const, variable: null });
    }
    return this.variableService.getById(id).pipe(
      map((variable) => ({ mode: 'edit' as const, variable })),
      catchError(() => of({ mode: 'edit' as const, variable: null })),
    );
  }).pipe(
    tap((vm) => {
      this.form.reset({
        name: vm.variable?.name ?? '',
        value: vm.variable?.value ?? '',
        type: vm.variable?.type ?? '',
      });
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  submit(vm: VariableFormViewModel): void {
    if (this.form.invalid || (vm.mode === 'edit' && vm.variable === null)) {
      this.form.markAllAsTouched();
      this.notifications.warning('Revise los campos marcados antes de guardar.');
      return;
    }
    const raw = this.form.getRawValue();
    const { name, value, type } = raw;
    if (name === null || value === null || type === null) {
      return;
    }
    const payload: VariablePayload = { name, value, type };
    if (vm.mode === 'create') {
      this.variableService.create(payload).subscribe({
        next: () => this.dialogRef.close(true),
      });
    } else if (vm.variable !== null) {
      this.variableService.update(vm.variable.id, payload).subscribe({
        next: () => this.dialogRef.close(true),
      });
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
