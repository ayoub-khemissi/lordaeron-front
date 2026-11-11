import { promises as fs } from "fs";
import path from "path";

/*
 * The client patches nginx serves at /patches/ from /var/www/lordaeron-patches (Ayoub, 13/10/2026: a patch changes with its realm, so it
 * lives outside the site's build): their folder's manifest.json says each file's version, size and SHA-256, read at request time, so a new
 * patch shows without a rebuild.
 *   { "patch-W.MPQ": { "version": "2026-10-13 12:00", "size": 24207358, "sha256": "..." }, "patch-Z.MPQ": { ... } }
 */

const PATCHES_DIR = process.env.PATCHES_DIR || "/var/www/lordaeron-patches";

export interface PatchInfo {
  file: string;
  url: string;
  version: string;
  size: number;
  sha256: string;
}

// a patch's entry in the manifest; null while it is not published (no manifest, no entry)
export async function patchInfo(file: string): Promise<PatchInfo | null> {
  try {
    const manifest = JSON.parse(
      await fs.readFile(path.join(PATCHES_DIR, "manifest.json"), "utf8"),
    ) as Record<string, Omit<PatchInfo, "file" | "url">>;
    const entry = manifest[file];

    if (!entry?.sha256) return null;

    return {
      file,
      url: `/patches/${file}`,
      version: String(entry.version ?? ""),
      size: Number(entry.size ?? 0),
      sha256: String(entry.sha256),
    };
  } catch {
    return null;
  }
}

export interface LauncherBuild {
  url: string;
  size: number;
  sha256: string;
}

export interface LauncherInfo {
  version: string;
  date: string;
  url: string;
  size: number;
  sha256: string;
  // the Mac app (latest.json "mac"), when the build has one
  mac: LauncherBuild | null;
  // the source of the Lumenveil build the launcher installs (the GNU GPL v2's due), hosted beside it; null if unknown
  lumenveilSource: string | null;
}

// the Lumenveil feed the launcher's stable channel names (launcher/launcher.json), and its "source": an archive on lordaeron.eu
// (scripts/lumenveil-publish.sh), never a GitHub account (Ayoub, 06/11/2026: no name of his on the site)
async function lumenveilSource(): Promise<string | null> {
  try {
    const launcher = JSON.parse(
      await fs.readFile(path.join(PATCHES_DIR, "launcher", "launcher.json"), "utf8"),
    );
    const feed = path.basename(String(launcher?.lumenveil?.stable ?? ""));

    if (!/^[\w.-]+\.json$/.test(feed)) return null;
    const info = JSON.parse(
      await fs.readFile(path.join(PATCHES_DIR, "lumenveil", feed), "utf8"),
    );
    const source = String(info?.source ?? "");

    return source.startsWith("https://lordaeron.eu/") ? source : null;
  } catch {
    return null;
  }
}

// the Lordaeron launcher, as scripts/launcher-publish.sh publishes it (launcher/latest.json); null until a first
// build is published, so its card on the how-to pages shows only once there is something to download
export async function launcherInfo(): Promise<LauncherInfo | null> {
  try {
    const info = JSON.parse(
      await fs.readFile(
        path.join(PATCHES_DIR, "launcher", "latest.json"),
        "utf8",
      ),
    ) as Partial<LauncherInfo>;

    if (!info.sha256 || !info.version) return null;

    return {
      version: String(info.version),
      date: String(info.date ?? ""),
      url: "/patches/launcher/Lordaeron-Setup.exe",
      size: Number(info.size ?? 0),
      sha256: String(info.sha256),
      mac: info.mac?.sha256
        ? {
            url: "/patches/launcher/Lordaeron.dmg",
            size: Number(info.mac.size ?? 0),
            sha256: String(info.mac.sha256),
          }
        : null,
      lumenveilSource: await lumenveilSource(),
    };
  } catch {
    return null;
  }
}
