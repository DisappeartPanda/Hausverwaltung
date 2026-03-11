import { listObjectsByOrganization } from "../objects/object-repository";
import { listUnitsByOrganization } from "../units/unit-repository";
import { listTenantsByOrganization } from "../tenants/tenant-repository";
import { listDefectsByOrganization } from "../defects/defect-repository";
import { listMaintenanceByOrganization } from "../maintenance/maintenance-repository";

export type DashboardKpi = {
  label: string;
  value: string;
};

export type DashboardSummaryViewModel = {
  kpis: DashboardKpi[];
};

export async function getDashboardSummaryViewModel(organizationId: string): Promise<DashboardSummaryViewModel> {
  const [objects, units, tenants, defects, maintenance] = await Promise.all([
    listObjectsByOrganization(organizationId),
    listUnitsByOrganization(organizationId),
    listTenantsByOrganization(organizationId),
    listDefectsByOrganization(organizationId),
    listMaintenanceByOrganization(organizationId),
  ]);

  return {
    kpis: [
      {
        label: "Objekte",
        value: String(objects.length),
      },
      {
        label: "Wohneinheiten",
        value: String(units.length),
      },
      {
        label: "Mieter",
        value: String(tenants.length),
      },
      {
        label: "Offene Mängel",
        value: String(defects.filter((defect) => defect.status !== "geschlossen").length),
      },
      {
        label: "Wartungen",
        value: String(maintenance.length),
      },
    ],
  };
}