export type MaintenanceCreateInput = {
  title: string;
  objectId?: string;
  scheduledDate?: string;
  status: "offen" | "geplant" | "beauftragt" | "abgeschlossen";
  note?: string;
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

const ALLOWED_STATUSES: MaintenanceCreateInput["status"][] = [
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

export function validateMaintenanceCreateInput(
  input: unknown,
): ValidationResult<MaintenanceCreateInput> {
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
  const scheduledDate = normalizeOptionalString(payload.scheduledDate);
  const note = normalizeOptionalString(payload.note);
  const status =
    typeof payload.status === "string" ? payload.status.trim().toLowerCase() : "offen";

  if (title.length < 3) {
    errors.title = "Bitte gib einen aussagekräftigen Wartungstitel an.";
  }

  if (!ALLOWED_STATUSES.includes(status as MaintenanceCreateInput["status"])) {
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
      title,
      objectId,
      scheduledDate,
      note,
      status: status as MaintenanceCreateInput["status"],
    },
  };
}