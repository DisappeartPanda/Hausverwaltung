import { listDefectsByOrganization } from "./defect-repository";
import { listObjectsByOrganization } from "../objects/object-repository";
import { listUnitsByOrganization } from "../units/unit-repository";

export type DefectListItemViewModel = {
  id: string;
  title: string;
  statusLabel: string;
  levelLabel: string;
  locationLabel: string;
  descriptionLabel: string;
};

function mapStatusLabel(status: string): string {
  switch (status) {
    case "offen":
      return "Offen";
    case "in_bearbeitung":
      return "In Bearbeitung";
    case "geplant":
      return "Geplant";
    case "geschlossen":
      return "Geschlossen";
    default:
      return status;
  }
}

function mapLevelLabel(level: string): string {
  switch (level) {
    case "building":
      return "Gebäude";
    case "unit":
      return "Wohneinheit";
    default:
      return level;
  }
}

export async function getDefectListViewModel(organizationId: string) {
  const [defects, objects, units] = await Promise.all([
    listDefectsByOrganization(organizationId),
    listObjectsByOrganization(organizationId),
    listUnitsByOrganization(organizationId),
  ]);

  const objectsById = new Map(objects.map((object) => [object.id, object]));
  const unitsById = new Map(units.map((unit) => [unit.id, unit]));

  const items: DefectListItemViewModel[] = defects.map((defect) => {
    const object = defect.object_id ? objectsById.get(defect.object_id) : null;
    const unit = defect.unit_id ? unitsById.get(defect.unit_id) : null;

    const locationLabel =
      unit?.title ??
      object?.name ??
      "Keine Zuordnung";

    return {
      id: defect.id,
      title: defect.title,
      statusLabel: mapStatusLabel(defect.status),
      levelLabel: mapLevelLabel(defect.level),
      locationLabel,
      descriptionLabel: defect.description ?? "Keine Beschreibung hinterlegt",
    };
  });

  return items;
}