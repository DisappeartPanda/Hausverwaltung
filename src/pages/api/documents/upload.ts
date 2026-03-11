import type { APIRoute } from "astro";
import { createDocument } from "../../../lib/domain/documents/document-repository";
import { uploadDocumentToStorage } from "../../../lib/storage/document-storage";
import { requireLandlordSession } from "../../../lib/auth/guards";

function normalizeOptionalString(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function isAllowedMimeType(type: string): boolean {
  const allowed = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp",
    "text/plain",
  ];

  return allowed.includes(type);
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const POST: APIRoute = async (context) => {
  try {
    const session = await requireLandlordSession(context as any);

    if (session instanceof Response) {
      return session;
    }

    const organizationId = session.organizationId;

    if (!organizationId) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: {
            form: "Keine Organisation gefunden.",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const formData = await context.request.formData();

    const title = normalizeOptionalString(formData.get("title"));
    const category = normalizeOptionalString(formData.get("category"));
    const targetType = normalizeOptionalString(formData.get("targetType"));
    const targetId = normalizeOptionalString(formData.get("targetId"));
    const file = formData.get("file");

    const errors: Record<string, string> = {};

    if (!title || title.length < 3) {
      errors.title = "Bitte gib einen gültigen Titel an.";
    }

    if (!category) {
      errors.category = "Bitte wähle eine Kategorie.";
    }

    if (!targetType) {
      errors.targetType = "Bitte wähle einen Zieltyp.";
    }

    if (!targetId) {
      errors.targetId = "Bitte gib ein Ziel an.";
    }

    if (!(file instanceof File) || file.size === 0) {
      errors.file = "Bitte wähle eine Datei aus.";
    } else {
      if (file.size > MAX_FILE_SIZE) {
        errors.file = "Die Datei darf maximal 10 MB groß sein.";
      } else if (!isAllowedMimeType(file.type)) {
        errors.file = "Dieser Dateityp ist nicht erlaubt.";
      }
    }

    if (Object.keys(errors).length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const uploadedFile = await uploadDocumentToStorage({
      organizationId,
      targetType: targetType!,
      targetId: targetId!,
      file: file as File,
    });

    const createdDocument = await createDocument({
      organization_id: organizationId,
      target_type: targetType!,
      target_id: targetId!,
      title: title!,
      category: category ?? null,
      file_name: uploadedFile.name,
      file_path: uploadedFile.path,
      file_size: uploadedFile.size,
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: createdDocument,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
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
              : "Dokument konnte nicht hochgeladen werden.",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};