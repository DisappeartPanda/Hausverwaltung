import type { LimitMap } from "../billing/modules";
import {
  canUseWithinLimit,
  getLimitValue,
  isLimitReached,
  type LimitKey,
} from "./limit-access";

export type UsageMap = Partial<Record<LimitKey, number>>;

export type UsageStatus = {
  key: LimitKey;
  current: number;
  limit: number | null | undefined;
  remaining: number | null;
  isConfigured: boolean;
  isUnlimited: boolean;
  isReached: boolean;
  canCreateOneMore: boolean;
};

export function getUsageValue(
  usage: UsageMap,
  key: LimitKey,
): number {
  return usage[key] ?? 0;
}

export function getUsageStatus(
  limits: LimitMap,
  usage: UsageMap,
  key: LimitKey,
): UsageStatus {
  const current = getUsageValue(usage, key);
  const limit = getLimitValue(limits, key);

  const isConfigured = limit !== undefined;
  const isUnlimited = limit === null;
  const reached = isLimitReached(limits, key, current);

  let remaining: number | null = null;

  if (typeof limit === "number") {
    remaining = Math.max(limit - current, 0);
  }

  return {
    key,
    current,
    limit,
    remaining,
    isConfigured,
    isUnlimited,
    isReached: reached,
    canCreateOneMore: canUseWithinLimit(limits, key, current + 1),
  };
}

export function getAllUsageStatuses(
  limits: LimitMap,
  usage: UsageMap,
): UsageStatus[] {
  const keys = Object.keys(limits) as LimitKey[];
  return keys.map((key) => getUsageStatus(limits, usage, key));
}