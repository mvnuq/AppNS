import { HttpErrorResponse } from '@angular/common/http';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((x) => typeof x === 'string');
}

/** Cuerpo con solo errores por campo (arrays de strings), sin mensaje global útil */
function isFieldOnlyValidationBody(body: Record<string, unknown>): boolean {
  const meta = new Set([
    'type',
    'title',
    'status',
    'detail',
    'instance',
    'traceId',
    'trace',
    'errors',
    'message',
    'error',
  ]);
  const keys = Object.keys(body).filter((k) => !meta.has(k));
  if (keys.length === 0) {
    return false;
  }
  return keys.every((k) => isStringArray(body[k]));
}

/**
 * Extrae un mensaje para notificación global, o `null` si el error es solo por campo (lo muestra el formulario).
 */
export function extractHttpErrorMessage(error: HttpErrorResponse): string | null {
  const body: unknown = error.error;

  if (typeof body === 'string') {
    const trimmed = body.trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      try {
        const parsed: unknown = JSON.parse(trimmed);
        if (typeof parsed === 'string') {
          return parsed;
        }
      } catch {
        return body;
      }
    }
    return body;
  }

  if (isRecord(body)) {
    // ASP.NET ValidationProblemDetails: no toast genérico "One or more validation errors..."
    if (isRecord(body['errors']) && Object.keys(body['errors']).length > 0) {
      return null;
    }

    const nonField = body['non_field_errors'];
    if (isStringArray(nonField) && nonField.length > 0) {
      return nonField.join(' ');
    }

    if (isFieldOnlyValidationBody(body)) {
      return null;
    }

    const message = body['message'];
    if (typeof message === 'string') {
      return message;
    }
    const title = body['title'];
    if (typeof title === 'string') {
      return title;
    }
    const err = body['error'];
    if (typeof err === 'string') {
      return err;
    }
  }

  if (error.status === 404) {
    return 'Recurso no encontrado.';
  }
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor.';
  }

  return `Error ${String(error.status)}: ${error.statusText}`;
}
