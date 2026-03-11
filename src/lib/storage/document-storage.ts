import { createServiceRoleSupabaseClient } from "../supabase/server";
import { SUPABASE_DOCUMENTS_BUCKET } from "../../env/server";

export type UploadedDocumentFile = {
  path: string;
  size: number;
  name: string;
};

function sanitizeFileName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function getExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop() ?? "" : "";
}

export function buildDocumentStoragePath(args: {
  organizationId: string;
  targetType: string;
  targetId: string;
  originalFileName: string;
}) {
  const extension = getExtension(args.originalFileName);
  const safeName = sanitizeFileName(
    args.originalFileName.replace(/\.[^.]+$/, ""),
  );
  const uniqueSuffix = crypto.randomUUID();

  const fileName = extension
    ? `${safeName}-${uniqueSuffix}.${extension}`
    : `${safeName}-${uniqueSuffix}`;

  return `${args.organizationId}/${args.targetType}/${args.targetId}/${fileName}`;
}

export async function uploadDocumentToStorage(args: {
  organizationId: string;
  targetType: string;
  targetId: string;
  file: File;
}): Promise<UploadedDocumentFile> {
  const supabase = createServiceRoleSupabaseClient();

  const path = buildDocumentStoragePath({
    organizationId: args.organizationId,
    targetType: args.targetType,
    targetId: args.targetId,
    originalFileName: args.file.name,
  });

  const arrayBuffer = await args.file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage
    .from(SUPABASE_DOCUMENTS_BUCKET)
    .upload(path, fileBuffer, {
      contentType: args.file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message || "Datei konnte nicht in Storage hochgeladen werden.");
  }

  return {
    path,
    size: args.file.size,
    name: args.file.name,
  };
}

export async function createDocumentSignedUrl(path: string, expiresIn = 60 * 10) {
  const supabase = createServiceRoleSupabaseClient();

  const { data, error } = await supabase.storage
    .from(SUPABASE_DOCUMENTS_BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message || "Signed URL konnte nicht erstellt werden.");
  }

  return data.signedUrl;
}