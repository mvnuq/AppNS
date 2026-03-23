import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, map, Observable, switchMap } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { User, UserCreatePayload } from '../../../core/models/user.model';
import { RoleListItem } from '../../../core/models/role.model';
import { RoleService } from '../../../core/services/role.service';
import { UserService } from '../../../core/services/user.service';

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
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    roleId: [null as number | null, Validators.required],
  });

  readonly vm$: Observable<UserFormViewModel> = this.route.paramMap.pipe(
    switchMap((params) => {
      const id = params.get('id');
      const roles$ = this.roleService.getAllForDropdown();
      if (id === null) {
        return roles$.pipe(
          map((roles) => ({ mode: 'create' as const, user: null, roles })),
        );
      }
      return this.userService.getById(Number(id)).pipe(
        switchMap((user) =>
          roles$.pipe(map((roles) => ({ mode: 'edit' as const, user, roles }))),
        ),
        catchError(() =>
          roles$.pipe(map((roles) => ({ mode: 'edit' as const, user: null, roles }))),
        ),
      );
    }),
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
        next: () => void this.router.navigate(['/users']),
      });
    } else if (vm.user !== null) {
      this.userService.update(vm.user.id, payload).subscribe({
        next: () => void this.router.navigate(['/users']),
      });
    }
  }

  cancel(): void {
    void this.router.navigate(['/users']);
  }
}
