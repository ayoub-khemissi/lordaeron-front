"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Chip } from "@heroui/chip";

import { useRealm } from "@/lib/realm-context";

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  if (days > 0) {
    return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  }

  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}

export const ServerStatus = () => {
  const t = useTranslations("common");
  const [online, setOnline] = useState<boolean | null>(null);
  const realm = useRealm();
  const [realmName, setRealmName] = useState(realm.name);
  const [uptime, setUptime] = useState<number | null>(null);
  const starttimeRef = useRef<number | null>(null);

  const computeUptime = useCallback(() => {
    if (starttimeRef.current === null) return null;

    return Math.floor(Date.now() / 1000) - starttimeRef.current;
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/server/status?realm=${realm.slug}`);
        const data = await res.json();

        setOnline(data.online);
        setRealmName(data.name || realm.name);
        starttimeRef.current = data.starttime ?? null;
        setUptime(computeUptime());
      } catch {
        setOnline(false);
        starttimeRef.current = null;
        setUptime(null);
      }
    };

    fetchStatus();
    const fetchInterval = setInterval(fetchStatus, 30000);

    return () => clearInterval(fetchInterval);
  }, [computeUptime, realm.slug, realm.name]);

  useEffect(() => {
    if (starttimeRef.current === null) return;

    const tickInterval = setInterval(() => {
      setUptime(computeUptime());
    }, 1000);

    return () => clearInterval(tickInterval);
  }, [online, computeUptime]);

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex flex-col items-center gap-2"
      initial={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <div
        className={`
          inline-flex items-center gap-3 px-6 py-3 rounded-full
          glass
          ${online === true ? "glow-pulse border-green-500/20" : online === false ? "border-red-500/20" : "border-default-700/20"}
        `}
      >
        {/* Animated dot */}
        <span className="relative flex h-3 w-3">
          {online && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-3 w-3 ${
              online === null
                ? "bg-default-400"
                : online
                  ? "bg-green-400"
                  : "bg-red-500"
            }`}
          />
        </span>

        <span className="text-sm font-medium text-gray-200">
          {realmName}:{" "}
          <span
            className={
              online === null
                ? "text-gray-400"
                : online
                  ? "text-green-400"
                  : "text-red-400"
            }
          >
            {online === null
              ? t("loading")
              : online
                ? t("online")
                : t("offline")}
          </span>
        </span>
      </div>

      {online && uptime !== null && (
        <Chip
          classNames={{
            base: "bg-transparent border border-wow-gold/50 shadow-[0_0_8px_rgba(199,156,62,0.25)]",
            content: "text-wow-gold text-xs font-mono tracking-wider",
          }}
          size="sm"
          variant="bordered"
        >
          {formatUptime(uptime)}
        </Chip>
      )}
    </motion.div>
  );
};
