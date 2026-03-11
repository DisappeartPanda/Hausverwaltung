import type { APIRoute } from "astro";
import { createUnit } from "../../../lib/domain/units/unit-repository";
import { validateUnitCreateInput } from "../../../validations/unit";

const DEMO_ORGANIZATION_ID = "11111111-1111-1111-1111-111111111111";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const result = validateUnitCreateInput(body);

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

    const unitData = result.data;

    const createdUnit = await createUnit({
      organization_id: DEMO_ORGANIZATION_ID,
      object_id: unitData.objectId ?? null,
      title: unitData.title,
      status: unitData.status,
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: createdUnit,
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
              : "Wohneinheit konnte nicht erstellt werden.",
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