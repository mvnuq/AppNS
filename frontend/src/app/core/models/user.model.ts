export interface User {
  id: number;
  fullName: string;
  email: string;
  roleId: number;
  roleName: string;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface UserCreatePayload {
  fullName: string;
  email: string;
  roleId: number;
}
