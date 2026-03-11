import type { APIRoute } from "astro";
import { createObject } from "../../../lib/domain/objects/object-repository";
import { validateObjectCreateInput } from "../../../validations/object";

const DEMO_ORGANIZATION_ID = "11111111-1111-1111-1111-111111111111";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const result = validateObjectCreateInput(body);

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

    const objectData = result.data;

    const createdObject = await createObject({
      organization_id: DEMO_ORGANIZATION_ID,
      name: objectData.name,
      city: objectData.city,
      street: objectData.street ?? null,
      postal_code: objectData.postalCode ?? null,
      unit_count: objectData.unitCount ?? null,
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: createdObject,
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
              : "Objekt konnte nicht erstellt werden.",
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