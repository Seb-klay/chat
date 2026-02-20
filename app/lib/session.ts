import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { cache } from "react";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(userId: string) {
  if (!userId) return;
  
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, expiresAt });

  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: false,
    expires: expiresAt,
    path: "/",
    sameSite: "lax",
  });
};

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)
 
  if (!session?.userId) {
    return undefined
  };
 
  return { userId: session.userId }
})

export async function deleteSession() {
  (await cookies()).delete("session");
};

type SessionPayload = {
  userId: string;
  expiresAt: Date;
};

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
};

export async function decrypt(session: string | undefined = "") {
  if (!session) return undefined;
  try {
    const { payload } = await jwtVerify(String(session), encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    throw new Error("Failed to verify session. " + error);
  }
};