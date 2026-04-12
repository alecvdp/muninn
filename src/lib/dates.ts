export const isWithin30Days = (date: string | null): boolean => {
  if (!date) return false;

  const renewal = new Date(date);
  const now = new Date();
  const diffTime = renewal.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays >= 0 && diffDays <= 30;
};
