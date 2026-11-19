import type { ResultSetHeader, RowDataPacket } from "mysql2";

import { promises as fs } from "fs";
import path from "path";

import { NextRequest, NextResponse } from "next/server";

import { websiteDb } from "@/lib/db";
import { requestIp } from "@/lib/second-factor";

/*
 * Game crash reports sent by the launcher (Ayoub, 19/11/2026): when the game stops, the launcher sends each new report of
 * the game's Errors folder made on a Lordaeron realm (the text, its Windows names masked, and the dump), unless the player
 * turned it off in Settings. Kept in launcher_crashes (sql/launcher_crashes.sql) with the files in LAUNCHER_CRASHES_DIR;
 * scripts/launcher-crashes.py posts each new one to the private Discord channel #wow-errors. No account needed: the limits
 * go by the launcher's installation and the IP.
 *
 *   POST { installId, accountName?, realm?, language?, launcherVersion, lumenveilVersion?, platform?, fileName,
 *          report: the .txt's text, dump?: the .dmp in base64, dumpSize?: its size when it was too big to send,
 *          largeAddressAware?: whether Wow.exe may use 4 GB (launcher 0.1.39) }
 *     -> { id }   (the same report sent again answers its first id)
 */

const CRASHES_DIR =
  process.env.LAUNCHER_CRASHES_DIR || "/var/lib/lordaeron-crashes";
// a game crashing at each login sends one at each try: per installation 6 an hour, 20 a day; per IP 12 an hour;
// everyone 500 a day
const LIMITS = { installHour: 6, installDay: 20, ipHour: 12, allDay: 500 };
const MAX_REPORT = 1_500_000;
const MAX_DUMP = 5_000_000;

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
    const fileName = text(body.fileName, 80).trim();

    if (!/^[\w .()-]{1,80}$/.test(fileName)) return fail("badRequest");
    const report =
      typeof body.report === "string" ? body.report.replace(/\0/g, "") : "";

    if (report.length > MAX_REPORT || !report.includes("World of WarCraft"))
      return fail("badRequest");

    // the same report sent twice (a retry after a lost answer): the first one stands
    const [same] = await websiteDb.query<RowDataPacket[]>(
      "SELECT id FROM launcher_crashes WHERE install_id = ? AND file_name = ? LIMIT 1",
      [installId, fileName],
    );

    if (same.length) return NextResponse.json({ id: same[0].id });

    const ip = requestIp(request.headers);

    if (
      (await count(
        "SELECT COUNT(*) n FROM launcher_crashes WHERE install_id = ? AND created_at > NOW() - INTERVAL 1 HOUR",
        [installId],
      )) >= LIMITS.installHour ||
      (await count(
        "SELECT COUNT(*) n FROM launcher_crashes WHERE install_id = ? AND created_at > NOW() - INTERVAL 1 DAY",
        [installId],
      )) >= LIMITS.installDay ||
      (await count(
        "SELECT COUNT(*) n FROM launcher_crashes WHERE ip = ? AND created_at > NOW() - INTERVAL 1 HOUR",
        [ip],
      )) >= LIMITS.ipHour ||
      (await count(
        "SELECT COUNT(*) n FROM launcher_crashes WHERE created_at > NOW() - INTERVAL 1 DAY",
        [],
      )) >= LIMITS.allDay
    )
      return fail("tooMany", 429);

    let dump: Uint8Array | null = null;

    if (typeof body.dump === "string" && body.dump) {
      const bytes = new Uint8Array(Buffer.from(body.dump, "base64"));
      // a minidump starts with "MDMP"
      const minidump =
        bytes[0] === 0x4d &&
        bytes[1] === 0x44 &&
        bytes[2] === 0x4d &&
        bytes[3] === 0x50;

      if (bytes.length > MAX_DUMP || !minidump) return fail("badDump");
      dump = bytes;
    }
    const dumpSize = dump
      ? dump.length
      : Number.isInteger(body.dumpSize) && body.dumpSize > 0
        ? body.dumpSize
        : null;

    const [result] = await websiteDb.query<ResultSetHeader>(
      `INSERT INTO launcher_crashes (ip, install_id, account_name, realm, language, launcher_version, lumenveil_version,
         platform, large_address_aware, file_name, dump_size)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ip,
        installId,
        text(body.accountName, 32) || null,
        text(body.realm, 32) || null,
        text(body.language, 8) || null,
        text(body.launcherVersion, 16) || "?",
        text(body.lumenveilVersion, 16) || null,
        text(body.platform, 16) || null,
        typeof body.largeAddressAware === "boolean"
          ? Number(body.largeAddressAware)
          : null,
        fileName,
        dumpSize,
      ],
    );
    const id = result.insertId;

    await fs.mkdir(CRASHES_DIR, { recursive: true });
    await fs.writeFile(path.join(CRASHES_DIR, `${id}.txt`), report, "utf8");
    if (dump) await fs.writeFile(path.join(CRASHES_DIR, `${id}.dmp`), dump);
    await websiteDb.query(
      "UPDATE launcher_crashes SET report_file = ?, dump_file = ? WHERE id = ?",
      [`${id}.txt`, dump ? `${id}.dmp` : null, id],
    );

    return NextResponse.json({ id });
  } catch (error) {
    console.error("Launcher crash report error:", error);

    return fail("serverError", 500);
  }
}
