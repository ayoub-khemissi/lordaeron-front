import { NextRequest, NextResponse } from "next/server";

import { verifySession } from "@/lib/auth";
import {
  emailState,
  normalizeEmail,
  requestEmailChange,
  sendVerification,
  setPreferredLocale,
} from "@/lib/account-email";

/*
 * The account's e-mail address (lib/account-email.ts).
 * GET: the address, whether it is confirmed, the new address waiting for its link, the news consent.
 * POST {email, locale}: a new address (or the first one): its confirmation link is e-mailed to it, applied on click.
 * POST {resend: true, locale}: the confirmation link of the current address again.
 */

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await verifySession();

  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await emailState(session.id));
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const locale = typeof body.locale === "string" ? body.locale : "en";

    // the player acts in this language: their e-mails follow it
    await setPreferredLocale(session.id, locale);

    if (body.resend) {
      const result = await sendVerification(session.id, locale);

      if (result === "rateLimited") {
        return NextResponse.json({ error: "rateLimited" }, { status: 429 });
      }

      return NextResponse.json({ success: true, result });
    }

    const email = normalizeEmail(body.email);

    if (!email) {
      return NextResponse.json({ error: "emailInvalid" }, { status: 400 });
    }
    const result = await requestEmailChange(session.id, email, locale);

    if (result === "rateLimited") {
      return NextResponse.json({ error: "rateLimited" }, { status: 429 });
    }
    if (result === "same") {
      return NextResponse.json({ error: "emailSame" }, { status: 400 });
    }

    return NextResponse.json({ success: true, pendingEmail: email });
  } catch (error) {
    console.error("Account e-mail:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
