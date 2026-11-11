"use client";

import type { LauncherInfo } from "@/lib/patches";

import { useEffect, useState } from "react";

export type Platform = "windows" | "mac";

// The visitor's system, read once the page shows (the server cannot know it; Windows until then). An iPad also says
// Macintosh, but it has a touch screen.
export function usePlatform(): Platform {
  const [platform, setPlatform] = useState<Platform>("windows");

  useEffect(() => {
    if (
      /Macintosh|Mac OS X/.test(navigator.userAgent) &&
      navigator.maxTouchPoints <= 1
    )
      setPlatform("mac");
  }, []);

  return platform;
}

// The launcher's download for a system: the Mac's when there is one, else Windows'
export function launcherBuild(launcher: LauncherInfo, platform: Platform) {
  const mac = platform === "mac" && launcher.mac;

  return mac
    ? { mac: true, ...launcher.mac! }
    : {
        mac: false,
        url: launcher.url,
        size: launcher.size,
        sha256: launcher.sha256,
      };
}
