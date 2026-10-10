/**
 * Helper utilities for Italian date formatting, calendar math, and recurring lesson calculation.
 */

export const ITALIAN_DAYS = [
  'Domenica',
  'Lunedì',
  'Martedì',
  'Mercoledì',
  'Giovedì',
  'Venerdì',
  'Sabato',
];

export const ITALIAN_DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

export const ITALIAN_MONTHS = [
  'Gennaio',
  'Febbraio',
  'Marzo',
  'Aprile',
  'Maggio',
  'Giugno',
  'Luglio',
  'Agosto',
  'Settembre',
  'Ottobre',
  'Novembre',
  'Dicembre',
];

/**
 * Format YYYY-MM-DD to "09/10/2026"
 */
export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * Format YYYY-MM-DD to "9 Ottobre 2026"
 */
export function formatDateLong(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  return `${day} ${ITALIAN_MONTHS[month - 1]} ${year}`;
}

/**
 * Format YYYY-MM-DD to "Martedì 9 Ottobre"
 */
export function formatDateWithDay(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const dayName = ITALIAN_DAYS[date.getDay()];
  const dayNum = date.getDate();
  const monthName = ITALIAN_MONTHS[date.getMonth()];
  return `${dayName} ${dayNum} ${monthName}`;
}

/**
 * Format currency in EUR: "25,00 €"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get day of week for YYYY-MM-DD (0 = Sunday, 1 = Monday, 2 = Tuesday, etc.)
 */
export function getDayOfWeek(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00');
  return d.getDay();
}

/**
 * Generate dates for a recurring schedule.
 * e.g. every Tuesday (dayOfWeek = 2) from startDate to endDate
 */
export function generateRecurringDates(
  dayOfWeek: number,
  startDateStr: string,
  endDateStr: string
): string[] {
  const dates: string[] = [];
  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T00:00:00');

  if (start > end) return dates;

  const current = new Date(start);

  // Advance current to the first occurrence of the chosen dayOfWeek
  while (current.getDay() !== dayOfWeek) {
    current.setDate(current.getDate() + 1);
  }

  // Collect all matching dates until end
  while (current <= end) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    current.setDate(current.getDate() + 7);
  }

  return dates;
}

/**
 * Returns today's date formatted as YYYY-MM-DD
 */
export function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Add days to YYYY-MM-DD
 */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Get start of the week (Monday) for a given date
 */
export function getStartOfWeek(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  // Monday is 1, Sunday is 0 -> diff to Monday
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dayNum = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dayNum}`;
}
