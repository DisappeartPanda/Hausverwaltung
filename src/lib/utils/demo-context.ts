import type { AppSession } from "../auth/session";
import { getOrganizationById } from "../domain/organizations/organization-repository";

export type AppContext = {
  organizationId: string;
  organizationName: string;
  theme: "dark-green" | "dark-blue" | "light";
};

export async function getAppContext(session: AppSession): Promise<AppContext> {
  const fallbackContext: AppContext = {
    organizationId: session.organizationId ?? "11111111-1111-1111-1111-111111111111",
    organizationName: "Musterverwaltung GmbH",
    theme: "dark-green",
  };

  if (!session.organizationId) {
    return fallbackContext;
  }

  try {
    const organization = await getOrganizationById(session.organizationId);

    if (!organization) {
      return fallbackContext;
    }

    return {
      organizationId: organization.id,
      organizationName: organization.name,
      theme:
        organization.theme === "dark-blue" || organization.theme === "light"
          ? organization.theme
          : "dark-green",
    };
  } catch {
    return fallbackContext;
  }
}