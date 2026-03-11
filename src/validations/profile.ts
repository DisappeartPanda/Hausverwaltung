import type { ValidationResult } from "../types/validation";

export type ProfileUpdateInput = {
  firstName: string;
  lastName: string;
  email: string;
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateProfileUpdateInput(
  input: unknown,
): ValidationResult<ProfileUpdateInput> {
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

  const firstName =
    typeof payload.firstName === "string" ? payload.firstName.trim() : "";
  const lastName =
    typeof payload.lastName === "string" ? payload.lastName.trim() : "";
  const email =
    typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";

  if (firstName.length < 2) {
    errors.firstName = "Bitte gib einen gültigen Vornamen an.";
  }

  if (lastName.length < 2) {
    errors.lastName = "Bitte gib einen gültigen Nachnamen an.";
  }

  if (!isValidEmail(email)) {
    errors.email = "Bitte gib eine gültige E-Mail-Adresse an.";
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
    },
  };
}