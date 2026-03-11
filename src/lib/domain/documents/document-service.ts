import { listDocumentsByOrganization } from "./document-repository";

export type DocumentListItemViewModel = {
  id: string;
  title: string;
  categoryLabel: string;
  targetLabel: string;
  fileName: string;
  fileSizeLabel: string;
  canOpen: boolean;
};

function formatFileSize(bytes: number | null): string {
  if (!bytes || bytes <= 0) {
    return "Unbekannte Dateigröße";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getTargetLabel(targetType: string, targetId: string): string {
  switch (targetType) {
    case "tenant":
      return `Mieter · ${targetId}`;
    case "unit":
      return `Wohneinheit · ${targetId}`;
    case "object":
      return `Objekt · ${targetId}`;
    default:
      return targetId;
  }
}

export async function getDocumentListViewModel(organizationId: string) {
  const documents = await listDocumentsByOrganization(organizationId);

  const items: DocumentListItemViewModel[] = documents.map((document) => ({
    id: document.id,
    title: document.title,
    categoryLabel: document.category ?? "Dokument",
    targetLabel: getTargetLabel(document.target_type, document.target_id),
    fileName: document.file_name,
    fileSizeLabel: formatFileSize(document.file_size),
    canOpen: Boolean(document.file_path),
  }));

  return items;
}