import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  createAdminSession,
  getAdminPreviewCookieOptions,
  getAdminSessionCookieOptions,
  readAdminSession,
} from "@/lib/admin-auth";
import { verifySession } from "@/lib/auth";
import {
  type Factor,
  clearFailures,
  enrolment,
  gmLevel,
  isEnrolled,
  lockedOut,
  recordFailure,
  requestIp,
  verifyCode,
} from "@/lib/second-factor";

export const dynamic = "force-dynamic";

/*
 * The second factor (lib/second-factor.ts) of the session's administrator (for=admin: the admin space waits for it) or of a game
 * master's game account (for=account: written into auth.account.totp_secret, asked at every game login and website sign-in).
 * GET: the screen's state (status=1: only whether the account may enrol and has), with the QR code to scan before enrolment.
 * POST {code}: enrols with the first valid code, or verifies the administrator's session.
 */

async function subject(factor: Factor) {
  if (factor === "admin") {
    const session = await readAdminSession();

    return session
      ? { id: session.id, label: session.username, admin: session }
      : null;
  }
  const session = await verifySession();

  if (!session || (await gmLevel(session.id)) < 1) return null;

  return { id: session.id, label: session.username, admin: null };
}

const factorOf = (value: string | null | undefined): Factor =>
  value === "account" ? "account" : "admin";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const factor = factorOf(params.get("for"));
    const who = await subject(factor);

    if (params.get("status")) {
      return NextResponse.json({
        allowed: !!who,
        enrolled: !!who && (await isEnrolled(factor, who.id)),
      });
    }
    if (!who) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    if (who.admin?.mfa) {
      return NextResponse.json({ step: "verified" });
    }
    if (await isEnrolled(factor, who.id)) {
      // an administrator types the code of the app enrolled; a game account has nothing more to do here
      return NextResponse.json({
        step: factor === "admin" ? "verify" : "done",
      });
    }

    return NextResponse.json({
      step: "enrol",
      ...(await enrolment(factor, who.id, who.label)),
    });
  } catch (error) {
    console.error("Second factor state:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code, for: forValue } = await request.json();
    const factor = factorOf(forValue);
    const who = await subject(factor);

    if (!who) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // 5 wrong codes in 15 minutes lock the factor, 20 from one IP lock the IP
    const ip = requestIp(request.headers);
    const failures = `totp:${factor}:${who.id}`;
    const locked = await lockedOut(failures, ip);

    if (locked) {
      return NextResponse.json(
        { error: locked === "ip" ? "tooManyAttemptsIp" : "tooManyAttempts" },
        { status: 429 },
      );
    }

    // a game account already protected changes nothing here (its code serves at sign-in)
    if (factor === "account" && (await isEnrolled(factor, who.id))) {
      return NextResponse.json({ success: true, step: "done" });
    }

    const result = await verifyCode(factor, who.id, String(code ?? ""));

    if (result === "invalid") {
      await recordFailure(failures, ip);

      return NextResponse.json({ error: "invalidCode" }, { status: 400 });
    }
    await clearFailures(failures);

    if (who.admin) {
      // the admin session now carries its rights
      const token = await createAdminSession({
        id: who.admin.id,
        username: who.admin.username,
        role: who.admin.role,
        mfa: true,
      });
      const cookieStore = await cookies();

      cookieStore.set(getAdminSessionCookieOptions(token));
      cookieStore.set(getAdminPreviewCookieOptions(true));
    }

    return NextResponse.json({
      success: true,
      step: factor === "admin" ? "verified" : "done",
    });
  } catch (error) {
    console.error("Second factor check:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
