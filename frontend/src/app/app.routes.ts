import { Routes } from '@angular/router';
import { RoleListComponent } from './features/roles/role-list/role-list.component';
import { UserListComponent } from './features/users/user-list/user-list.component';
import { VariableListComponent } from './features/variables/variable-list/variable-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  { path: 'users', component: UserListComponent },
  { path: 'variables', component: VariableListComponent },
  { path: 'roles', component: RoleListComponent },
];
