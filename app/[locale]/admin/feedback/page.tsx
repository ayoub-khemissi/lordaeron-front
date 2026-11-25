"use client";

import type { FeedbackReport, FeedbackStatus } from "@/types";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Tabs, Tab } from "@heroui/tabs";
import { Select, SelectItem } from "@heroui/select";
import { Textarea } from "@heroui/input";
import { Switch } from "@heroui/switch";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { useTranslations } from "next-intl";

type View = "mine" | "bugs" | "suggestions" | "all";
type Realm = "" | "lordaeron" | "rimeheart";
type Decision = "accepted" | "rejected" | "later";

const GUILD_ID = "1189071406433058816";
const PAGE = 50;

const STATUS_COLOR: Record<
  FeedbackStatus,
  "default" | "primary" | "secondary" | "success" | "warning" | "danger"
> = {
  new: "primary",
  investigating: "primary",
  not_a_bug: "default",
  needs_info: "warning",
  duplicate: "default",
  merged: "default",
  closed: "default",
  fix_queued: "secondary",
  shipped: "success",
  awaiting_decision: "warning",
  accepted: "success",
  in_progress: "secondary",
  done: "success",
  rejected: "danger",
  wont_fix: "danger",
  later: "default",
};

// the report's first line, when Claude has not titled it yet
function headline(report: FeedbackReport): string {
  return (
    report.title ||
    report.content.split("\n")[1]?.slice(0, 140) ||
    report.content.slice(0, 140)
  );
}

export default function AdminFeedbackPage() {
  const t = useTranslations("admin.feedback");
  const tc = useTranslations("admin.common");
  const [view, setView] = useState<View>("mine");
  const [realm, setRealm] = useState<Realm>("");
  const [reports, setReports] = useState<FeedbackReport[]>([]);
  const [counts, setCounts] = useState<Record<View, number> | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FeedbackReport | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        view,
        limit: String(PAGE),
        offset: String(offset),
      });

      if (realm) params.set("realm", realm);
      const res = await fetch(`/api/admin/feedback?${params}`);
      const data = await res.json();

      setReports(data.reports || []);
      setTotal(data.total || 0);
      setCounts(data.counts || null);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [view, realm, offset]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const open = (report: FeedbackReport) => {
    setSelected(report);
    setNote(report.decision_note || "");
    setCopied(false);
  };

  const patch = async (body: Record<string, unknown>) => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/feedback/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.report) {
        setSelected(data.report);
        setReports((prev) =>
          prev.map((r) => (r.id === data.report.id ? data.report : r)),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const decide = (decision: Decision | null) => patch({ decision, note });

  const copyReply = async () => {
    if (!selected?.reply_draft) return;
    try {
      await navigator.clipboard.writeText(selected.reply_draft);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const isSuggestion =
    selected?.kind === "suggestion" || selected?.status === "awaiting_decision";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-heading text-gray-100">{t("title")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("subtitle")}</p>
        </div>
        <Select
          aria-label={t("realm")}
          className="w-48"
          selectedKeys={[realm || "both"]}
          size="sm"
          onSelectionChange={(keys) => {
            const key = String(Array.from(keys)[0] || "both");

            setRealm(key === "both" ? "" : (key as Realm));
            setOffset(0);
          }}
        >
          <SelectItem key="both">{t("bothRealms")}</SelectItem>
          <SelectItem key="rimeheart">Rimeheart</SelectItem>
          <SelectItem key="lordaeron">Lordaeron</SelectItem>
        </Select>
      </div>

      <Tabs
        aria-label={t("title")}
        className="mb-6"
        selectedKey={view}
        variant="underlined"
        onSelectionChange={(key) => {
          setView(key as View);
          setOffset(0);
        }}
      >
        {(["mine", "bugs", "suggestions", "all"] as View[]).map((v) => (
          <Tab
            key={v}
            title={
              <span className="flex items-center gap-2">
                {t(`views.${v}`)}
                {counts && (
                  <Chip
                    color={v === "mine" && counts[v] ? "warning" : "default"}
                    size="sm"
                    variant="flat"
                  >
                    {counts[v]}
                  </Chip>
                )}
              </span>
            }
          />
        ))}
      </Tabs>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner color="warning" size="lg" />
        </div>
      ) : reports.length === 0 ? (
        <p className="text-gray-500 text-center py-16">
          {t(view === "mine" ? "nothingForYou" : "noReports")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {reports.map((r) => (
            <li key={r.id}>
              <button
                className="w-full text-left bg-[#161b22] border border-gray-800 hover:border-wow-gold/40 rounded-lg px-4 py-3 transition-colors"
                type="button"
                onClick={() => open(r)}
              >
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Chip color={STATUS_COLOR[r.status]} size="sm" variant="flat">
                    {t(`status.${r.status}`)}
                  </Chip>
                  {r.decision && (
                    <Chip size="sm" variant="bordered">
                      {t(`decision.${r.decision}`)}
                    </Chip>
                  )}
                  {r.followup ? (
                    <Chip color="primary" size="sm" variant="dot">
                      {t("followup")}
                    </Chip>
                  ) : null}
                  <span className="text-xs uppercase tracking-wide text-gray-500">
                    {r.realm === "rimeheart" ? "Rimeheart" : "Lordaeron"} ·{" "}
                    {t(`kind.${r.kind}`)}
                  </span>
                  {r.reply_draft && !r.replied && (
                    <span className="text-xs text-wow-gold">
                      {t("replyToPost")}
                    </span>
                  )}
                  <span className="ml-auto text-xs text-gray-500 tabular-nums">
                    {r.author_name} · #{r.id} ·{" "}
                    {new Date(r.reported_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-100 font-medium">{headline(r)}</p>
                {r.verdict && (
                  <p className="text-sm text-gray-400 mt-0.5">{r.verdict}</p>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {total > PAGE && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            className="text-gray-400"
            isDisabled={offset === 0}
            size="sm"
            variant="light"
            onPress={() => setOffset(Math.max(0, offset - PAGE))}
          >
            {tc("previous")}
          </Button>
          <span className="text-sm text-gray-500 py-2 tabular-nums">
            {offset + 1}-{Math.min(offset + PAGE, total)} / {total}
          </span>
          <Button
            className="text-gray-400"
            isDisabled={offset + PAGE >= total}
            size="sm"
            variant="light"
            onPress={() => setOffset(offset + PAGE)}
          >
            {tc("next")}
          </Button>
        </div>
      )}

      <Modal
        classNames={{
          base: "bg-[#161b22] border border-gray-800",
          header: "border-b border-gray-800",
          body: "py-4",
          footer: "border-t border-gray-800",
        }}
        isOpen={!!selected}
        scrollBehavior="inside"
        size="4xl"
        onClose={() => {
          setSelected(null);
          fetchReports();
        }}
      >
        <ModalContent>
          {selected && (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <span className="text-gray-100">{headline(selected)}</span>
                <span className="flex flex-wrap items-center gap-2 text-sm font-normal text-gray-400">
                  <Chip
                    color={STATUS_COLOR[selected.status]}
                    size="sm"
                    variant="flat"
                  >
                    {t(`status.${selected.status}`)}
                  </Chip>
                  {selected.realm === "rimeheart" ? "Rimeheart" : "Lordaeron"} ·{" "}
                  {t(`kind.${selected.kind}`)} · {selected.author_name} ·{" "}
                  {new Date(selected.reported_at).toLocaleString()}
                  <a
                    className="text-wow-gold hover:underline"
                    href={`https://discord.com/channels/${GUILD_ID}/${selected.channel_id}/${selected.first_message_id}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t("openInDiscord")}
                  </a>
                </span>
              </ModalHeader>
              <ModalBody className="gap-6">
                {selected.verdict && (
                  <section>
                    <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      {t("verdict")}
                    </h3>
                    <p className="text-gray-100">{selected.verdict}</p>
                  </section>
                )}

                <section>
                  <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    {t("messages")}
                  </h3>
                  <pre className="whitespace-pre-wrap break-words font-sans text-sm text-gray-300 bg-[#0d1117] border border-gray-800 rounded-lg p-3">
                    {selected.content}
                  </pre>
                  {selected.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-3">
                      {selected.attachments.map((a, n) =>
                        !a.file ? (
                          <span key={n} className="text-xs text-gray-500">
                            {a.name} ({a.skipped})
                          </span>
                        ) : a.type?.startsWith("image/") ? (
                          <a
                            key={n}
                            href={`/api/admin/feedback/${selected.id}/attachment/${n}`}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {}
                            <img
                              alt={a.name}
                              className="max-h-48 max-w-full rounded border border-gray-800"
                              src={`/api/admin/feedback/${selected.id}/attachment/${n}`}
                            />
                          </a>
                        ) : (
                          <a
                            key={n}
                            className="text-sm text-wow-gold hover:underline"
                            href={`/api/admin/feedback/${selected.id}/attachment/${n}`}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {a.name}
                          </a>
                        ),
                      )}
                    </div>
                  )}
                </section>

                {selected.analysis && (
                  <section>
                    <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      {t("analysis")}
                    </h3>
                    <p className="whitespace-pre-wrap text-sm text-gray-300">
                      {selected.analysis}
                    </p>
                    {selected.commits && (
                      <p className="text-xs text-gray-500 mt-2 font-mono">
                        {selected.commits}
                      </p>
                    )}
                  </section>
                )}

                {selected.reply_draft && (
                  <section>
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h3 className="text-xs uppercase tracking-wide text-gray-500">
                        {t("reply")}
                      </h3>
                      <Button
                        className="bg-wow-gold/20 text-wow-gold"
                        size="sm"
                        onPress={copyReply}
                      >
                        {copied ? t("copied") : t("copy")}
                      </Button>
                      <Switch
                        isDisabled={saving}
                        isSelected={!!selected.replied}
                        size="sm"
                        onValueChange={(replied) => patch({ replied })}
                      >
                        <span className="text-sm text-gray-400">
                          {t("replied")}
                        </span>
                      </Switch>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-gray-200 bg-[#0d1117] border border-gray-800 rounded-lg p-3 select-all">
                      {selected.reply_draft}
                    </p>
                  </section>
                )}

                {isSuggestion && (
                  <section>
                    <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                      {t("yourDecision")}
                    </h3>
                    <Textarea
                      id="feedback-decision-note"
                      minRows={2}
                      placeholder={t("notePlaceholder")}
                      value={note}
                      onValueChange={setNote}
                    />
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {(["accepted", "rejected", "later"] as Decision[]).map(
                        (d) => (
                          <Button
                            key={d}
                            color={
                              d === "accepted"
                                ? "success"
                                : d === "rejected"
                                  ? "danger"
                                  : "default"
                            }
                            isDisabled={saving}
                            size="sm"
                            variant={selected.decision === d ? "solid" : "flat"}
                            onPress={() => decide(d)}
                          >
                            {t(`decide.${d}`)}
                          </Button>
                        ),
                      )}
                      {selected.decision && (
                        <Button
                          className="text-gray-400"
                          isDisabled={saving}
                          size="sm"
                          variant="light"
                          onPress={() => decide(null)}
                        >
                          {t("undo")}
                        </Button>
                      )}
                      {selected.decision && (
                        <span className="text-xs text-gray-500">
                          {selected.decision_handled_at
                            ? t("decisionHandled")
                            : t("decisionPending")}
                        </span>
                      )}
                    </div>
                  </section>
                )}
              </ModalBody>
              <ModalFooter>
                <Button
                  className="text-gray-400"
                  variant="light"
                  onPress={() => {
                    setSelected(null);
                    fetchReports();
                  }}
                >
                  {t("close")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
