/**
 * Microsoft Graph planner tasks expect Edm.DateTimeOffset (ISO-8601 with zone).
 * HTML datetime-local yields strings like "2026-03-21T10:00" which Graph rejects.
 * `new Date(...)` parses those as local time in the browser; we emit UTC ISO.
 */

export function toGraphDateTimeOptional(value: string): string | undefined {
  const v = value?.trim();
  if (!v) return undefined;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) {
    throw new Error('Invalid start or due date.');
  }
  return d.toISOString();
}

/** Empty input clears the field on Graph (null). */
export function toGraphDateTimeOrNull(value: string): string | null {
  const v = value?.trim();
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) {
    throw new Error('Invalid start or due date.');
  }
  return d.toISOString();
}
