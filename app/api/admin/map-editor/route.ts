import { NextResponse } from "next/server";
import { SignJWT } from "jose";

import { adminUnauthorized, verifyAdminSession } from "@/lib/admin-auth";
import { adminSecret } from "@/lib/admin-secret";

// The map editor (mapper.lordaeron.eu, the map-editor repository) opened from the admin space: an administrator whose second factor
// is verified gets a token of 60 seconds for the editor's /auth/callback, signed with the admin sessions' key, for its audience only;
// the editor then keeps its own session.
const EDITOR_URL = process.env.MAP_EDITOR_URL || "https://mapper.lordaeron.eu";

export async function GET() {
  const session = await verifyAdminSession();

  if (!session) return adminUnauthorized();
  const token = await new SignJWT({
    id: session.id,
    username: session.username,
    role: session.role,
    mfa: true,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience("lordaeron-map-editor")
    .setIssuedAt()
    .setExpirationTime("60s")
    .sign(adminSecret);

  return NextResponse.redirect(
    `${EDITOR_URL}/auth/callback?token=${encodeURIComponent(token)}`,
    303,
  );
}
