import { NextRequest, NextResponse } from "next/server";

import { verifyAdminSession, adminUnauthorized } from "@/lib/admin-auth";
import { getAllNewsAdmin, createNews } from "@/lib/queries/news";
import { createAuditLog } from "@/lib/queries/shop-stats";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await verifyAdminSession();

    if (!session) {
      return adminUnauthorized();
    }

    const news = await getAllNewsAdmin();

    return NextResponse.json({ news });
  } catch (error) {
    console.error("Admin news fetch error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdminSession();

    if (!session) {
      return adminUnauthorized();
    }

    const body = await request.json();

    if (!body.title_en || !body.content_en || !body.author_name) {
      return NextResponse.json({ error: "missingFields" }, { status: 400 });
    }

    const articleId = await createNews({
      title_en: body.title_en,
      title_fr: body.title_fr || "",
      title_es: body.title_es || "",
      title_de: body.title_de || "",
      title_it: body.title_it || "",
      content_en: body.content_en,
      content_fr: body.content_fr || "",
      content_es: body.content_es || "",
      content_de: body.content_de || "",
      content_it: body.content_it || "",
      image_url: body.image_url || null,
      author_name: body.author_name,
      published_at: body.published_at || new Date().toISOString(),
      is_active: body.is_active !== false,
    });

    await createAuditLog(session.id, "create_news", "news", articleId, {
      title: body.title_en,
      author: body.author_name,
    });

    return NextResponse.json({ success: true, id: articleId });
  } catch (error) {
    console.error("Admin news create error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
