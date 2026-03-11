import type { AppSession } from "../auth/session";
import { getOrganizationById } from "../domain/organizations/organization-repository";

export type AppContext = {
  organizationId: string | null;
  organizationName: string;
  theme: "dark-green" | "dark-blue" | "light";
};

export async function getAppContext(session: AppSession): Promise<AppContext> {
  if (!session.organizationId) {
    return {
      organizationId: null,
      organizationName: "Keine Organisation zugeordnet",
      theme: "dark-green",
    };
  }

  try {
    const organization = await getOrganizationById(session.organizationId);

    if (!organization) {
      return {
        organizationId: session.organizationId,
        organizationName: "Unbekannte Organisation",
        theme: "dark-green",
      };
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
    return {
      organizationId: session.organizationId,
      organizationName: "Unbekannte Organisation",
      theme: "dark-green",
    };
  }
}