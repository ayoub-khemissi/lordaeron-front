import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifyLogin } from "@/lib/srp6";
import { createSession, getSessionCookieOptions } from "@/lib/auth";
import { findAccountByUsername } from "@/lib/queries/account";
import {
  clearFailures,
  isEnrolled,
  lockedOut,
  recordFailure,
  requestIp,
  verifyCode,
} from "@/lib/second-factor";

export async function POST(request: NextRequest) {
  try {
    const { username, password, code } = await request.json();

    if (!username) {
      return NextResponse.json({ error: "usernameRequired" }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ error: "passwordRequired" }, { status: 400 });
    }

    // the website's sign-in bypasses the authserver's WrongPass: 5 failures of one account or 20 of one IP in 15 minutes lock it
    const ip = requestIp(request.headers);
    const subject = `login:${String(username).toUpperCase()}`;
    const locked = await lockedOut(subject, ip);

    if (locked) {
      return NextResponse.json(
        { error: locked === "ip" ? "tooManyAttemptsIp" : "tooManyAttempts" },
        { status: 429 },
      );
    }

    const account = await findAccountByUsername(username);
    const valid =
      !!account &&
      verifyLogin(username, password, account.salt, account.verifier);

    if (!account || !valid) {
      await recordFailure(subject, ip);

      return NextResponse.json(
        { error: "invalidCredentials" },
        { status: 401 },
      );
    }
    await clearFailures(subject);

    // an account with an authenticator (auth.account.totp_secret, the game asks for it too) signs in with its code
    if (await isEnrolled("account", account.id)) {
      if (!code) {
        return NextResponse.json({ error: "totpRequired" }, { status: 401 });
      }
      const totpSubject = `totp:account:${account.id}`;

      if (await lockedOut(totpSubject, ip)) {
        return NextResponse.json({ error: "tooManyAttempts" }, { status: 429 });
      }
      if ((await verifyCode("account", account.id, String(code))) !== "ok") {
        await recordFailure(totpSubject, ip);

        return NextResponse.json({ error: "totpInvalid" }, { status: 401 });
      }
      await clearFailures(totpSubject);
    }

    const token = await createSession({
      id: account.id,
      username: account.username,
    });

    const cookieStore = await cookies();
    const cookieOptions = getSessionCookieOptions(token);

    cookieStore.set(cookieOptions);

    return NextResponse.json({
      success: true,
      user: {
        id: account.id,
        username: account.username,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
