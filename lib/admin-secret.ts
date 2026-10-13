import { jwtVerify } from "jose";

// the admin sessions' key, shared by lib/admin-auth.ts and the middleware
export const adminSecret = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "changeme-admin-secret-key-2024",
);

export const ADMIN_SESSION_COOKIE = "lordaeron_admin_session";

// an administrator's session with its second factor verified (lib/admin-auth.ts verifyAdminSession)
export async function isAdminToken(token: string | undefined) {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, adminSecret);

    return payload.mfa === true;
  } catch {
    return false;
  }
}
