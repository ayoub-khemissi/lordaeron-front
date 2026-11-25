// Players' feedback from Discord (sql/feedback_reports.sql): filed by scripts/feedback/collect.mjs, qualified and handled by Claude
// (scripts/feedback/run.sh), the suggestions decided here by the admin (/admin/feedback).
import type { FeedbackReport } from "@/types";

import { RowDataPacket } from "mysql2";

import { websiteDb } from "@/lib/db";

// the page's tabs: what waits for the admin, the bugs, the suggestions, everything
export type FeedbackView = "mine" | "bugs" | "suggestions" | "all";

const VIEW_WHERE: Record<FeedbackView, string> = {
  // a suggestion to decide, or an answer to post to the player
  mine: "status NOT IN ('merged', 'new', 'investigating') AND ((status = 'awaiting_decision' AND decision IS NULL) OR (replied = 0 AND reply_draft IS NOT NULL))",
  bugs: "kind = 'bug' AND status <> 'merged'",
  suggestions: "kind = 'suggestion' AND status <> 'merged'",
  all: "1=1",
};

function parse(row: RowDataPacket): FeedbackReport {
  const attachments =
    typeof row.attachments === "string"
      ? JSON.parse(row.attachments)
      : row.attachments;

  return { ...(row as FeedbackReport), attachments: attachments || [] };
}

export async function getFeedbackReports(filters: {
  view: FeedbackView;
  realm?: "lordaeron" | "rimeheart";
  limit: number;
  offset: number;
}): Promise<{
  reports: FeedbackReport[];
  total: number;
  counts: Record<FeedbackView, number>;
}> {
  let where = VIEW_WHERE[filters.view];
  const params: string[] = [];

  if (filters.realm) {
    where += " AND realm = ?";
    params.push(filters.realm);
  }

  const limit = Math.min(Math.max(filters.limit, 1), 100);
  const offset = Math.max(filters.offset, 0);
  const [rows] = await websiteDb.execute<RowDataPacket[]>(
    `SELECT * FROM feedback_reports WHERE ${where} ORDER BY reported_at DESC LIMIT ${limit} OFFSET ${offset}`,
    params,
  );
  const [countRows] = await websiteDb.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM feedback_reports WHERE ${where}`,
    params,
  );
  const realmWhere = filters.realm ? " AND realm = ?" : "";
  const [viewCounts] = await websiteDb.execute<RowDataPacket[]>(
    `SELECT ${(Object.keys(VIEW_WHERE) as FeedbackView[])
      .map((v) => `SUM((${VIEW_WHERE[v]})${realmWhere}) AS \`${v}\``)
      .join(", ")} FROM feedback_reports`,
    filters.realm ? Array(4).fill(filters.realm) : [],
  );
  const counts = Object.fromEntries(
    (Object.keys(VIEW_WHERE) as FeedbackView[]).map((v) => [
      v,
      Number(viewCounts[0][v] || 0),
    ]),
  ) as Record<FeedbackView, number>;

  return { reports: rows.map(parse), total: countRows[0].total, counts };
}

export async function getFeedbackReport(
  id: number,
): Promise<FeedbackReport | null> {
  const [rows] = await websiteDb.execute<RowDataPacket[]>(
    "SELECT * FROM feedback_reports WHERE id = ?",
    [id],
  );

  return rows[0] ? parse(rows[0]) : null;
}

// the admin's decision on a suggestion; a new decision is acted on again by Claude
export async function decideFeedbackReport(
  id: number,
  decision: "accepted" | "rejected" | "later" | null,
  note: string,
): Promise<void> {
  await websiteDb.execute(
    `UPDATE feedback_reports SET decision = ?, decision_note = ?, decided_at = IF(? IS NULL, NULL, NOW()),
       decision_handled_at = NULL WHERE id = ?`,
    [decision, note || null, decision, id],
  );
}

export async function setFeedbackReplied(
  id: number,
  replied: boolean,
): Promise<void> {
  await websiteDb.execute(
    "UPDATE feedback_reports SET replied = ? WHERE id = ?",
    [replied ? 1 : 0, id],
  );
}
