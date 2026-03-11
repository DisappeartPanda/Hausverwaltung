import { listMaintenanceByOrganization } from "./maintenance-repository";
import { listObjectsByOrganization } from "../objects/object-repository";

export type MaintenanceListItemViewModel = {
  id: string;
  title: string;
  objectLabel: string;
  scheduledDateLabel: string;
  statusLabel: string;
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

export async function getMaintenanceListViewModel(organizationId: string) {
  const [maintenanceItems, objects] = await Promise.all([
    listMaintenanceByOrganization(organizationId),
    listObjectsByOrganization(organizationId),
  ]);

  const objectsById = new Map(objects.map((object) => [object.id, object]));

  const items: MaintenanceListItemViewModel[] = maintenanceItems.map((item) => {
    const object = item.object_id ? objectsById.get(item.object_id) : null;

    return {
      id: item.id,
      title: item.title,
      objectLabel: object?.name ?? "Kein Objekt zugeordnet",
      scheduledDateLabel: formatDate(item.scheduled_date),
      statusLabel: mapStatusLabel(item.status),
      noteLabel: item.note ?? "Keine Notiz hinterlegt",
    };
  });

  return items;
}