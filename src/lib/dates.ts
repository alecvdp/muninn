/**
 * For monthly billing: compute the next occurrence of `billDay` this month or next.
 * For annual/one-time: return the renewal_date as-is.
 * Returns null if no renewal info is available.
 */
export function nextRenewalDate(tool: {
  billing_cycle: string | null;
  bill_day: number | null;
  renewal_date: string | null;
}): Date | null {
  if (tool.billing_cycle === 'monthly' && tool.bill_day) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Clamp bill_day to the last day of the target month
    const clamp = (y: number, m: number, day: number) => {
      const lastDay = new Date(y, m + 1, 0).getDate();
      return new Date(y, m, Math.min(day, lastDay));
    };

    const thisMonth = clamp(year, month, tool.bill_day);
    if (thisMonth.getTime() >= now.getTime()) return thisMonth;

    // Already passed this month — next month
    const nextMonth = month + 1;
    return clamp(year, nextMonth, tool.bill_day);
  }

  if (tool.renewal_date) {
    return new Date(tool.renewal_date);
  }

  return null;
}

export const isWithin30Days = (date: Date | string | null): boolean => {
  if (!date) return false;

  const renewal = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffTime = renewal.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays >= 0 && diffDays <= 30;
};
