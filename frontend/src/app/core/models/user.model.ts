export interface User {
  id: number;
  fullName: string;
  email: string;
  roleId: number;
  roleName: string;
}

export interface UserCreatePayload {
  fullName: string;
  email: string;
  roleId: number;
}
