import { AbstractControl, FormGroup } from '@angular/forms';

function stripBackendError(control: AbstractControl | null): void {
  if (!control?.errors?.['backend']) {
    return;
  }
  const { backend: _b, ...rest } = control.errors;
  control.setErrors(Object.keys(rest).length > 0 ? rest : null);
}

/** PascalCase / cualquier casing de propiedad .NET → camelCase del formulario Angular */
function toCamelCaseFieldKey(key: string): string {
  if (!key.length) {
    return key;
  }
  return key.charAt(0).toLowerCase() + key.slice(1);
}

/**
 * Soporta:
 * - ASP.NET ValidationProblemDetails: `{ errors: { FullName: ["…"], Email: ["…"] } }`
 */
export function normalizeFieldValidationErrors(body: unknown): Record<string, string[]> | null {
  if (!body || typeof body !== 'object') {
    return null;
  }
  const rec = body as Record<string, unknown>;

  const nested = rec['errors'];
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const out: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(nested as Record<string, unknown>)) {
      if (Array.isArray(v) && v.length > 0) {
        out[toCamelCaseFieldKey(k)] = v.map((x) => String(x));
      }
    }
    return Object.keys(out).length > 0 ? out : null;
  }

  const metaKeys = new Set([
    'title',
    'status',
    'detail',
    'instance',
    'traceId',
    'trace',
    'errors',
  ]);
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(rec)) {
    if (metaKeys.has(k)) {
      continue;
    }
    if (Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === 'string')) {
      out[toCamelCaseFieldKey(k)] = v as string[];
    }
  }
  return Object.keys(out).length > 0 ? out : null;
}

/**
 * Aplica errores devueltos por la API al FormGroup (mensaje `backend` por control).
 */
export function applyBackendValidationErrors(form: FormGroup, body: unknown): void {
  for (const key of Object.keys(form.controls)) {
    stripBackendError(form.get(key));
  }

  const fields = normalizeFieldValidationErrors(body);
  if (!fields) {
    return;
  }

  for (const [key, messages] of Object.entries(fields)) {
    if (key === 'non_field_errors' || messages.length === 0) {
      continue;
    }
    const text = messages.join(' ');
    const control = form.get(key);
    if (control) {
      control.setErrors({ ...(control.errors ?? {}), backend: text });
      control.markAsTouched();
    }
  }
}

export function getNonFieldErrors(body: unknown): string[] {
  if (!body || typeof body !== 'object') {
    return [];
  }
  const raw = (body as Record<string, unknown>)['non_field_errors'];
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map((x) => String(x));
}
