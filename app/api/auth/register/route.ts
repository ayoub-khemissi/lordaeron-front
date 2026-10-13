import { NextRequest, NextResponse } from "next/server";

import { generateSalt, calculateVerifier } from "@/lib/srp6";
import {
  findAccountByUsername,
  createAccount,
  countRecentRegistrations,
  recordRegistration,
} from "@/lib/queries/account";

// at most this many accounts per IP per 24 hours (nginx sets X-Real-IP to the visitor's address)
const MAX_ACCOUNTS_PER_IP = 3;

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    // Validation
    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: "usernameRequired" }, { status: 400 });
    }
    if (username.length < 3 || username.length > 16) {
      return NextResponse.json({ error: "usernameLength" }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      return NextResponse.json(
        { error: "usernameAlphanumeric" },
        { status: 400 },
      );
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "emailInvalid" }, { status: 400 });
    }
    if (!password || password.length < 6 || password.length > 16) {
      return NextResponse.json({ error: "passwordLength" }, { status: 400 });
    }

    const ip =
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";

    if ((await countRecentRegistrations(ip)) >= MAX_ACCOUNTS_PER_IP) {
      return NextResponse.json({ error: "tooManyAccounts" }, { status: 429 });
    }

    // Check if username exists
    const existing = await findAccountByUsername(username);

    if (existing) {
      return NextResponse.json({ error: "usernameTaken" }, { status: 409 });
    }

    // Generate SRP6 salt and verifier
    const salt = generateSalt();
    const verifier = calculateVerifier(username, password, salt);

    // Create account
    const accountId = await createAccount(username, email, salt, verifier);

    await recordRegistration(accountId, ip);

    return NextResponse.json({ success: true, accountId }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
