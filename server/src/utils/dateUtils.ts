export function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00Z');
}

export function getNextTradingDay(date: Date): Date {
  const next = new Date(date);
  while (isWeekend(next)) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  return next;
}

export function getPreviousTradingDay(date: Date): Date {
  const prev = new Date(date);
  prev.setUTCDate(prev.getUTCDate() - 1);
  while (isWeekend(prev)) {
    prev.setUTCDate(prev.getUTCDate() - 1);
  }
  return prev;
}

export function isTradingDay(date: Date): boolean {
  return !isWeekend(date);
}

export function getTradingDaysInRange(startDate: string, endDate: string): string[] {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const days: string[] = [];
  const current = new Date(start);

  while (current <= end) {
    if (isTradingDay(current)) {
      days.push(formatDate(current));
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return days;
}
