import { NextRequest, NextResponse } from "next/server";

import { verifySession } from "@/lib/auth";
import { setNewsConsent, setPreferredLocale } from "@/lib/account-email";
import { requestIp } from "@/lib/second-factor";

// POST {newsConsent, locale}: the news consent changed from the account page (logged, lib/account-email.ts)
export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const body = await request.json();

    if (typeof body.newsConsent !== "boolean") {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    if (typeof body.locale === "string")
      await setPreferredLocale(session.id, body.locale);
    await setNewsConsent(
      session.id,
      body.newsConsent,
      "account",
      requestIp(request.headers),
    );

    return NextResponse.json({ success: true, newsConsent: body.newsConsent });
  } catch (error) {
    console.error("Account preferences:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
