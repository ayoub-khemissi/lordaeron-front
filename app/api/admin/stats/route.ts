import { NextRequest, NextResponse } from "next/server";

import { verifyAdminSession, adminUnauthorized } from "@/lib/admin-auth";
import {
  getShopStats,
  getSalesByCategory,
  getTopItems,
  getSalesTrend,
} from "@/lib/queries/shop-stats";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdminSession();

    if (!session) {
      return adminUnauthorized();
    }

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") || "daily") as
      | "daily"
      | "weekly"
      | "monthly";
    const days = parseInt(searchParams.get("days") || "30");

    const [stats, salesByCategory, topItems, trend] = await Promise.all([
      getShopStats(),
      getSalesByCategory(),
      getTopItems(10),
      getSalesTrend(period, days),
    ]);

    return NextResponse.json({
      ...stats,
      salesByCategory,
      topItems,
      trend,
    });
  } catch (error) {
    console.error("Admin stats error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
