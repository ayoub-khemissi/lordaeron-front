import { NextResponse } from "next/server";

import { verifyAdminSession, adminUnauthorized } from "@/lib/admin-auth";
import {
  decideFeedbackReport,
  getFeedbackReport,
  setFeedbackReplied,
} from "@/lib/queries/admin-feedback";

const DECISIONS = ["accepted", "rejected", "later"] as const;

// { decision: "accepted" | "rejected" | "later" | null, note?: string } and/or { replied: boolean }
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await verifyAdminSession();

    if (!session) {
      return adminUnauthorized();
    }

    const id = parseInt((await params).id);

    if (isNaN(id) || !(await getFeedbackReport(id))) {
      return NextResponse.json({ error: "invalidId" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));

    if ("decision" in body) {
      const decision = body.decision === null ? null : body.decision;

      if (decision !== null && !DECISIONS.includes(decision)) {
        return NextResponse.json({ error: "invalidDecision" }, { status: 400 });
      }
      await decideFeedbackReport(
        id,
        decision,
        typeof body.note === "string" ? body.note.slice(0, 5000) : "",
      );
    }
    if (typeof body.replied === "boolean") {
      await setFeedbackReplied(id, body.replied);
    }

    return NextResponse.json({ report: await getFeedbackReport(id) });
  } catch (error) {
    console.error("Admin feedback update error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
