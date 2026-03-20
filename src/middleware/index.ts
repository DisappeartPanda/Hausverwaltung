import { defineMiddleware } from "astro:middleware";
import { createServerSupabaseClient } from "../lib/supabase/server";
import { ROUTES } from "../lib/constants/routes";

// Öffentliche Routen die keinen Login brauchen
const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/register", 
  "/auth/forgot-password",
  "/auth/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/refresh",
];

// Statische Assets
const STATIC_ASSETS = [
  "/_astro/",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, request } = context;
  const pathname = url.pathname;

  // Static Assets ignorieren
  if (STATIC_ASSETS.some(prefix => pathname.startsWith(prefix))) {
    return next();
  }

  // Öffentliche Routen erlauben
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + "/"))) {
    return next();
  }

  // API-Routen (außer auth) prüfen
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
    const supabase = createServerSupabaseClient(cookies);
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Nicht autorisiert" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    context.locals.user = user;
    return next();
  }

  // Seiten-Routen prüfen
  const supabase = createServerSupabaseClient(cookies);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    // Zurück zur Login-Seite mit Return-URL
    const returnUrl = encodeURIComponent(pathname);
    return Response.redirect(new URL(`${ROUTES.AUTH_LOGIN}?returnTo=${returnUrl}`, url));
  }

  // User in Context speichern für Components
  context.locals.user = user;

  // Rolle prüfen für Tenant-Routen
  if (pathname.startsWith("/app/tenant")) {
    const role = user.app_metadata?.role || user.user_metadata?.role;
    if (role !== "tenant") {
      return Response.redirect(new URL(ROUTES.APP_DASHBOARD, url));
    }
  }

  // Landlord-Routen prüfen
  if (pathname.startsWith("/app/") && !pathname.startsWith("/app/tenant")) {
    const role = user.app_metadata?.role || user.user_metadata?.role;
    if (role === "tenant") {
      return Response.redirect(new URL("/app/tenant", url));
    }
  }

  return next();
});