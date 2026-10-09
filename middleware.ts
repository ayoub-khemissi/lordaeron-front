import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

import { DEFAULT_REALM, REALM_SLUGS } from "@/lib/realms";

const intlMiddleware = createMiddleware(routing);

// a realm's sections behind the login (/account, shared, too)
const protectedPaths = ["/shop"];
const guestOnlyPaths = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];
// a realm's sections not open yet
const blockedPaths = ["/armory"];
// before the realms had portals (09/10/2026), these were Lordaeron's at the locale's root
const legacyRealmSections = [
  "/how-to",
  "/features",
  "/epic-progression",
  "/raid-scaling",
  "/armory",
  "/shop",
];
const REALM_PREFIX = new RegExp(`^/(${REALM_SLUGS.join("|")})(/|$)`);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip locale prefix to get the raw path
  const pathWithoutLocale = pathname.replace(
    /^\/(fr|en|es|de|it|ru|pl|pt)(\/|$)/,
    "/",
  );

  const localeMatch = pathname.match(/^\/(fr|en|es|de|it|ru|pl|pt)(\/|$)/);
  const locale = localeMatch ? localeMatch[1] : "en";
  const session = request.cookies.get("lordaeron_session");
  const under = (path: string, p: string) =>
    path === p || path.startsWith(p + "/");

  // the addresses from before the realms' portals: a realm's section without its realm is Lordaeron's, the showcase is Rimeheart's
  if (localeMatch) {
    if (legacyRealmSections.some((p) => under(pathWithoutLocale, p))) {
      const url = request.nextUrl.clone();

      url.pathname = `/${locale}/${DEFAULT_REALM}${pathWithoutLocale}`;

      return NextResponse.redirect(url, 308);
    }
    if (under(pathWithoutLocale, "/experience")) {
      const url = request.nextUrl.clone();

      url.pathname = `/${locale}/rimeheart`;

      return NextResponse.redirect(url, 308);
    }
  }

  // a realm's pages follow the same rules as before, by their section (/fr/rimeheart/shop: "/shop")
  const realmMatch = pathWithoutLocale.match(REALM_PREFIX);
  const realm = realmMatch ? realmMatch[1] : null;
  const sectionPath = realmMatch
    ? pathWithoutLocale.slice(realmMatch[1].length + 1) || "/"
    : pathWithoutLocale;

  const isBlocked = !!realm && blockedPaths.some((p) => under(sectionPath, p));

  if (isBlocked) {
    return NextResponse.redirect(new URL(`/${locale}/${realm}`, request.url));
  }

  const isProtected =
    under(pathWithoutLocale, "/account") ||
    (!!realm && protectedPaths.some((p) => under(sectionPath, p)));

  if (isProtected && !session) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  const isGuestOnly = guestOnlyPaths.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(p + "/"),
  );

  if (isGuestOnly && session) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(fr|en|es|de|it|ru|pl|pt)/:path*"],
};
