import type { ResultSetHeader, RowDataPacket } from "mysql2";

import { promises as fs } from "fs";
import path from "path";

import { NextRequest, NextResponse } from "next/server";

import { websiteDb } from "@/lib/db";
import { requestIp } from "@/lib/second-factor";

/*
 * Lumenveil spots sent from the launcher (Ayoub, 06/11/2026): a player presses Ctrl+F5 in the game where something looks
 * wrong, then sends the spot from the launcher with a few words and, if they want, the screenshot they took there.
 * Kept in launcher_reports (sql/launcher_reports.sql) as the history; scripts/launcher-reports.py posts each new one to the
 * private Discord channel #lumenveil-reports. No account needed: the limits go by the launcher's installation and the IP.
 *
 *   POST { installId, accountName?, realm?, language?, launcherVersion, lumenveilVersion?, spot: { number?, saved?, text },
 *          settings?, message, screenshot?: base64 JPEG or PNG }   -> { id }
 *   GET ?installId=...                                              -> { reports: [{ id, createdAt, spotNumber, spotSaved, posted }] }
 */

const REPORTS_DIR =
  process.env.LAUNCHER_REPORTS_DIR || "/var/lib/lordaeron-reports";
// per installation: 5 an hour, 20 a day; per IP: 10 an hour; everyone: 300 a day
const LIMITS = { installHour: 5, installDay: 20, ipHour: 10, allDay: 300 };
const MAX_SCREENSHOT = 3_000_000;

const fail = (code: string, status = 400) =>
  NextResponse.json({ error: code }, { status });
const text = (value: unknown, max: number) =>
  typeof value === "string" ? value.replace(/\0/g, "").slice(0, max) : "";

async function count(sql: string, params: unknown[]) {
  const [rows] = await websiteDb.query<RowDataPacket[]>(sql, params);

  return Number(rows[0]?.n ?? 0);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const installId = String(body?.installId ?? "");

    if (!/^[a-f0-9]{32}$/.test(installId)) return fail("badRequest");
    const message = text(body.message, 2000).trim();

    if (message.length < 5) return fail("messageTooShort");
    const spot = text(body.spot?.text, 4000);

    if (!spot.includes("[spot ")) return fail("badRequest");
    const ip = requestIp(request.headers);

    if (
      (await count(
        "SELECT COUNT(*) n FROM launcher_reports WHERE install_id = ? AND created_at > NOW() - INTERVAL 1 HOUR",
        [installId],
      )) >= LIMITS.installHour ||
      (await count(
        "SELECT COUNT(*) n FROM launcher_reports WHERE install_id = ? AND created_at > NOW() - INTERVAL 1 DAY",
        [installId],
      )) >= LIMITS.installDay ||
      (await count(
        "SELECT COUNT(*) n FROM launcher_reports WHERE ip = ? AND created_at > NOW() - INTERVAL 1 HOUR",
        [ip],
      )) >= LIMITS.ipHour ||
      (await count(
        "SELECT COUNT(*) n FROM launcher_reports WHERE created_at > NOW() - INTERVAL 1 DAY",
        [],
      )) >= LIMITS.allDay
    )
      return fail("tooMany", 429);

    const spotNumber = Number.isInteger(body.spot?.number)
      ? body.spot.number
      : null;
    const spotSaved = text(body.spot?.saved, 32) || null;

    // the same spot sent twice (a double click, a retry): the first report stands
    if (spotSaved) {
      const [same] = await websiteDb.query<RowDataPacket[]>(
        "SELECT id FROM launcher_reports WHERE install_id = ? AND spot_saved = ? AND spot_number <=> ? LIMIT 1",
        [installId, spotSaved, spotNumber],
      );

      if (same.length) return NextResponse.json({ id: same[0].id });
    }

    let image: Uint8Array | null = null;

    if (typeof body.screenshot === "string" && body.screenshot) {
      const bytes = new Uint8Array(Buffer.from(body.screenshot, "base64"));
      const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
      const png =
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47;

      if (bytes.length > MAX_SCREENSHOT || !(jpeg || png))
        return fail("badScreenshot");
      image = bytes;
    }

    const [result] = await websiteDb.query<ResultSetHeader>(
      `INSERT INTO launcher_reports (ip, install_id, account_name, realm, language, launcher_version, lumenveil_version,
         spot_number, spot_saved, spot, settings, message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ip,
        installId,
        text(body.accountName, 32) || null,
        text(body.realm, 16) || null,
        text(body.language, 8) || null,
        text(body.launcherVersion, 16) || "?",
        text(body.lumenveilVersion, 16) || null,
        spotNumber,
        spotSaved,
        spot,
        text(body.settings, 60000) || null,
        message,
      ],
    );
    const id = result.insertId;

    if (image) {
      const name = `${id}.${image[0] === 0xff ? "jpg" : "png"}`;

      await fs.mkdir(REPORTS_DIR, { recursive: true });
      await fs.writeFile(path.join(REPORTS_DIR, name), image);
      await websiteDb.query(
        "UPDATE launcher_reports SET screenshot = ? WHERE id = ?",
        [name, id],
      );
    }

    return NextResponse.json({ id });
  } catch (error) {
    console.error("Launcher report error:", error);

    return fail("serverError", 500);
  }
}

export async function GET(request: NextRequest) {
  const installId = request.nextUrl.searchParams.get("installId") ?? "";

  if (!/^[a-f0-9]{32}$/.test(installId)) return fail("badRequest");
  const [rows] = await websiteDb.query<RowDataPacket[]>(
    `SELECT id, created_at, spot_number, spot_saved, discord_message_id IS NOT NULL posted
       FROM launcher_reports WHERE install_id = ? ORDER BY id DESC LIMIT 100`,
    [installId],
  );

  return NextResponse.json({
    reports: rows.map((r) => ({
      id: r.id,
      createdAt: r.created_at,
      spotNumber: r.spot_number,
      spotSaved: r.spot_saved,
      posted: Boolean(r.posted),
    })),
  });
}
