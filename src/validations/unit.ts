import type { ValidationResult } from "../types/validation";

export type UnitCreateInput = {
  title: string;
  objectId?: string;
  status: "frei" | "vermietet" | "reserviert";
};

const ALLOWED_STATUSES: UnitCreateInput["status"][] = [
  "frei",
  "vermietet",
  "reserviert",
];

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function validateUnitCreateInput(
  input: unknown,
): ValidationResult<UnitCreateInput> {
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

  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const objectId = normalizeOptionalString(payload.objectId);
  const status =
    typeof payload.status === "string" ? payload.status.trim().toLowerCase() : "";

  if (title.length < 2) {
    errors.title = "Bitte gib eine gültige Bezeichnung an.";
  }

  if (!objectId) {
    errors.objectId = "Bitte wähle ein Objekt aus.";
  }

  if (!ALLOWED_STATUSES.includes(status as UnitCreateInput["status"])) {
    errors.status = "Bitte wähle einen gültigen Status.";
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
      title,
      objectId,
      status: status as UnitCreateInput["status"],
    },
  };
}