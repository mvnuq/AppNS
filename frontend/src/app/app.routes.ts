import { Routes } from '@angular/router';
import { RoleFormComponent } from './features/roles/role-form/role-form.component';
import { RoleListComponent } from './features/roles/role-list/role-list.component';
import { UserFormComponent } from './features/users/user-form/user-form.component';
import { UserListComponent } from './features/users/user-list/user-list.component';
import { VariableFormComponent } from './features/variables/variable-form/variable-form.component';
import { VariableListComponent } from './features/variables/variable-list/variable-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  { path: 'users/new', component: UserFormComponent },
  { path: 'users/:id/edit', component: UserFormComponent },
  { path: 'users', component: UserListComponent },
  { path: 'variables/new', component: VariableFormComponent },
  { path: 'variables/:id/edit', component: VariableFormComponent },
  { path: 'variables', component: VariableListComponent },
  { path: 'roles/new', component: RoleFormComponent },
  { path: 'roles/:id/edit', component: RoleFormComponent },
  { path: 'roles', component: RoleListComponent },
];
