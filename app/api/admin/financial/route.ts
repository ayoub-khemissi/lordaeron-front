import { NextRequest, NextResponse } from "next/server";

import { verifyAdminSession, adminUnauthorized } from "@/lib/admin-auth";
import {
  getFinancialKPIs,
  getTransactionsByStatus,
  getRevenueTrend,
  getRevenueByPackage,
  getTopSpenders,
  getTransactionList,
} from "@/lib/queries/financial-stats";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdminSession();

    if (!session) {
      return adminUnauthorized();
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view");

    if (view === "transactions") {
      const account_id = searchParams.get("account_id");
      const status = searchParams.get("status");
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");

      const result = await getTransactionList({
        limit,
        offset,
        account_id: account_id ? parseInt(account_id) : undefined,
        status: status || undefined,
      });

      return NextResponse.json(result);
    }

    const period = (searchParams.get("period") || "daily") as
      | "daily"
      | "weekly"
      | "monthly";
    const days = parseInt(searchParams.get("days") || "30");

    const [
      kpis,
      statusDistribution,
      revenueTrend,
      revenueByPackage,
      topSpenders,
    ] = await Promise.all([
      getFinancialKPIs(),
      getTransactionsByStatus(),
      getRevenueTrend(period, days),
      getRevenueByPackage(),
      getTopSpenders(10),
    ]);

    return NextResponse.json({
      kpis,
      statusDistribution,
      revenueTrend,
      revenueByPackage,
      topSpenders,
    });
  } catch (error) {
    console.error("Financial stats error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
