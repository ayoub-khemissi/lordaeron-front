import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getAdminPreviewCookieOptions } from "@/lib/admin-auth";

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: "lordaeron_admin_session",
    value: "",
    maxAge: 0,
    path: "/",
  });
  cookieStore.set(getAdminPreviewCookieOptions(false));

  return NextResponse.json({ success: true });
}
