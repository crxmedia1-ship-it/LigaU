import { type NextRequest, NextResponse } from "next/server";
import {
  isCoordinator,
  isStaffRole,
  isSuperadmin,
  type UserRole,
} from "@/lib/auth/roles";
import {
  applySessionCookies,
  updateSession,
} from "@/lib/supabase/middleware";

function redirectWithSession(
  request: NextRequest,
  sessionResponse: NextResponse,
  pathname: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return applySessionCookies(sessionResponse, NextResponse.redirect(url));
}

export async function proxy(request: NextRequest) {
  const { supabase, response, claims } = await updateSession(request);
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/admin/login";
  const userId = typeof claims?.sub === "string" ? claims.sub : null;

  if (!userId) {
    if (isLoginRoute) {
      return response;
    }
    return redirectWithSession(request, response, "/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  const role = (profile?.role ?? null) as UserRole | null;

  if (!isStaffRole(role)) {
    if (isLoginRoute) {
      return response;
    }
    return redirectWithSession(request, response, "/admin/login");
  }

  if (isLoginRoute || pathname === "/admin") {
    return redirectWithSession(request, response, "/admin/partidos");
  }

  const isCommercialRoute =
    pathname === "/admin/comercial" || pathname.startsWith("/admin/comercial/");

  if (isCommercialRoute && isCoordinator(role) && !isSuperadmin(role)) {
    return redirectWithSession(request, response, "/admin/partidos");
  }

  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
