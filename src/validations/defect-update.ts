import type { ValidationResult } from "../types/validation";

export type DefectUpdateInput = {
  defectId: string;
  title: string;
  level: "building" | "unit";
  status: "offen" | "in_bearbeitung" | "geplant" | "geschlossen";
  description?: string;
  objectId?: string;
  unitId?: string;
};

const ALLOWED_LEVELS: DefectUpdateInput["level"][] = ["building", "unit"];
const ALLOWED_STATUSES: DefectUpdateInput["status"][] = [
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

export function validateDefectUpdateInput(
  input: unknown,
): ValidationResult<DefectUpdateInput> {
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

  const defectId = typeof payload.defectId === "string" ? payload.defectId.trim() : "";
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const level = typeof payload.level === "string" ? payload.level.trim() : "";
  const status = typeof payload.status === "string" ? payload.status.trim() : "";
  const description = normalizeOptionalString(payload.description);
  const objectId = normalizeOptionalString(payload.objectId);
  const unitId = normalizeOptionalString(payload.unitId);

  if (!defectId) {
    errors.defectId = "Bitte gib einen gültigen Mangel an.";
  }

  if (title.length < 3) {
    errors.title = "Bitte gib einen aussagekräftigen Titel an.";
  }

  if (!ALLOWED_LEVELS.includes(level as DefectUpdateInput["level"])) {
    errors.level = "Bitte wähle eine gültige Ebene.";
  }

  if (!ALLOWED_STATUSES.includes(status as DefectUpdateInput["status"])) {
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
      defectId,
      title,
      level: level as DefectUpdateInput["level"],
      status: status as DefectUpdateInput["status"],
      description,
      objectId,
      unitId,
    },
  };
}