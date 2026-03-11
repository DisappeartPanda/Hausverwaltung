import { createServerSupabaseClient } from "../../../lib/supabase/server";
import { listObjectsByOrganization } from "../objects/object-repository";

export type MaintenanceDetailViewModel = {
  id: string;
  title: string;
  objectId: string | null;
  objectLabel: string;
  scheduledDate: string | null;
  scheduledDateLabel: string;
  status: string;
  statusLabel: string;
  note: string | null;
  noteLabel: string;
};

function formatDate(dateValue: string | null): string {
  if (!dateValue) return "Kein Termin";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Ungültiges Datum";
  }

  return new Intl.DateTimeFormat("de-DE").format(date);
}

function mapStatusLabel(status: string): string {
  switch (status) {
    case "offen":
      return "Offen";
    case "geplant":
      return "Geplant";
    case "beauftragt":
      return "Beauftragt";
    case "abgeschlossen":
      return "Abgeschlossen";
    default:
      return status;
  }
}

export async function getMaintenanceDetailViewModel(
  organizationId: string,
  maintenanceId: string,
): Promise<MaintenanceDetailViewModel | null> {
  const supabase = createServerSupabaseClient();

  const { data: maintenance, error } = await supabase
    .from("maintenance")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("id", maintenanceId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message || "Wartung konnte nicht geladen werden.");
  }

  const objects = await listObjectsByOrganization(organizationId);
  const object = maintenance.object_id
    ? objects.find((item) => item.id === maintenance.object_id)
    : null;

  return {
    id: maintenance.id,
    title: maintenance.title,
    objectId: maintenance.object_id ?? null,
    objectLabel: object?.name ?? "Kein Objekt zugeordnet",
    scheduledDate: maintenance.scheduled_date ?? null,
    scheduledDateLabel: formatDate(maintenance.scheduled_date),
    status: maintenance.status,
    statusLabel: mapStatusLabel(maintenance.status),
    note: maintenance.note ?? null,
    noteLabel: maintenance.note ?? "Keine Notiz hinterlegt",
  };
}