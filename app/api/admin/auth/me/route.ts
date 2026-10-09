import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  getAdminPreviewCookieOptions,
  verifyAdminSession,
} from "@/lib/admin-auth";
import { findAdminById } from "@/lib/queries/shop-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await verifyAdminSession();

    // the pages' hint of the administrators' view, in step with the session
    (await cookies()).set(getAdminPreviewCookieOptions(!!session));

    if (!session) {
      return NextResponse.json({ admin: null });
    }

    const admin = await findAdminById(session.id);

    if (!admin) {
      return NextResponse.json({ admin: null });
    }

    return NextResponse.json({
      admin: {
        id: admin.id,
        username: admin.username,
        display_name: admin.display_name,
        role: admin.role,
      },
    });
  } catch {
    return NextResponse.json({ admin: null });
  }
}
