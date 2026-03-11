import type { APIRoute } from "astro";
import { createMaintenance } from "../../../lib/domain/maintenance/maintenance-repository";
import { validateMaintenanceCreateInput } from "../../../validations/maintenance";

const DEMO_ORGANIZATION_ID = "11111111-1111-1111-1111-111111111111";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const result = validateMaintenanceCreateInput(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: result.errors,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const maintenanceData = result.data;

    const createdMaintenance = await createMaintenance({
      organization_id: DEMO_ORGANIZATION_ID,
      object_id: maintenanceData.objectId ?? null,
      title: maintenanceData.title,
      scheduled_date: maintenanceData.scheduledDate ?? null,
      status: maintenanceData.status,
      note: maintenanceData.note ?? null,
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: createdMaintenance,
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        errors: {
          form:
            error instanceof Error
              ? error.message
              : "Wartung konnte nicht erstellt werden.",
        },
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};