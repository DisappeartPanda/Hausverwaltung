export type DashboardMode = 'auto' | 'compact' | 'standard' | 'focus';
export type ResolvedDashboardMode = Exclude<DashboardMode, 'auto'>;

export function resolveDashboardMode(mode: DashboardMode, einheiten: number): ResolvedDashboardMode {
  if (mode !== 'auto') return mode;

  // Auto-Regeln (sehr sinnvoll fürs “passt sich an”)
  if (einheiten === 0) return 'focus';      // Onboarding / Setup
  if (einheiten <= 2) return 'standard';    // übersichtlich
  if (einheiten <= 8) return 'standard';
  return 'compact';                         // viele Einheiten -> kompakter
}