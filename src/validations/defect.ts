import type { ValidationResult } from "../types/validation";

export type DefectCreateInput = {
  title: string;
  level: "building" | "unit";
  status: "offen" | "in_bearbeitung" | "geplant" | "geschlossen";
  description?: string;
  objectId?: string;
  unitId?: string;
};

const ALLOWED_LEVELS: DefectCreateInput["level"][] = ["building", "unit"];
const ALLOWED_STATUSES: DefectCreateInput["status"][] = [
  "offen",
  "in_bearbeitung",
  "geplant",
  "geschlossen",
];

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function validateDefectCreateInput(
  input: unknown,
): ValidationResult<DefectCreateInput> {
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
  const level = typeof payload.level === "string" ? payload.level.trim() : "";
  const status = typeof payload.status === "string" ? payload.status.trim() : "";
  const description = normalizeOptionalString(payload.description);
  const objectId = normalizeOptionalString(payload.objectId);
  const unitId = normalizeOptionalString(payload.unitId);

  if (title.length < 3) {
    errors.title = "Bitte gib einen aussagekräftigen Titel an.";
  }

  if (!ALLOWED_LEVELS.includes(level as DefectCreateInput["level"])) {
    errors.level = "Bitte wähle eine gültige Ebene.";
  }

  if (!ALLOWED_STATUSES.includes(status as DefectCreateInput["status"])) {
    errors.status = "Bitte wähle einen gültigen Status.";
  }

  if (level === "building" && !objectId) {
    errors.objectId = "Bitte gib ein Objekt an.";
  }

  if (level === "unit" && !unitId) {
    errors.unitId = "Bitte gib eine Wohneinheit an.";
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
      level: level as DefectCreateInput["level"],
      status: status as DefectCreateInput["status"],
      description,
      objectId,
      unitId,
    },
  };
}