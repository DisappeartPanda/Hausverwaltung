import type { APIRoute } from "astro";
import { DEFAULT_THEME } from "../../../lib/themes/theme-definitions";
import { resolveThemeKey } from "../../../lib/themes/theme-resolver";

const COOKIE_NAME = "immobilienpro-theme";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const theme = resolveThemeKey(body?.theme);

    cookies.set(COOKIE_NAME, theme, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      secure: import.meta.env.PROD,
      maxAge: 60 * 60 * 24 * 365,
    });

    return new Response(
      JSON.stringify({
        success: true,
        theme,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        theme: DEFAULT_THEME,
        message: "Theme konnte nicht gespeichert werden.",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};