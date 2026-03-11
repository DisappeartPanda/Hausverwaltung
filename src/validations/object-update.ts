import type { ValidationResult } from "../types/validation";

export type ObjectUpdateInput = {
  objectId: string;
  name: string;
  city: string;
  street?: string;
  postalCode?: string;
};

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function validateObjectUpdateInput(
  input: unknown,
): ValidationResult<ObjectUpdateInput> {
  const errors: Record<string, string> = {};

  if (typeof input !== "object" || input === null) {
    return {
      success: false,
      errors: {
        form: "Ungültige Eingabedaten.",
      },
    };
  }

  const payload = input as Record<string, unknown>;

  const objectId =
    typeof payload.objectId === "string" ? payload.objectId.trim() : "";
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const city = typeof payload.city === "string" ? payload.city.trim() : "";
  const street = normalizeOptionalString(payload.street);
  const postalCode = normalizeOptionalString(payload.postalCode);

  if (!objectId) {
    errors.objectId = "Bitte gib ein gültiges Objekt an.";
  }

  if (name.length < 3) {
    errors.name = "Der Objektname muss mindestens 3 Zeichen lang sein.";
  }

  if (city.length < 2) {
    errors.city = "Bitte gib einen gültigen Ort an.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data: {
      objectId,
      name,
      city,
      street,
      postalCode,
    },
  };
}