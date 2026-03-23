import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { shareReplay, switchMap, tap } from 'rxjs/operators';
import { RoleListItem, RolePayload } from '../../../core/models/role.model';
import { RoleService } from '../../../core/services/role.service';

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
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: './role-form.component.html',
  styleUrl: './role-form.component.scss',
})
export class RoleFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly roleService = inject(RoleService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  readonly vm$: Observable<RoleFormViewModel> = this.route.paramMap.pipe(
    switchMap((params) => {
      const id = params.get('id');
      if (id === null) {
        return of({ mode: 'create' as const, role: null });
      }
      return this.roleService.getById(Number(id)).pipe(
        map((role) => ({ mode: 'edit' as const, role })),
        catchError(() => of({ mode: 'edit' as const, role: null })),
      );
    }),
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
      return;
    }
    const name = this.form.controls.name.value;
    if (name === null) {
      return;
    }
    const payload: RolePayload = { name };
    if (vm.mode === 'create') {
      this.roleService.create(payload).subscribe({
        next: () => void this.router.navigate(['/roles']),
      });
    } else if (vm.role !== null) {
      this.roleService.update(vm.role.id, payload).subscribe({
        next: () => void this.router.navigate(['/roles']),
      });
    }
  }

  cancel(): void {
    void this.router.navigate(['/roles']);
  }
}
