import { NextRequest, NextResponse } from "next/server";

import { verifySession } from "@/lib/auth";
import { isRealmSlug } from "@/lib/realms";
import { claimReward } from "@/lib/second-factor-reward";

export const dynamic = "force-dynamic";

/*
 * The second factor's reward (lib/second-factor-reward.ts): POST {realm, characterGuid} mails the Core Hound Pup to that character of
 * the signed-in account, once ever, while the account is protected.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const { realm, characterGuid } = await request.json();
    const guid = Number(characterGuid);

    if (!isRealmSlug(realm) || !Number.isInteger(guid) || guid <= 0) {
      return NextResponse.json({ error: "characterNotFound" }, { status: 400 });
    }

    const result = await claimReward(session.id, realm, guid);

    if (result === "claimed") return NextResponse.json({ success: true });

    return NextResponse.json(
      { error: result },
      {
        status:
          result === "deliveryFailed"
            ? 502
            : result === "inProgress" || result === "alreadyClaimed"
              ? 409
              : 400,
      },
    );
  } catch (error) {
    console.error("Second factor reward:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
