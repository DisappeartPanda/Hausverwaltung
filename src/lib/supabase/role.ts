export type UserRole = 'guest' | 'tenant' | 'landlord';

export function normalizeRole(value: string | undefined | null): UserRole {
  if (value === 'tenant' || value === 'landlord' || value === 'guest') return value;
  return 'guest';
}