import type { Metadata } from "next";

import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import clsx from "clsx";

import { Providers } from "./providers";

import { routing } from "@/i18n/routing";
import { fontSans, fontHeading } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AuthProvider } from "@/lib/auth-context";
import { CookieBanner } from "@/components/cookie-banner";
import { VotePanel } from "@/components/vote-panel";

const ogLocaleMap: Record<string, string> = {
  en: "en_US",
  fr: "fr_FR",
  es: "es_ES",
  de: "de_DE",
  it: "it_IT",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const alternateLocale = routing.locales
    .filter((l) => l !== locale)
    .map((l) => ogLocaleMap[l] || l);

  return {
    openGraph: {
      locale: ogLocaleMap[locale] || locale,
      alternateLocale,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <html suppressHydrationWarning lang={locale}>
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable,
          fontHeading.variable,
        )}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers
            themeProps={{
              attribute: "class",
              defaultTheme: "dark",
              forcedTheme: "dark",
            }}
          >
            <AuthProvider>
              <div className="relative flex flex-col min-h-screen">
                <Navbar />
                <VotePanel />
                <main className="flex-grow">{children}</main>
                <Footer />
                <CookieBanner />
              </div>
            </AuthProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
