import fs from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { verifyAdminSession, adminUnauthorized } from "@/lib/admin-auth";
import { getFeedbackReport } from "@/lib/queries/admin-feedback";

// the reports' attachments (screenshots), copied from Discord by scripts/feedback/collect.mjs: admin only, never public
const FEEDBACK_DIR = process.env.FEEDBACK_DIR || "/var/lib/lordaeron-feedback";

// served inline only as images or videos (a player's file is never rendered as a page)
const INLINE = /^(image\/(png|jpeg|gif|webp)|video\/(mp4|webm))$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; n: string }> },
) {
  const session = await verifyAdminSession();

  if (!session) {
    return adminUnauthorized();
  }

  const { id, n } = await params;
  const report = await getFeedbackReport(parseInt(id));
  const attachment = report?.attachments[parseInt(n)];

  if (!attachment?.file) {
    return NextResponse.json({ error: "notFound" }, { status: 404 });
  }

  const root = path.resolve(FEEDBACK_DIR);
  const file = path.resolve(root, attachment.file);

  if (!file.startsWith(root + path.sep)) {
    return NextResponse.json({ error: "notFound" }, { status: 404 });
  }

  try {
    const data = await fs.readFile(file);
    const type =
      attachment.type && INLINE.test(attachment.type)
        ? attachment.type
        : "application/octet-stream";

    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        "Content-Disposition": `${type === "application/octet-stream" ? "attachment" : "inline"}; filename="${attachment.name.replace(/[^A-Za-z0-9._-]/g, "_")}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "notFound" }, { status: 404 });
  }
}
