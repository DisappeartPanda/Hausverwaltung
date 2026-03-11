import type { ValidationResult } from "../types/validation";

export type MaintenanceUpdateInput = {
  maintenanceId: string;
  title: string;
  objectId?: string;
  scheduledDate?: string;
  status: "offen" | "geplant" | "beauftragt" | "abgeschlossen";
  note?: string;
};

const ALLOWED_STATUSES: MaintenanceUpdateInput["status"][] = [
  "offen",
  "geplant",
  "beauftragt",
  "abgeschlossen",
];

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function isValidDateString(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

export function validateMaintenanceUpdateInput(
  input: unknown,
): ValidationResult<MaintenanceUpdateInput> {
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

  const maintenanceId =
    typeof payload.maintenanceId === "string" ? payload.maintenanceId.trim() : "";
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const objectId = normalizeOptionalString(payload.objectId);
  const scheduledDate = normalizeOptionalString(payload.scheduledDate);
  const note = normalizeOptionalString(payload.note);
  const status =
    typeof payload.status === "string" ? payload.status.trim().toLowerCase() : "";

  if (!maintenanceId) {
    errors.maintenanceId = "Bitte gib eine gültige Wartung an.";
  }

  if (title.length < 3) {
    errors.title = "Bitte gib einen aussagekräftigen Wartungstitel an.";
  }

  if (!ALLOWED_STATUSES.includes(status as MaintenanceUpdateInput["status"])) {
    errors.status = "Bitte wähle einen gültigen Status.";
  }

  if (scheduledDate && !isValidDateString(scheduledDate)) {
    errors.scheduledDate = "Bitte gib ein gültiges Datum an.";
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
      maintenanceId,
      title,
      objectId,
      scheduledDate,
      note,
      status: status as MaintenanceUpdateInput["status"],
    },
  };
}