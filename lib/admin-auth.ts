import type { ShopAdminJWTPayload } from "@/types";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE, adminSecret } from "@/lib/admin-secret";
import { ADMIN_PREVIEW_COOKIE } from "@/lib/realms";

const secret = adminSecret;

const COOKIE_NAME = ADMIN_SESSION_COOKIE;

export async function createAdminSession(
  payload: ShopAdminJWTPayload,
): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);

  return token;
}

// the admin session as signed in, second factor verified or not (the second-factor screen, /api/admin/auth/me)
export async function readAdminSession(): Promise<ShopAdminJWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    const { payload } = await jwtVerify(token, secret);

    return payload as unknown as ShopAdminJWTPayload;
  } catch {
    return null;
  }
}

// an administrator's session: the admin rights count only once the second factor is verified (majaliss's principle, 13/10/2026)
export async function verifyAdminSession(): Promise<ShopAdminJWTPayload | null> {
  const session = await readAdminSession();

  return session?.mfa ? session : null;
}

// the answer of an admin route without rights: 403 mfa_required for a session waiting for its code (the admin space then opens the
// second-factor screen), 401 otherwise
export async function adminUnauthorized() {
  return (await readAdminSession())
    ? NextResponse.json({ error: "mfa_required" }, { status: 403 })
    : NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

export function getAdminSessionCookieOptions(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  };
}

// the pages' hint of an administrator's view of the realms (lib/realms.ts realmView), as long as the session
export function getAdminPreviewCookieOptions(on: boolean) {
  return {
    name: ADMIN_PREVIEW_COOKIE,
    value: on ? "1" : "",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: on ? 60 * 60 * 8 : 0,
    path: "/",
  };
}
