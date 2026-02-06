// Middleware giving frontend access to loged in users to private access
// and not loged out users public access (login or sign up page)

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./app/lib/session";

const protectedRoutes = ["/main"]; // main is just for testing purpose
const publicRoutes = ["/login", "signup", "account"];

export default async function proxy(req: NextRequest) {
  const cookie = await cookies();
  const session = cookie.get("session")?.value;
  const sessionUser = await decrypt(session);

  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  if (isProtectedRoute && !sessionUser?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isPublicRoute && sessionUser?.userId) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // deal with headers 
  const incoming = new Headers(req.headers)
  const forwarded = new Headers()

  for (const [name, value] of incoming) {
    const headerName = name.toLowerCase()
    // Keep only known-safe headers, discard custom x-* and other sensitive ones
    if (
      !headerName.startsWith('x-') &&
      headerName !== 'authorization' &&
      headerName !== 'cookie'
    ) {
      // Preserve original header name casing
      forwarded.set(name, value)
    }
  }

  return NextResponse.next();
}

export const config = { matcher: [
    {
      source: '/api/:path*',
    },
  ]}
