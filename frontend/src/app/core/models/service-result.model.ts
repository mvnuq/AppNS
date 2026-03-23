/**
 * Alineado con el contrato de capa de aplicación del backend (Neosoft.Api.Common.ServiceResult).
 * Las respuestas HTTP exitosas suelen devolver el DTO directamente; los fallos de ServiceResult
 * se proyectan a 400/404 y el mensaje va en el cuerpo de error.
 */
export const enum ServiceErrorKind {
  None = 'None',
  NotFound = 'NotFound',
  Validation = 'Validation',
  Conflict = 'Conflict',
}

export interface ServiceResult<T = void> {
  isSuccess: boolean;
  value?: T;
  error?: string | null;
  errorKind?: ServiceErrorKind;
}
