import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { shareReplay, switchMap, tap } from 'rxjs/operators';
import {
  VARIABLE_TYPE_OPTIONS,
  Variable,
  VariablePayload,
} from '../../../core/models/variable.model';
import { VariableService } from '../../../core/services/variable.service';

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
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: './variable-form.component.html',
  styleUrl: './variable-form.component.scss',
})
export class VariableFormComponent {
  readonly typeOptions = VARIABLE_TYPE_OPTIONS;

  private readonly fb = inject(FormBuilder);
  private readonly variableService = inject(VariableService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    value: ['', Validators.required],
    type: ['', Validators.required],
  });

  readonly vm$: Observable<VariableFormViewModel> = this.route.paramMap.pipe(
    switchMap((params) => {
      const id = params.get('id');
      if (id === null) {
        return of({ mode: 'create' as const, variable: null });
      }
      return this.variableService.getById(Number(id)).pipe(
        map((variable) => ({ mode: 'edit' as const, variable })),
        catchError(() => of({ mode: 'edit' as const, variable: null })),
      );
    }),
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
        next: () => void this.router.navigate(['/variables']),
      });
    } else if (vm.variable !== null) {
      this.variableService.update(vm.variable.id, payload).subscribe({
        next: () => void this.router.navigate(['/variables']),
      });
    }
  }

  cancel(): void {
    void this.router.navigate(['/variables']);
  }
}
