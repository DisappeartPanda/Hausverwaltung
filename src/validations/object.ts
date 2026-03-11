export type ObjectCreateInput = {
  name: string;
  city: string;
  street?: string;
  postalCode?: string;
  unitCount?: number;
};

export type ValidationResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      errors: Record<string, string>;
    };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;

  const numericValue =
    typeof value === "number" ? value : Number(String(value).trim());

  if (!Number.isFinite(numericValue)) return undefined;
  return numericValue;
}

export function validateObjectCreateInput(input: unknown): ValidationResult<ObjectCreateInput> {
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

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const city = typeof payload.city === "string" ? payload.city.trim() : "";
  const street = normalizeOptionalString(payload.street);
  const postalCode = normalizeOptionalString(payload.postalCode);
  const unitCount = normalizeOptionalNumber(payload.unitCount);

  if (!isNonEmptyString(name)) {
    errors.name = "Bitte gib einen Objektnamen an.";
  } else if (name.length < 3) {
    errors.name = "Der Objektname muss mindestens 3 Zeichen lang sein.";
  }

  if (!isNonEmptyString(city)) {
    errors.city = "Bitte gib einen Ort an.";
  }

  if (unitCount !== undefined) {
    if (!Number.isInteger(unitCount) || unitCount < 0) {
      errors.unitCount = "Die Anzahl der Einheiten muss eine positive ganze Zahl sein.";
    }
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
      name,
      city,
      street,
      postalCode,
      unitCount,
    },
  };
}