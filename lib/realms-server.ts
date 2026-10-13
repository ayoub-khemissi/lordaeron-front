import mysql from "mysql2/promise";

import { charactersDb } from "@/lib/db";
import { DEFAULT_REALM, type RealmSlug } from "@/lib/realms";

/*
 * The server side of a realm (lib/realms.ts): its databases, its SOAP and its client data. Pools are made on first use and kept.
 */

interface RealmServer {
  worldDbName: string;
  charactersDbName: string;
  soapHost: string;
  soapPort: number;
  dbcDir: string;
  // its worldserver.conf: a few settings the Tools pages show (lib/realm-config.ts reads only those)
  worldConf: string;
}

const env = (slug: RealmSlug, key: string, fallback: string) =>
  process.env[`${slug.toUpperCase()}_${key}`] || fallback;

export function realmServer(slug: RealmSlug): RealmServer {
  if (slug === "lordaeron")
    return {
      worldDbName: env(
        slug,
        "DB_WORLD_NAME",
        process.env.DB_WORLD_NAME || "world",
      ),
      charactersDbName: env(
        slug,
        "DB_CHARACTERS_NAME",
        process.env.DB_CHARACTERS_NAME || "characters",
      ),
      soapHost: env(slug, "SOAP_HOST", process.env.SOAP_HOST || "127.0.0.1"),
      soapPort: Number(env(slug, "SOAP_PORT", process.env.SOAP_PORT || "7878")),
      dbcDir: env(slug, "DBC_DIR", "/home/ubuntu/server/data/dbc"),
      worldConf: env(
        slug,
        "WORLDSERVER_CONF",
        "/home/ubuntu/server/etc/worldserver.conf",
      ),
    };

  // Rimeheart: its own worldserver (Ayoub, 13/10/2026: realm 4, port 8088, /home/ubuntu/server-rimeheart), the Lab stays the test realm
  return {
    worldDbName: env(slug, "DB_WORLD_NAME", "rimeheart_world"),
    charactersDbName: env(slug, "DB_CHARACTERS_NAME", "rimeheart_characters"),
    soapHost: env(slug, "SOAP_HOST", "127.0.0.1"),
    soapPort: Number(env(slug, "SOAP_PORT", "7881")),
    dbcDir: env(slug, "DBC_DIR", "/home/ubuntu/server-rimeheart/data/dbc"),
    worldConf: env(
      slug,
      "WORLDSERVER_CONF",
      "/home/ubuntu/server-rimeheart/etc/worldserver.conf",
    ),
  };
}

const pools = new Map<string, mysql.Pool>();

function pool(database: string) {
  let p = pools.get(database);

  if (!p) {
    p = mysql.createPool({
      host: process.env.DB_CHARACTERS_HOST || "localhost",
      port: parseInt(process.env.DB_CHARACTERS_PORT || "3306"),
      user: process.env.DB_CHARACTERS_USER || "root",
      password: process.env.DB_CHARACTERS_PASSWORD || "",
      database,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      decimalNumbers: true,
    });
    pools.set(database, p);
  }

  return p;
}

export const realmWorldDb = (slug: RealmSlug) =>
  pool(realmServer(slug).worldDbName);
// Lordaeron's characters: the site's own pool (lib/db.ts) unless its database is overridden
export const realmCharactersDb = (slug: RealmSlug) =>
  slug === DEFAULT_REALM && !process.env.LORDAERON_DB_CHARACTERS_NAME
    ? charactersDb
    : pool(realmServer(slug).charactersDbName);
