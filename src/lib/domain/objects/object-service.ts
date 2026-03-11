import { listObjectsByOrganization } from "./object-repository";

export type ObjectListItemViewModel = {
  id: string;
  name: string;
  city: string;
  streetLabel: string;
  postalCodeLabel: string;
  unitCountLabel: string;
};

export async function getObjectListViewModel(organizationId: string) {
  const objects = await listObjectsByOrganization(organizationId);

  const items: ObjectListItemViewModel[] = objects.map((object) => ({
    id: object.id,
    name: object.name,
    city: object.city,
    streetLabel: object.street ?? "Keine Straße hinterlegt",
    postalCodeLabel: object.postal_code ?? "Keine PLZ hinterlegt",
    unitCountLabel: `${object.unit_count ?? 0} Einheiten`,
  }));

  return items;
}