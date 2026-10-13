import crypto from "crypto";

import { NextRequest, NextResponse } from "next/server";

import { sendEmail } from "@/lib/email";
import { getPasswordResetEmail } from "@/lib/email-templates/password-reset";
import { findAccountByEmail } from "@/lib/queries/account";
import { createPasswordResetToken } from "@/lib/queries/password-reset";

export async function POST(request: NextRequest) {
  try {
    const { email, locale = "en" } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: true });
    }

    const account = await findAccountByEmail(email);

    if (account) {
      const tokenRaw = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto
        .createHash("sha256")
        .update(tokenRaw)
        .digest("hex");

      const result = await createPasswordResetToken(
        account.id,
        tokenHash,
        email,
        locale,
      );

      if (result.success) {
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || "https://www.lordaeron.eu";
        const resetUrl = `${baseUrl}/${locale}/reset-password?token=${tokenRaw}`;
        const mail = getPasswordResetEmail(locale, resetUrl);

        try {
          await sendEmail({ to: email, ...mail });
        } catch (err) {
          console.error("Failed to send password reset email:", err);
        }
      }
    }

    // Always return 200 to prevent email enumeration
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json({ success: true });
  }
}
