import { NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";

import { verifySession } from "@/lib/auth";
import {
  getDeletedCharacterByGuid,
  getActiveCharacterCount,
  isCharacterNameTaken,
  restoreCharacter,
} from "@/lib/queries/characters";
import { websiteDb } from "@/lib/db";
import { RESTORE_CHARACTER_COST } from "@/lib/shop-utils";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { guid } = body;

    if (!guid || typeof guid !== "number") {
      return NextResponse.json({ error: "missingFields" }, { status: 400 });
    }

    // Get the deleted character
    const deletedChar = await getDeletedCharacterByGuid(guid);

    if (!deletedChar) {
      return NextResponse.json({ error: "characterNotFound" }, { status: 404 });
    }

    // Verify ownership
    if (deletedChar.accountId !== session.id) {
      return NextResponse.json({ error: "characterNotFound" }, { status: 404 });
    }

    // Check active character count
    const activeCount = await getActiveCharacterCount(session.id);

    if (activeCount >= 10) {
      return NextResponse.json({ error: "tooManyCharacters" }, { status: 400 });
    }

    // Check name availability — no rename allowed (rename is a paid service)
    const finalName = deletedChar.name;

    if (await isCharacterNameTaken(finalName)) {
      return NextResponse.json({ error: "originalNameTaken" }, { status: 409 });
    }

    // Deduct soul shards (transaction on websiteDb)
    const connection = await websiteDb.getConnection();

    try {
      await connection.beginTransaction();

      const [balanceRows] = await connection.execute<RowDataPacket[]>(
        "SELECT balance FROM soul_shards WHERE account_id = ? FOR UPDATE",
        [session.id],
      );

      const currentBalance =
        balanceRows.length > 0 ? balanceRows[0].balance : 0;

      if (currentBalance < RESTORE_CHARACTER_COST) {
        await connection.rollback();

        return NextResponse.json(
          { error: "insufficientBalance" },
          { status: 400 },
        );
      }

      await connection.execute(
        "UPDATE soul_shards SET balance = balance - ? WHERE account_id = ?",
        [RESTORE_CHARACTER_COST, session.id],
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    // Restore character on charactersDb
    let restored = false;

    try {
      restored = await restoreCharacter(guid, finalName, session.id);
    } catch (restoreError) {
      console.error("Restore character error:", restoreError);
    }

    if (!restored) {
      // Compensatory transaction: re-credit the shards
      const compensateConn = await websiteDb.getConnection();

      try {
        await compensateConn.beginTransaction();
        await compensateConn.execute(
          "UPDATE soul_shards SET balance = balance + ? WHERE account_id = ?",
          [RESTORE_CHARACTER_COST, session.id],
        );
        await compensateConn.commit();
      } catch {
        await compensateConn.rollback();
      } finally {
        compensateConn.release();
      }

      return NextResponse.json({ error: "restoreFailed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, name: finalName });
  } catch (error) {
    console.error("Restore character error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
