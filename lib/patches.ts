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
