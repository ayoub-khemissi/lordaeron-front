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
  removeAccountFactor,
  requestIp,
  verifyCode,
} from "@/lib/second-factor";
import { deliverRewards, rewardState } from "@/lib/second-factor-reward";
import { notifySecondFactor } from "@/lib/account-email";

export const dynamic = "force-dynamic";

/*
 * The second factor (lib/second-factor.ts) of the session's administrator (for=admin: the admin space waits for it) or of the signed-in
 * player's game account (for=account: written into auth.account.totp_secret, asked at every game login and website sign-in; game
 * masters are told it matters most). The account's reward: lib/second-factor-reward.ts, the Core Hound Pup mailed to each of its
 * characters (at once after the enrolment, then by the cron).
 * GET: the screen's state (status=1: whether the account may enrol, has, is a game master, and its reward), with the QR code to scan
 * before enrolment.
 * POST {code}: enrols with the first valid code, or verifies the administrator's session.
 * DELETE {code}: removes the game account's factor with its current code.
 */

async function subject(factor: Factor) {
  if (factor === "admin") {
    const session = await readAdminSession();

    return session
      ? { id: session.id, label: session.username, admin: session }
      : null;
  }
  const session = await verifySession();

  if (!session) return null;

  return { id: session.id, label: session.username, admin: null };
}

// what the account screen and card show beside the factor: game master or player, and the reward
async function accountExtras(id: number) {
  return { gm: (await gmLevel(id)) >= 1, reward: await rewardState(id) };
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
        ...(who && factor === "account" ? await accountExtras(who.id) : {}),
      });
    }
    if (!who) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    if (who.admin?.mfa) {
      return NextResponse.json({ step: "verified" });
    }
    const extras = factor === "account" ? await accountExtras(who.id) : {};

    if (await isEnrolled(factor, who.id)) {
      // an administrator types the code of the app enrolled; a game account has nothing more to do here (but its reward)
      return NextResponse.json({
        step: factor === "admin" ? "verify" : "done",
        ...extras,
      });
    }

    return NextResponse.json({
      step: "enrol",
      ...extras,
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
    // a game account just protected: its owner is told by e-mail (a stolen session enrolling its own phone shows)
    if (factor === "account" && result === "enrolled")
      void notifySecondFactor(who.id, true);

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

    // a game account just protected: its characters receive their pup now rather than at the cron's next run
    const rewards =
      factor === "account"
        ? await deliverRewards({ accountId: who.id }).catch((error) => {
            console.error("Second factor rewards after enrolment:", error);

            return null;
          })
        : null;

    return NextResponse.json({
      success: true,
      step: factor === "admin" ? "verified" : "done",
      ...(rewards ? { rewardsSent: rewards.sent } : {}),
    });
  } catch (error) {
    console.error("Second factor check:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const { code } = await request.json();
    const ip = requestIp(request.headers);
    const failures = `totp:account:${session.id}`;
    const locked = await lockedOut(failures, ip);

    if (locked) {
      return NextResponse.json(
        { error: locked === "ip" ? "tooManyAttemptsIp" : "tooManyAttempts" },
        { status: 429 },
      );
    }
    if (!(await isEnrolled("account", session.id))) {
      return NextResponse.json({ success: true, enrolled: false });
    }
    if (!(await removeAccountFactor(session.id, String(code ?? "").trim()))) {
      await recordFailure(failures, ip);

      return NextResponse.json({ error: "invalidCode" }, { status: 400 });
    }
    await clearFailures(failures);
    void notifySecondFactor(session.id, false);

    return NextResponse.json({ success: true, enrolled: false });
  } catch (error) {
    console.error("Second factor removal:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
