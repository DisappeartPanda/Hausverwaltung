export type TenantCreateInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  unitId?: string;
  moveInDate?: string;
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

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidDateString(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

export function validateTenantCreateInput(input: unknown): ValidationResult<TenantCreateInput> {
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

  const firstName = typeof payload.firstName === "string" ? payload.firstName.trim() : "";
  const lastName = typeof payload.lastName === "string" ? payload.lastName.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const phone = normalizeOptionalString(payload.phone);
  const unitId = normalizeOptionalString(payload.unitId);
  const moveInDate = normalizeOptionalString(payload.moveInDate);

  if (firstName.length < 2) {
    errors.firstName = "Bitte gib einen gültigen Vornamen an.";
  }

  if (lastName.length < 2) {
    errors.lastName = "Bitte gib einen gültigen Nachnamen an.";
  }

  if (!isValidEmail(email)) {
    errors.email = "Bitte gib eine gültige E-Mail-Adresse an.";
  }

  if (moveInDate && !isValidDateString(moveInDate)) {
    errors.moveInDate = "Bitte gib ein gültiges Einzugsdatum an.";
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
      firstName,
      lastName,
      email,
      phone,
      unitId,
      moveInDate,
    },
  };
}