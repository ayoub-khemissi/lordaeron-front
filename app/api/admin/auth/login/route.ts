import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

import {
  createAdminSession,
  getAdminPreviewCookieOptions,
  getAdminSessionCookieOptions,
} from "@/lib/admin-auth";
import {
  findAdminByUsername,
  updateAdminLastLogin,
} from "@/lib/queries/shop-admin";
import {
  clearFailures,
  isEnrolled,
  lockedOut,
  recordFailure,
  requestIp,
} from "@/lib/second-factor";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "missingCredentials" },
        { status: 400 },
      );
    }

    // 5 failures of one name or 20 of one IP in 15 minutes lock the sign-in (lib/second-factor.ts)
    const ip = requestIp(request.headers);
    const subject = `admin-login:${String(username).toLowerCase()}`;
    const locked = await lockedOut(subject, ip);

    if (locked) {
      return NextResponse.json(
        { error: locked === "ip" ? "tooManyAttemptsIp" : "tooManyAttempts" },
        { status: 429 },
      );
    }

    const admin = await findAdminByUsername(username);
    const valid =
      !!admin && (await bcrypt.compare(password, admin.password_hash));

    if (!admin || !valid) {
      await recordFailure(subject, ip);

      return NextResponse.json(
        { error: "invalidCredentials" },
        { status: 401 },
      );
    }
    await clearFailures(subject);

    // the session carries no admin rights until the second factor is verified (/verification-2fa)
    const token = await createAdminSession({
      id: admin.id,
      username: admin.username,
      role: admin.role,
      mfa: false,
    });

    await updateAdminLastLogin(admin.id);

    const cookieStore = await cookies();

    cookieStore.set(getAdminSessionCookieOptions(token));
    cookieStore.set(getAdminPreviewCookieOptions(false));

    return NextResponse.json({
      success: true,
      // the next screen: enrol an authenticator app, or type its code
      mfa: (await isEnrolled("admin", admin.id)) ? "verify" : "enrol",
      admin: {
        id: admin.id,
        username: admin.username,
        display_name: admin.display_name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
