import { NextRequest, NextResponse } from "next/server";

import { verifyAdminSession, adminUnauthorized } from "@/lib/admin-auth";
import {
  getFeedbackReports,
  type FeedbackView,
} from "@/lib/queries/admin-feedback";

export const dynamic = "force-dynamic";

const VIEWS: FeedbackView[] = ["mine", "bugs", "suggestions", "all"];

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdminSession();

    if (!session) {
      return adminUnauthorized();
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") as FeedbackView;
    const realm = searchParams.get("realm");

    const result = await getFeedbackReports({
      view: VIEWS.includes(view) ? view : "mine",
      realm: realm === "lordaeron" || realm === "rimeheart" ? realm : undefined,
      limit: parseInt(searchParams.get("limit") || "50") || 50,
      offset: parseInt(searchParams.get("offset") || "0") || 0,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin feedback fetch error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
