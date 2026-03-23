export interface Variable {
  id: number;
  name: string;
  value: string;
  type: string;
}

export interface VariablePayload {
  name: string;
  value: string;
  type: string;
}
