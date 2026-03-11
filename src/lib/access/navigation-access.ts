import { ROUTES } from "../constants/routes";

export type NavigationItem = {
  label: string;
  href: string;
};

export function getNavigationItems(): NavigationItem[] {
  return [
    { label: "Dashboard", href: ROUTES.APP_DASHBOARD },
    { label: "Objekte", href: ROUTES.APP_OBJECTS },
    { label: "Wohneinheiten", href: ROUTES.APP_UNITS },
    { label: "Mieter", href: ROUTES.APP_TENANTS },
    { label: "Mängel", href: ROUTES.APP_DEFECTS },
    { label: "Wartungen", href: ROUTES.APP_MAINTENANCE },
    { label: "Dokumente", href: ROUTES.APP_DOCUMENTS },
    { label: "Abrechnung", href: ROUTES.APP_BILLING },
    { label: "Mietpool", href: ROUTES.APP_RENTAL_POOL },
    { label: "Handwerker", href: ROUTES.APP_HANDYMEN },
  ];
}