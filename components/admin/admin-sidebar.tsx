"use client";

import Image from "next/image";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

const NAV_ITEMS = [
  { key: "dashboard", href: "", icon: "\uD83D\uDCCA" },
  { key: "items", href: "/items", icon: "\uD83D\uDCE6" },
  { key: "sets", href: "/sets", icon: "\uD83D\uDC57" },
  { key: "purchases", href: "/purchases", icon: "\uD83D\uDED2" },
  { key: "bans", href: "/bans", icon: "\uD83D\uDEAB" },
  { key: "audit", href: "/audit", icon: "\uD83D\uDCDD" },
  { key: "contactMessages", href: "/contact-messages", icon: "\uD83D\uDCE7" },
  { key: "news", href: "/news", icon: "\uD83D\uDCF0" },
  { key: "realMoney", href: "/real-money", icon: "\uD83D\uDCB0" },
];

// the map editor, its own site (mapper.lordaeron.eu): opened through /api/admin/map-editor, which hands it the admin's session
const MAP_EDITOR = {
  key: "mapEditor",
  href: "/api/admin/map-editor",
  icon: "\uD83D\uDDFA\uFE0F",
};

export function AdminSidebar() {
  const t = useTranslations("admin.nav");
  const locale = useLocale();
  const pathname = usePathname();

  const basePath = `/${locale}/admin`;

  return (
    <aside className="w-64 min-h-screen bg-[#0d1117] border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <NextLink className="flex items-center gap-2" href={basePath}>
          <Image
            alt="Lordaeron"
            className="drop-shadow-[0_0_6px_rgba(199,156,62,0.4)]"
            height={32}
            src="/img/logo/logo.png"
            width={32}
          />
          <span className="font-heading font-bold text-lg wow-gradient-text uppercase">
            Dashboard
          </span>
        </NextLink>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const href = `${basePath}${item.href}`;
            const isActive =
              item.href === ""
                ? pathname === basePath || pathname === `${basePath}/`
                : pathname.startsWith(href);

            return (
              <li key={item.key}>
                <NextLink
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-wow-gold/10 text-wow-gold border border-wow-gold/20"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                  }`}
                  href={href}
                >
                  <span>{item.icon}</span>
                  <span>{t(item.key)}</span>
                </NextLink>
              </li>
            );
          })}
          <li>
            <a
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
              href={MAP_EDITOR.href}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span>{MAP_EDITOR.icon}</span>
              <span>{t(MAP_EDITOR.key)}</span>
              <span aria-hidden className="ml-auto text-xs">
                {"\u2197"}
              </span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
