export const ROUTES = {
  HOME: "/",

  AUTH_LOGIN: "/auth/login",
  AUTH_REGISTER: "/auth/register",
  AUTH_FORGOT_PASSWORD: "/auth/forgot-password",
  AUTH_RESET_PASSWORD: "/auth/reset-password",

  APP_ROOT: "/app",
  APP_DASHBOARD: "/app/dashboard",
  APP_TENANT_HOME: "/app/tenant",

  APP_OBJECTS: "/app/objekte",
  APP_UNITS: "/app/wohneinheiten",
  APP_TENANTS: "/app/mieter",
  APP_DEFECTS: "/app/maengel",
  APP_MAINTENANCE: "/app/wartungen",
  APP_DOCUMENTS: "/app/dokumente",
  APP_BILLING: "/app/abrechnung",
  APP_RENTAL_POOL: "/app/mietpool",
  APP_HANDYMEN: "/app/handwerker",

  SETTINGS_HOME: "/settings",
  SETTINGS_PROFILE: "/settings/profile",
  SETTINGS_SECURITY: "/settings/security",

  API_LOGOUT: "/api/logout"
} as const;