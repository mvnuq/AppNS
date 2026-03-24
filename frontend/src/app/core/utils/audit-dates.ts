/**
 * Convierte `createdAt` / `updatedAt` del JSON (ISO string) a `Date` para plantillas y DatePipe.
 */
export function mapAuditDates<T extends { createdAt?: unknown; updatedAt?: unknown }>(row: T): T {
  const r = row as Record<string, unknown>;
  const createdRaw = r['createdAt'] ?? r['CreatedAt'];
  const updatedRaw = r['updatedAt'] ?? r['UpdatedAt'];
  return {
    ...row,
    createdAt: parseDateRequired(createdRaw),
    updatedAt: updatedRaw == null ? null : parseDate(updatedRaw),
  };
}

function parseDate(value: unknown): Date | null {
  if (value == null) {
    return null;
  }
  if (value instanceof Date) {
    return value;
  }
  const s = String(value).trim();
  if (!s) {
    return null;
  }
  // ISO sin zona: .NET/MySQL suelen mandar UTC sin sufijo; sin esto el navegador lo interpreta como local y desfasa la hora.
  const hasExplicitZone = /Z$/i.test(s) || /[+-]\d{2}:?\d{2}$/.test(s);
  const normalized =
    !hasExplicitZone && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(s) ? `${s}Z` : s;
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseDateRequired(value: unknown): Date {
  return parseDate(value) ?? new Date(0);
}
