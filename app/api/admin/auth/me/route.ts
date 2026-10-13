import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  getAdminPreviewCookieOptions,
  readAdminSession,
} from "@/lib/admin-auth";
import { findAdminById } from "@/lib/queries/shop-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await readAdminSession();

    // the pages' hint of the administrators' view, in step with the session (and its second factor)
    (await cookies()).set(getAdminPreviewCookieOptions(!!session?.mfa));

    if (!session) {
      return NextResponse.json({ admin: null });
    }
    // signed in, waiting for the second factor: the admin space opens the second-factor screen
    if (!session.mfa) {
      return NextResponse.json({ admin: null, mfaRequired: true });
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
