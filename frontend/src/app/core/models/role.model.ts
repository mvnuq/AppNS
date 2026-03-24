export interface RoleListItem {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface RolePayload {
  name: string;
}
