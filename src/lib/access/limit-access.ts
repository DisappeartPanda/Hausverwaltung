import type { LimitMap } from "../billing/modules";

export type LimitKey = keyof LimitMap;

export function getLimitValue(
  limits: LimitMap,
  key: LimitKey,
): number | null | undefined {
  return limits[key];
}

export function isUnlimitedLimit(
  limits: LimitMap,
  key: LimitKey,
): boolean {
  return limits[key] === null;
}

export function hasLimitConfigured(
  limits: LimitMap,
  key: LimitKey,
): boolean {
  return limits[key] !== undefined;
}

export function canUseWithinLimit(
  limits: LimitMap,
  key: LimitKey,
  nextUsageValue: number,
): boolean {
  const limit = limits[key];

  if (limit === undefined) {
    return false;
  }

  if (limit === null) {
    return true;
  }

  return nextUsageValue <= limit;
}

export function isLimitReached(
  limits: LimitMap,
  key: LimitKey,
  currentUsageValue: number,
): boolean {
  const limit = limits[key];

  if (limit === undefined || limit === null) {
    return false;
  }

  return currentUsageValue >= limit;
}