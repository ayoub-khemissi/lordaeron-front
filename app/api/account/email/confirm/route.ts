import { NextRequest, NextResponse } from "next/server";

import { confirmEmailToken } from "@/lib/account-email";

// POST {token}: an e-mailed link opened (app/[locale]/confirm-email): the address confirmed, or the new one in place. A POST from the
// page, not the link's GET, so that mail scanners following links confirm nothing on their own.
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    const result = await confirmEmailToken(String(token ?? ""));

    if (!result) {
      return NextResponse.json({ error: "invalidToken" }, { status: 400 });
    }

    return NextResponse.json({ success: true, kind: result.kind });
  } catch (error) {
    console.error("E-mail confirmation:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
