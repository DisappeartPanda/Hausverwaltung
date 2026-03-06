import type { ResolvedDashboardMode } from './dashboardModes';

type Icon = 'building' | 'users' | 'credit-card' | 'tool' | 'file-text' | 'settings';

export type QuickLinkItem = {
  href: string;
  icon: Icon;
  label: string;
};

export function getQuickLinks(
  _einheiten: number,
  _mode: ResolvedDashboardMode
): QuickLinkItem[] {
  return [
    { href: '/objekte', icon: 'building', label: 'Objekte' },
    { href: '/mieter', icon: 'users', label: 'Mieter' },
    { href: '/instandhaltung', icon: 'tool', label: 'Wartungen' },
    { href: '/zahlungen', icon: 'credit-card', label: 'Zahlungen' },
    { href: '/dokumente', icon: 'file-text', label: 'Dokumente' },
    { href: '/einstellungen', icon: 'settings', label: 'Einstellungen' },
  ];
}