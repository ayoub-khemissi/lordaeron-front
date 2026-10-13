import { NextRequest, NextResponse } from "next/server";

import { verifyAdminSession, adminUnauthorized } from "@/lib/admin-auth";

const LOCALES = [
  { key: "en", path: "" },
  { key: "fr", path: "fr/" },
  { key: "es", path: "es/" },
  { key: "de", path: "de/" },
  { key: "it", path: "it/" },
] as const;

function extractName(xml: string): string | null {
  const match = xml.match(/<name>\s*<!\[CDATA\[\s*(.+?)\s*\]\]>\s*<\/name>/);

  return match ? match[1].trim() : null;
}

function extractIcon(xml: string): string | null {
  const match = xml.match(/<icon[^>]*>([^<]+)<\/icon>/);

  return match ? match[1].trim().toLowerCase() : null;
}

export async function GET(request: NextRequest) {
  const admin = await verifyAdminSession();

  if (!admin) {
    return adminUnauthorized();
  }

  const itemId = request.nextUrl.searchParams.get("item_id");

  if (!itemId || isNaN(Number(itemId)) || Number(itemId) <= 0) {
    return NextResponse.json({ error: "Invalid item_id" }, { status: 400 });
  }

  try {
    // Fetch all locales in parallel
    const results = await Promise.allSettled(
      LOCALES.map(async (locale) => {
        const res = await fetch(
          `https://www.wowhead.com/wotlk/${locale.path}item=${itemId}&xml`,
          {
            headers: { "User-Agent": "Lordaeron-Admin/1.0" },
            signal: AbortSignal.timeout(8000),
          },
        );

        if (!res.ok) return null;

        return res.text();
      }),
    );

    // English is required (first result)
    const enResult = results[0];

    if (enResult.status !== "fulfilled" || !enResult.value) {
      return NextResponse.json({
        found: false,
        error: "Wowhead request failed",
      });
    }

    const enXml = enResult.value;

    // Wowhead returns XML with an error attribute when item doesn't exist
    if (enXml.includes("<error>") || !enXml.includes("<item")) {
      return NextResponse.json({ found: false, error: "Item not found" });
    }

    const iconName = extractIcon(enXml);

    if (!iconName) {
      return NextResponse.json({
        found: false,
        error: "Icon not found in XML",
      });
    }

    const iconUrl = `https://wow.zamimg.com/images/wow/icons/large/${iconName}.jpg`;

    // Extract names from each locale
    const names: Record<string, string | null> = {};

    for (let i = 0; i < LOCALES.length; i++) {
      const result = results[i];

      if (result.status === "fulfilled" && result.value) {
        names[LOCALES[i].key] = extractName(result.value);
      } else {
        names[LOCALES[i].key] = null;
      }
    }

    return NextResponse.json({
      found: true,
      iconUrl,
      iconName,
      names,
    });
  } catch {
    return NextResponse.json({
      found: false,
      error: "Failed to fetch from Wowhead",
    });
  }
}
