import { jwtVerify } from "jose";

// the admin sessions' key, shared by lib/admin-auth.ts and the middleware
export const adminSecret = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "changeme-admin-secret-key-2024",
);

export const ADMIN_SESSION_COOKIE = "lordaeron_admin_session";

export async function isAdminToken(token: string | undefined) {
  if (!token) return false;
  try {
    await jwtVerify(token, adminSecret);

    return true;
  } catch {
    return false;
  }
}
