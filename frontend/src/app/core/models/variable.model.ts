/** Valores permitidos (alineados con `VariableType` en la API). */
export const VARIABLE_TYPE_OPTIONS = [
  { value: 'texto', label: 'Texto' },
  { value: 'numérico', label: 'Numérico' },
  { value: 'booleano', label: 'Booleano' },
] as const;

export interface Variable {
  id: number;
  name: string;
  value: string;
  type: string;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface VariablePayload {
  name: string;
  value: string;
  type: string;
}
