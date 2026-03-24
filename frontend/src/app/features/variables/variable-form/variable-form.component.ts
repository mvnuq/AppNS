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
import { catchError, defer, map, Observable, of } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import {
  VARIABLE_TYPE_OPTIONS,
  Variable,
  VariablePayload,
} from '../../../core/models/variable.model';
import { VariableService } from '../../../core/services/variable.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  applyBackendValidationErrors,
  getNonFieldErrors,
} from '../../../core/utils/backend-validation-errors';

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
export class VariableFormComponent implements OnInit {
  readonly typeOptions = VARIABLE_TYPE_OPTIONS;

  private readonly fb = inject(FormBuilder);
  private readonly variableService = inject(VariableService);
  private readonly notifications = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<VariableFormComponent, boolean>);
  private readonly data = inject<VariableFormDialogData>(MAT_DIALOG_DATA);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = this.fb.group({
    name: [''],
    value: [''],
    type: [''],
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

  ngOnInit(): void {
    for (const key of ['name', 'value', 'type'] as const) {
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

  submit(vm: VariableFormViewModel): void {
    if (vm.mode === 'edit' && vm.variable === null) {
      return;
    }
    const raw = this.form.getRawValue();
    const payload: VariablePayload = {
      name: raw.name ?? '',
      value: raw.value ?? '',
      type: raw.type ?? '',
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
      this.variableService.create(payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: handleError,
      });
    } else if (vm.variable !== null) {
      this.variableService.update(vm.variable.id, payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: handleError,
      });
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
