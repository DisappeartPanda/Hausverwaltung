import type { AppSession } from "../auth/session";

export type DemoContext = {
  organizationId: string | null;
  organizationName: string | null;
  theme: "dark-green" | "dark-blue" | "light";
};

export async function getDemoContext(
  session: AppSession
): Promise<DemoContext> {
  return {
    organizationId: session.organizationId,
    organizationName: session.organizationName ?? "ImmobilienPro",
    theme: "dark-green",
  };
}