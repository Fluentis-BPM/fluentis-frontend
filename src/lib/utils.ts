import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Safe date formatter that accepts Date | string | number | unknown
export function fmtDate(
  value: unknown,
  locale: string = 'es-ES',
  options?: Intl.DateTimeFormatOptions
): string {
  if (!value) return 'Desconocido';
  let d: Date | null = null;
  if (value instanceof Date) {
    d = value;
  } else if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) d = parsed;
  }
  return d ? d.toLocaleDateString(locale, options) : 'Desconocido';
}
