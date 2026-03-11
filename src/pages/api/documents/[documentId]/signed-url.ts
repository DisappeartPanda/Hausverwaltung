import type { APIRoute } from "astro";
import { createServiceRoleSupabaseClient } from "../../../../lib/supabase/server";
import { createDocumentSignedUrl } from "../../../../lib/storage/document-storage";
import { requireLandlordSession } from "../../../../lib/auth/guards";

export const GET: APIRoute = async (context) => {
  try {
    const session = await requireLandlordSession(context as any);

    if (session instanceof Response) {
      return session;
    }

    const { documentId } = context.params;

    if (!documentId) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: {
            form: "Dokument-ID fehlt.",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createServiceRoleSupabaseClient();

    const { data: document, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .eq("organization_id", session.organizationId)
      .single();

    if (error || !document) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: {
            form: error?.message || "Dokument nicht gefunden.",
          },
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (!document.file_path) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: {
            form: "Für dieses Dokument ist kein Dateipfad hinterlegt.",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const signedUrl = await createDocumentSignedUrl(document.file_path);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          signedUrl,
        },
      }),
      {
        status: 200,
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
              : "Signed URL konnte nicht erzeugt werden.",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};