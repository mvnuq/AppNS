import { HttpErrorResponse } from '@angular/common/http';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Extrae un mensaje legible del cuerpo de error HTTP (ASP.NET BadRequest(string), ProblemDetails, etc.).
 */
export function extractHttpErrorMessage(error: HttpErrorResponse): string {
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
