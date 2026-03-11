import type { AppSession } from "../auth/session";

export type AppTheme = "dark-green" | "dark-blue" | "light";

export type AppContext = {
  organizationId: string | null;
  organizationName: string | null;
  theme: AppTheme;
};

export async function getAppContext(session: AppSession): Promise<AppContext> {
  return {
    organizationId: session.organizationId,
    organizationName: session.organizationName ?? "ImmobilienPro",
    theme: "dark-green",
  };
}