/**
 * Return a safe, user-facing error message.
 * In development the original Supabase / runtime message is preserved for
 * easier debugging; in production a generic string is returned so internal
 * table names, constraint details, etc. are never leaked to end-users.
 */
export function userFacingError(raw: string): string {
  if (import.meta.env.DEV) return raw;
  return 'Something went wrong. Please try again.';
}
