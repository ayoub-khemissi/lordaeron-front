import { NextRequest, NextResponse } from "next/server";

import { verifyAdminSession, adminUnauthorized } from "@/lib/admin-auth";
import { getPurchaseById } from "@/lib/queries/shop-purchases";
import { createAuditLog } from "@/lib/queries/shop-stats";
import { retryPurchaseDelivery } from "@/lib/soap";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await verifyAdminSession();

    if (!session) {
      return adminUnauthorized();
    }

    const { id } = await params;
    const purchaseId = parseInt(id);

    const purchase = await getPurchaseById(purchaseId);

    if (!purchase) {
      return NextResponse.json({ error: "purchaseNotFound" }, { status: 404 });
    }

    if (purchase.status !== "pending_delivery") {
      return NextResponse.json(
        { error: "notPendingDelivery" },
        { status: 400 },
      );
    }

    const result = await retryPurchaseDelivery(purchase);

    await createAuditLog(
      session.id,
      "retry_delivery",
      "shop_purchase",
      purchaseId,
      {
        account_id: purchase.account_id,
        success: result.success,
        message: result.message,
      },
    );

    if (!result.success) {
      return NextResponse.json(
        { error: "deliveryStillFailed", message: result.message },
        { status: 200 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Retry delivery error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
