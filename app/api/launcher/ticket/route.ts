import { NextRequest, NextResponse } from "next/server";

import {
  findDevice,
  issueTicket,
  securityLevel,
  TICKET_LIMIT,
  ticketsLastHour,
} from "@/lib/launcher-devices";
import { findAccountById } from "@/lib/queries/account";
import { requestIp } from "@/lib/second-factor";

// A Play: the device's one-time game ticket, typed by the launcher on the game's login screen.
// POST { token } -> { username, ticket }; 401 when the device was signed out (the launcher then asks to sign in again)
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    const device = await findDevice(token);

    if (!device) {
      return NextResponse.json({ error: "signedOut" }, { status: 401 });
    }
    if ((await ticketsLastHour(device.id)) >= TICKET_LIMIT) {
      return NextResponse.json({ error: "tooMany" }, { status: 429 });
    }
    const account = await findAccountById(device.accountId);

    if (!account) {
      return NextResponse.json({ error: "signedOut" }, { status: 401 });
    }
    const ticket = await issueTicket(
      device,
      account.username,
      requestIp(request.headers),
    );

    return NextResponse.json({
      username: account.username,
      ticket,
      security: await securityLevel(account.id),
    });
  } catch (error) {
    console.error("Launcher ticket error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
