import { NextRequest, NextResponse } from "next/server";

import { verifyAdminSession, adminUnauthorized } from "@/lib/admin-auth";
import { getContactMessages } from "@/lib/queries/admin-contact";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdminSession();

    if (!session) {
      return adminUnauthorized();
    }

    const { searchParams } = new URL(request.url);

    const isReadParam = searchParams.get("is_read");

    const result = await getContactMessages({
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 50,
      offset: searchParams.get("offset")
        ? parseInt(searchParams.get("offset")!)
        : 0,
      isRead:
        isReadParam === "true"
          ? true
          : isReadParam === "false"
            ? false
            : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin contact messages fetch error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
