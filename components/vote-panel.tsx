"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@heroui/button";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
} from "@heroui/drawer";

import { useAuth } from "@/lib/auth-context";
import { OPEN_VOTE_EVENT } from "@/components/navigation/vote-event";

interface VoteSite {
  id: number;
  name: string;
  slug: string;
  voteUrl: string;
  imageUrl: string | null;
  rewardShards: number;
  cooldownHours: number;
  lastVotedAt: string | null;
  canVote: boolean;
}

type ClaimState = "idle" | "claiming" | "claimed";

function CooldownTimer({
  lastVotedAt,
  cooldownHours,
  onExpired,
}: {
  lastVotedAt: string;
  cooldownHours: number;
  onExpired?: () => void;
}) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    function update() {
      const cooldownMs = cooldownHours * 60 * 60 * 1000;
      const lastVote = new Date(lastVotedAt).getTime();
      const end = lastVote + cooldownMs;
      const diff = end - Date.now();

      if (diff <= 0) {
        setRemaining("");
        onExpired?.();

        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setRemaining(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
      );
    }

    update();
    const interval = setInterval(update, 30_000);

    return () => clearInterval(interval);
  }, [lastVotedAt, cooldownHours, onExpired]);

  if (!remaining) return null;

  return <span className="font-mono">{remaining}</span>;
}

function ShardIcon({ className }: { className?: string }) {
  return (
    <Image
      unoptimized
      alt=""
      className={className}
      height={12}
      src="/img/icons/soul-shard.svg"
      width={12}
    />
  );
}

function VoteSiteCard({
  site,
  onClaim,
}: {
  site: VoteSite;
  onClaim: (siteId: number) => Promise<string | null>;
}) {
  const [claimState, setClaimState] = useState<ClaimState>("idle");
  const [localLastVotedAt, setLocalLastVotedAt] = useState(site.lastVotedAt);
  const [localCanVote, setLocalCanVote] = useState(site.canVote);

  useEffect(() => {
    setLocalLastVotedAt(site.lastVotedAt);
    setLocalCanVote(site.canVote);
  }, [site.lastVotedAt, site.canVote]);

  const handleClick = async () => {
    if (!localCanVote || claimState !== "idle") return;

    window.open(site.voteUrl, "_blank", "noopener,noreferrer");

    setClaimState("claiming");
    const lastVotedAt = await onClaim(site.id);

    if (lastVotedAt) {
      setClaimState("claimed");
      setLocalLastVotedAt(lastVotedAt);

      setTimeout(() => {
        setClaimState("idle");
        setLocalCanVote(false);
      }, 2000);
    } else {
      setClaimState("idle");
    }
  };

  const handleCooldownExpired = useCallback(() => {
    setLocalCanVote(true);
    setLocalLastVotedAt(null);
  }, []);

  const isOnCooldown = !localCanVote && !!localLastVotedAt;
  const isClickable = localCanVote && claimState === "idle";

  return (
    <div className="flex items-center gap-2">
      {/* Site image */}
      {site.imageUrl ? (
        <div
          className={`relative shrink-0 w-[72px] h-[24px] rounded overflow-hidden border transition-all duration-300 ${
            isOnCooldown ? "border-white/5 opacity-40" : "border-white/10"
          }`}
        >
          <Image
            unoptimized
            alt={site.name}
            className={`w-full h-full object-cover transition-all duration-300 ${
              isOnCooldown ? "grayscale" : ""
            }`}
            height={24}
            src={site.imageUrl}
            width={72}
          />
        </div>
      ) : (
        <span
          className={`shrink-0 text-[10px] font-medium truncate w-[72px] ${
            isOnCooldown ? "text-gray-500" : "text-gray-400"
          }`}
        >
          {site.name}
        </span>
      )}

      {/* Shard button / Cooldown timer */}
      <Button
        className={`relative h-auto min-w-0 flex-1 rounded px-2 py-1.5 text-xs font-semibold transition-all duration-300 data-[disabled=true]:opacity-100 ${
          claimState === "claimed"
            ? "vote-claim-active bg-purple-500/20 text-purple-300 border border-purple-400/40"
            : isClickable
              ? "bg-purple-500/10 text-purple-400 border border-purple-400/20 hover:bg-purple-500/20 hover:border-purple-400/40 hover:shadow-[0_0_10px_rgba(168,85,247,0.2)] cursor-pointer"
              : claimState === "claiming"
                ? "bg-purple-500/10 text-purple-400/50 border border-purple-400/20 cursor-wait"
                : "bg-white/5 text-gray-500 border border-white/5 cursor-default"
        }`}
        isDisabled={!isClickable}
        variant="flat"
        onPress={handleClick}
      >
        {claimState === "claiming" ? (
          <span className="flex items-center justify-center">
            <svg
              className="w-3 h-3 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                fill="currentColor"
              />
            </svg>
          </span>
        ) : claimState === "claimed" ? (
          <span className="vote-claim-text flex items-center justify-center gap-1">
            +{site.rewardShards}
            <ShardIcon className="w-3.5 h-3.5" />
          </span>
        ) : isOnCooldown ? (
          <span className="flex items-center justify-center gap-1">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            <CooldownTimer
              cooldownHours={site.cooldownHours}
              lastVotedAt={localLastVotedAt!}
              onExpired={handleCooldownExpired}
            />
          </span>
        ) : (
          <span className="flex items-center justify-center gap-1">
            +{site.rewardShards}
            <ShardIcon className="w-3.5 h-3.5" />
          </span>
        )}
      </Button>
    </div>
  );
}

function GuestPrompt({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("vote");
  const locale = useLocale();

  return (
    <div className="flex flex-col items-center gap-2 py-3 px-2 text-center">
      <ShardIcon className="w-8 h-8" />
      <p className="text-[11px] text-gray-400 leading-tight">
        {t("earnShards")}
      </p>
      <div className="flex gap-2 w-full">
        <Link
          className="flex-1 rounded-md py-1.5 text-[10px] font-semibold bg-purple-500/15 text-purple-400 border border-purple-400/25 hover:bg-purple-500/25 transition-all text-center"
          href={`/${locale}/login`}
          onClick={onNavigate}
        >
          {t("login")}
        </Link>
        <Link
          className="flex-1 rounded-md py-1.5 text-[10px] font-semibold bg-wow-gold/10 text-wow-gold border border-wow-gold/20 hover:bg-wow-gold/20 transition-all text-center"
          href={`/${locale}/register`}
          onClick={onNavigate}
        >
          {t("register")}
        </Link>
      </div>
    </div>
  );
}

export function VotePanel() {
  const t = useTranslations("vote");
  const { user, loading: authLoading } = useAuth();
  const [sites, setSites] = useState<VoteSite[]>([]);
  const [desktopCollapsed, setDesktopCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;

    try {
      return localStorage.getItem("vote-panel-collapsed") === "true";
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const isGuest = !authLoading && !user;
  const isReady = !!user && loaded && sites.length > 0;

  const toggleDesktop = useCallback((value: boolean) => {
    setDesktopCollapsed(value);

    try {
      localStorage.setItem("vote-panel-collapsed", String(value));
    } catch {
      // ignore
    }
  }, []);

  // the top bar's, the burger's and the footer's "Vote" (components/navigation/vote-event.ts): the panel unfolded, the phone's sheet opened
  useEffect(() => {
    const open = () => {
      toggleDesktop(false);
      setMobileOpen(window.matchMedia("(max-width: 1023px)").matches);
    };

    window.addEventListener(OPEN_VOTE_EVENT, open);

    return () => window.removeEventListener(OPEN_VOTE_EVENT, open);
  }, [toggleDesktop]);

  const fetchSites = useCallback(async () => {
    try {
      const res = await fetch("/api/vote/sites");

      if (!res.ok) return;

      const data = await res.json();

      setSites(data.sites || []);
    } catch {
      // ignore
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchSites();

      const interval = setInterval(fetchSites, 5 * 60 * 1000);

      return () => clearInterval(interval);
    } else {
      setSites([]);
      setLoaded(false);
    }
  }, [user, fetchSites]);

  const handleClaim = useCallback(
    async (siteId: number): Promise<string | null> => {
      try {
        const res = await fetch("/api/vote/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ siteId }),
        });

        if (!res.ok) return null;

        const data = await res.json();
        const lastVotedAt: string | null = data.lastVotedAt || null;

        if (lastVotedAt) {
          setSites((prev) =>
            prev.map((s) =>
              s.id === siteId ? { ...s, canVote: false, lastVotedAt } : s,
            ),
          );
        }

        return lastVotedAt;
      } catch {
        return null;
      }
    },
    [],
  );

  if (authLoading || (!isGuest && !isReady)) return null;

  const availableCount = sites.filter((s) => s.canVote).length;

  return (
    <>
      {/* ── Desktop ── */}
      <div className="fixed right-3 top-20 z-40 hidden lg:block">
        {desktopCollapsed ? (
          <Button
            className="glass h-auto min-w-0 gap-1.5 rounded-lg border border-wow-gold/20 px-3 py-2 text-xs font-medium text-wow-gold data-[hover=true]:border-wow-gold/40 data-[hover=true]:bg-wow-gold/5"
            size="sm"
            variant="bordered"
            onPress={() => toggleDesktop(false)}
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M15 19l-7-7 7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            {t("expand")}
          </Button>
        ) : (
          <div className="glass border-wow-gold/15 rounded-xl w-48 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
              <span className="text-xs font-semibold wow-gradient-text uppercase tracking-wider">
                {t("title")}
              </span>
              <Button
                isIconOnly
                aria-label={t("collapse")}
                className="h-6 w-6 min-w-0 text-gray-500 data-[hover=true]:text-gray-300"
                size="sm"
                variant="light"
                onPress={() => toggleDesktop(true)}
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 5l7 7-7 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </Button>
            </div>

            {isGuest ? (
              <GuestPrompt />
            ) : (
              <div className="p-2 space-y-2">
                {sites.map((site) => (
                  <VoteSiteCard
                    key={site.id}
                    site={site}
                    onClaim={handleClaim}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Mobile ── */}
      <div className="lg:hidden">
        {/* FAB */}
        <Button
          isIconOnly
          aria-label={t("title")}
          className={`glass fixed bottom-4 right-4 z-40 h-12 w-12 min-w-0 overflow-visible rounded-full border border-purple-400/30 shadow-[0_4px_20px_rgba(0,0,0,0.4)] ${
            mobileOpen ? "pointer-events-none opacity-0" : ""
          }`}
          variant="bordered"
          onPress={() => setMobileOpen(true)}
        >
          <ShardIcon className="w-6 h-6" />
          {!isGuest && availableCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {availableCount}
            </span>
          )}
        </Button>

        {/* the bottom sheet: HeroUI's Drawer (Ayoub, 18/10/2026: HeroUI's own components) */}
        <Drawer
          classNames={{
            base: "glass rounded-t-2xl border-t border-wow-gold/15 bg-[#0b1020]/95 shadow-[0_-4px_30px_rgba(0,0,0,0.5)]",
            header: "border-b border-white/5 px-4 py-2.5",
            closeButton: "text-gray-400 hover:text-gray-200",
            body: "max-h-[60vh] overflow-y-auto p-4",
          }}
          isOpen={mobileOpen}
          placement="bottom"
          onOpenChange={setMobileOpen}
        >
          <DrawerContent aria-label={t("title")}>
            <DrawerHeader>
              <span className="text-xs font-semibold wow-gradient-text uppercase tracking-wider">
                {t("title")}
              </span>
            </DrawerHeader>
            <DrawerBody>
              {isGuest ? (
                <GuestPrompt onNavigate={() => setMobileOpen(false)} />
              ) : (
                <div className="space-y-2.5">
                  {sites.map((site) => (
                    <VoteSiteCard
                      key={site.id}
                      site={site}
                      onClaim={handleClaim}
                    />
                  ))}
                </div>
              )}
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}
