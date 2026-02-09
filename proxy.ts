// Middleware giving frontend access to loged in users to private access
// and not loged out users public access (login or sign up page)

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./app/lib/session";

const protectedRoutes = ["/", "/account", "/settings", "/conversation"];
const publicRoutes = ["/login", "/signup"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      path === route || (route !== "/" && path.startsWith(`${route}/`)),
  );
  const isPublicRoute = publicRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`),
  );

  if (path.startsWith("/api/authuser") || path.startsWith("/signup")) {
    return NextResponse.next();
  }

  const cookie = await cookies();
  const session = cookie.get("session")?.value;
  const sessionUser = await decrypt(session);

  if (isProtectedRoute && !sessionUser?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isPublicRoute && sessionUser?.userId) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // deal with headers
  const incoming = new Headers(req.headers);
  const forwarded = new Headers();

  for (const [name, value] of incoming) {
    const headerName = name.toLowerCase();
    // Keep only known-safe headers, discard custom x-* and other sensitive ones
    if (
      !headerName.startsWith("x-") &&
      headerName !== "authorization" &&
      headerName !== "cookie"
    ) {
      // Preserve original header name casing
      forwarded.set(name, value);
    }
  }

  return NextResponse.next({
    headers: forwarded,
  });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
