import type { APIRoute } from "astro";
import { createDefect } from "../../../lib/domain/defects/defect-repository";
import { validateDefectCreateInput } from "../../../validations/defect";

const DEMO_ORGANIZATION_ID = "11111111-1111-1111-1111-111111111111";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const result = validateDefectCreateInput(body);

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

    const defectData = result.data;

    const createdDefect = await createDefect({
      organization_id: DEMO_ORGANIZATION_ID,
      object_id: defectData.objectId ?? null,
      unit_id: defectData.unitId ?? null,
      title: defectData.title,
      level: defectData.level,
      status: defectData.status,
      description: defectData.description ?? null,
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: createdDefect,
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
              : "Mangel konnte nicht erstellt werden.",
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