import { NextRequest, NextResponse } from "next/server";

import {
  getPreferences,
  setNewsConsent,
  verifyUnsubscribe,
} from "@/lib/account-email";
import { requestIp } from "@/lib/second-factor";
import { SITE_URL } from "@/lib/email-templates/layout";

/*
 * The news e-mails' unsubscribe link (lib/account-email.ts unsubscribeUrl, signed, no session needed).
 * POST: one click, from the mail app (RFC 8058 List-Unsubscribe-Post) or from the page app/[locale]/unsubscribe: the news stop.
 * GET: the page that asks for the click (a link scanner opening the URL must not unsubscribe anyone).
 */

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  // the page in the account's language
  const accountId = verifyUnsubscribe(params.get("u"), params.get("t"));
  const locale = accountId ? (await getPreferences(accountId)).locale : "en";
  const url = new URL(`${SITE_URL}/${locale}/unsubscribe`);

  url.searchParams.set("u", params.get("u") ?? "");
  url.searchParams.set("t", params.get("t") ?? "");

  return NextResponse.redirect(url, 303);
}

export async function POST(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    let u: unknown = params.get("u");
    let t: unknown = params.get("t");

    // the page sends JSON; a mail app sends the form body "List-Unsubscribe=One-Click" with the signed URL
    if ((request.headers.get("content-type") ?? "").includes("json")) {
      const body = await request.json().catch(() => ({}));

      u = body.u ?? u;
      t = body.t ?? t;
    }
    const accountId = verifyUnsubscribe(u, t);

    if (!accountId) {
      return NextResponse.json({ error: "invalidLink" }, { status: 400 });
    }
    await setNewsConsent(
      accountId,
      false,
      "unsubscribe",
      requestIp(request.headers),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unsubscribe:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
