import { type NextRequest, NextResponse } from "next/server";
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

/** Refreshes the session and bounces anonymous visitors; role checks live in the (panel) layout. */
export async function proxy(request: NextRequest) {
  const { response, claims } = await updateSession(request);
  const isLoginRoute = request.nextUrl.pathname === "/admin/login";
  const userId = typeof claims?.sub === "string" ? claims.sub : null;

  if (!userId && !isLoginRoute) {
    return redirectWithSession(request, response, "/admin/login");
  }

  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
