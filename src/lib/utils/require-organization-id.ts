export function requireOrganizationId(
  organizationId: string | null | undefined
): string {
  if (!organizationId) {
    throw new Error("Es ist keine organizationId verfügbar.");
  }

  return organizationId;
}