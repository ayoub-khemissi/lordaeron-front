import { NextResponse } from "next/server";

import { verifySession } from "@/lib/auth";
import {
  getCharacterGuidsForAccount,
  updateCharacterSlots,
} from "@/lib/queries/characters";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { order } = body;

    if (!Array.isArray(order) || order.length === 0 || order.length > 10) {
      return NextResponse.json({ error: "invalidOrder" }, { status: 400 });
    }

    if (!order.every((g: unknown) => typeof g === "number" && g > 0)) {
      return NextResponse.json({ error: "invalidOrder" }, { status: 400 });
    }

    // Verify all guids belong to this account
    const accountGuids = await getCharacterGuidsForAccount(session.id);
    const guidSet = new Set(accountGuids);

    if (
      order.length !== accountGuids.length ||
      !order.every((g: number) => guidSet.has(g))
    ) {
      return NextResponse.json({ error: "invalidOrder" }, { status: 400 });
    }

    const success = await updateCharacterSlots(session.id, order);

    if (!success) {
      return NextResponse.json({ error: "updateFailed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder characters error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
