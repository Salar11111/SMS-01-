export function startOfDay(date: Date = new Date()): Date {
  return new Date(`${date.toISOString().slice(0, 10)}T00:00:00.000Z`);
}

export function dateInputValue(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(undefined, {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function classLabel(name: string, section: string): string {
  return `${name} — Section ${section}`;
}

export function isSafeCallbackUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  const url = new URL(value, "http://internal.invalid");
  return url.origin === "http://internal.invalid" && value.startsWith("/") && !value.startsWith("//");
}
