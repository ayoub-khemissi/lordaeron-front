import type { Account } from "@/types";

import { verifyLogin } from "@/lib/srp6";
import { findAccountByUsername } from "@/lib/queries/account";
import {
  clearFailures,
  isEnrolled,
  lockedOut,
  recordFailure,
  verifyCode,
} from "@/lib/second-factor";

export type LoginCheck =
  | { ok: true; account: Account }
  | { ok: false; error: string; status: number };

// A game account's sign-in, the same for the website (app/api/auth/login) and the launcher (app/api/launcher/login): the
// password against its SRP6 verifier, then the authenticator code when the account has one (auth.account.totp_secret, the
// game asks for it too). The website's sign-in bypasses the authserver's WrongPass: 5 failures of one account or 20 of one
// IP in 15 minutes lock it.
export async function checkLogin(
  username: unknown,
  password: unknown,
  code: unknown,
  ip: string,
): Promise<LoginCheck> {
  if (!username) return { ok: false, error: "usernameRequired", status: 400 };
  if (!password) return { ok: false, error: "passwordRequired", status: 400 };

  const subject = `login:${String(username).toUpperCase()}`;
  const locked = await lockedOut(subject, ip);

  if (locked) {
    return {
      ok: false,
      error: locked === "ip" ? "tooManyAttemptsIp" : "tooManyAttempts",
      status: 429,
    };
  }

  const account = await findAccountByUsername(String(username));
  const valid =
    !!account &&
    verifyLogin(
      String(username),
      String(password),
      account.salt,
      account.verifier,
    );

  if (!account || !valid) {
    await recordFailure(subject, ip);

    return { ok: false, error: "invalidCredentials", status: 401 };
  }
  await clearFailures(subject);

  if (await isEnrolled("account", account.id)) {
    if (!code) return { ok: false, error: "totpRequired", status: 401 };
    const totpSubject = `totp:account:${account.id}`;

    if (await lockedOut(totpSubject, ip)) {
      return { ok: false, error: "tooManyAttempts", status: 429 };
    }
    if ((await verifyCode("account", account.id, String(code))) !== "ok") {
      await recordFailure(totpSubject, ip);

      return { ok: false, error: "totpInvalid", status: 401 };
    }
    await clearFailures(totpSubject);
  }

  return { ok: true, account };
}
