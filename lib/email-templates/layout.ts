/*
 * Lordaeron's e-mail layout (Ayoub, 13/10/2026: "des templates de mails vraiment beaux, responsive, avec mentions légales en bas",
 * on the model of majaliss's Layout): a Northrend banner, the mark and the name, one card, one button, and a footer that says who is
 * writing, why this arrived, how to reach us, the terms and the privacy policy (and, for news only, how to stop them).
 *
 * Tables and inline styles only, 600 px wide and fluid below it: Gmail strips <style> blocks in some views, Outlook knows neither
 * flex nor background images, so everything that matters is inline and the media query only tightens the margins on phones. The
 * page is dark by design (the site's), declared as such so that mail apps do not invert it. Every e-mail has its plain-text twin.
 */

export const EMAIL_LOCALES = [
  "en",
  "fr",
  "de",
  "es",
  "it",
  "pl",
  "pt",
  "ru",
] as const;
export type EmailLocale = (typeof EMAIL_LOCALES)[number];

export function emailLocale(locale: string | null | undefined): EmailLocale {
  return (EMAIL_LOCALES as readonly string[]).includes(locale ?? "")
    ? (locale as EmailLocale)
    : "en";
}

export const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.lordaeron.eu"
).replace(/\/$/, "");
export const CONTACT_EMAIL = "contact@lordaeron.eu";

const COLORS = {
  ground: "#07090e",
  card: "#0f141d",
  cardBorder: "#2b2617",
  gold: "#d9a845",
  goldLight: "#f3e3b5",
  text: "#c9c3b6",
  muted: "#8a8478",
  faint: "#5f5b54",
  ice: "#7dd3fc",
  iceGround: "#0b1824",
};
const SERIF = "Georgia,'Times New Roman',serif";
const SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

type Footer = {
  signature: string;
  why: { account: string; news: string };
  questions: string;
  terms: string;
  privacy: string;
  account: string;
  unsubscribe: string;
  disclaimer: string;
  linkHint: string;
};

const FOOTER: Record<EmailLocale, Footer> = {
  en: {
    signature: "Lordaeron, by the Lordaeron project team",
    why: {
      account:
        "You are receiving this e-mail because a Lordaeron account uses this address. It is a service message about your account, sent whatever your news preferences.",
      news: "You are receiving this e-mail because you asked to hear about Lordaeron's news. You can stop at any time, in one click.",
    },
    questions: "A question? Reply to this e-mail or write to",
    terms: "Terms of use",
    privacy: "Privacy policy",
    account: "My account",
    unsubscribe: "Unsubscribe",
    disclaimer:
      "Lordaeron is a free community project, not affiliated with Blizzard Entertainment. World of Warcraft is a trademark of Blizzard Entertainment, Inc.",
    linkHint: "If the button does not work, copy this link into your browser:",
  },
  fr: {
    signature: "Lordaeron, par l'équipe du projet Lordaeron",
    why: {
      account:
        "Vous recevez cet e-mail car un compte Lordaeron utilise cette adresse. C'est un message de service sur votre compte, envoyé quelles que soient vos préférences de nouvelles.",
      news: "Vous recevez cet e-mail car vous avez demandé à suivre les nouveautés de Lordaeron. Vous pouvez arrêter à tout moment, en un clic.",
    },
    questions: "Une question ? Répondez à cet e-mail ou écrivez à",
    terms: "Conditions d'utilisation",
    privacy: "Politique de confidentialité",
    account: "Mon compte",
    unsubscribe: "Se désabonner",
    disclaimer:
      "Lordaeron est un projet communautaire gratuit, non affilié à Blizzard Entertainment. World of Warcraft est une marque de Blizzard Entertainment, Inc.",
    linkHint:
      "Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :",
  },
  de: {
    signature: "Lordaeron, vom Team des Lordaeron-Projekts",
    why: {
      account:
        "Du erhältst diese E-Mail, weil ein Lordaeron-Konto diese Adresse verwendet. Es ist eine Servicenachricht zu deinem Konto, unabhängig von deinen Neuigkeiten-Einstellungen.",
      news: "Du erhältst diese E-Mail, weil du über Neuigkeiten von Lordaeron informiert werden möchtest. Du kannst dich jederzeit mit einem Klick abmelden.",
    },
    questions: "Eine Frage? Antworte auf diese E-Mail oder schreibe an",
    terms: "Nutzungsbedingungen",
    privacy: "Datenschutzerklärung",
    account: "Mein Konto",
    unsubscribe: "Abmelden",
    disclaimer:
      "Lordaeron ist ein kostenloses Community-Projekt und nicht mit Blizzard Entertainment verbunden. World of Warcraft ist eine Marke von Blizzard Entertainment, Inc.",
    linkHint:
      "Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:",
  },
  es: {
    signature: "Lordaeron, del equipo del proyecto Lordaeron",
    why: {
      account:
        "Recibes este correo porque una cuenta de Lordaeron usa esta dirección. Es un mensaje de servicio sobre tu cuenta, enviado sean cuales sean tus preferencias de novedades.",
      news: "Recibes este correo porque pediste estar al tanto de las novedades de Lordaeron. Puedes darte de baja cuando quieras, con un clic.",
    },
    questions: "¿Una pregunta? Responde a este correo o escribe a",
    terms: "Condiciones de uso",
    privacy: "Política de privacidad",
    account: "Mi cuenta",
    unsubscribe: "Darse de baja",
    disclaimer:
      "Lordaeron es un proyecto comunitario gratuito, no afiliado a Blizzard Entertainment. World of Warcraft es una marca de Blizzard Entertainment, Inc.",
    linkHint: "Si el botón no funciona, copia este enlace en tu navegador:",
  },
  it: {
    signature: "Lordaeron, dal team del progetto Lordaeron",
    why: {
      account:
        "Ricevi questa email perché un account Lordaeron usa questo indirizzo. È un messaggio di servizio sul tuo account, inviato indipendentemente dalle tue preferenze sulle novità.",
      news: "Ricevi questa email perché hai chiesto di seguire le novità di Lordaeron. Puoi smettere in qualsiasi momento, con un clic.",
    },
    questions: "Una domanda? Rispondi a questa email o scrivi a",
    terms: "Condizioni d'uso",
    privacy: "Informativa sulla privacy",
    account: "Il mio account",
    unsubscribe: "Annulla l'iscrizione",
    disclaimer:
      "Lordaeron è un progetto comunitario gratuito, non affiliato a Blizzard Entertainment. World of Warcraft è un marchio di Blizzard Entertainment, Inc.",
    linkHint: "Se il pulsante non funziona, copia questo link nel tuo browser:",
  },
  pl: {
    signature: "Lordaeron, zespół projektu Lordaeron",
    why: {
      account:
        "Otrzymujesz tę wiadomość, ponieważ konto Lordaeron używa tego adresu. To wiadomość serwisowa dotycząca twojego konta, wysyłana niezależnie od ustawień nowości.",
      news: "Otrzymujesz tę wiadomość, ponieważ chcesz śledzić nowości Lordaeron. Możesz zrezygnować w każdej chwili jednym kliknięciem.",
    },
    questions: "Masz pytanie? Odpowiedz na tę wiadomość lub napisz na",
    terms: "Warunki korzystania",
    privacy: "Polityka prywatności",
    account: "Moje konto",
    unsubscribe: "Wypisz się",
    disclaimer:
      "Lordaeron to darmowy projekt społeczności, niezwiązany z Blizzard Entertainment. World of Warcraft jest znakiem towarowym Blizzard Entertainment, Inc.",
    linkHint: "Jeśli przycisk nie działa, skopiuj ten link do przeglądarki:",
  },
  pt: {
    signature: "Lordaeron, pela equipa do projeto Lordaeron",
    why: {
      account:
        "Recebes este e-mail porque uma conta Lordaeron usa este endereço. É uma mensagem de serviço sobre a tua conta, enviada independentemente das tuas preferências de novidades.",
      news: "Recebes este e-mail porque pediste para acompanhar as novidades de Lordaeron. Podes parar a qualquer momento, com um clique.",
    },
    questions: "Uma pergunta? Responde a este e-mail ou escreve para",
    terms: "Termos de utilização",
    privacy: "Política de privacidade",
    account: "A minha conta",
    unsubscribe: "Cancelar subscrição",
    disclaimer:
      "Lordaeron é um projeto comunitário gratuito, não afiliado à Blizzard Entertainment. World of Warcraft é uma marca da Blizzard Entertainment, Inc.",
    linkHint: "Se o botão não funcionar, copia este link para o teu navegador:",
  },
  ru: {
    signature: "Lordaeron, команда проекта Lordaeron",
    why: {
      account:
        "Вы получили это письмо, потому что этот адрес привязан к учётной записи Lordaeron. Это служебное сообщение о вашей учётной записи, оно отправляется независимо от настроек новостей.",
      news: "Вы получили это письмо, потому что подписались на новости Lordaeron. Отписаться можно в любой момент одним кликом.",
    },
    questions: "Есть вопрос? Ответьте на это письмо или напишите на",
    terms: "Условия использования",
    privacy: "Политика конфиденциальности",
    account: "Моя учётная запись",
    unsubscribe: "Отписаться",
    disclaimer:
      "Lordaeron — бесплатный проект сообщества, не связанный с Blizzard Entertainment. World of Warcraft является товарным знаком Blizzard Entertainment, Inc.",
    linkHint:
      "Если кнопка не работает, скопируйте эту ссылку в адресную строку браузера:",
  },
};

export interface EmailContent {
  locale: string;
  subject: string;
  // the inbox preview line, after the subject
  preview: string;
  heading: string;
  // plain text: escaped here; **bold** marks a few words
  paragraphs: string[];
  // a framed line under the text (an address, a name), ice-blue
  highlight?: { label: string; value: string };
  cta?: { label: string; url: string };
  // small grey lines under the button (expiry, "not you?")
  notes?: string[];
  // account: a service message; news: a message the player asked for, with its unsubscribe link
  kind?: "account" | "news";
  unsubscribeUrl?: string;
}

const escape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const rich = (s: string) =>
  escape(s).replace(
    /\*\*(.+?)\*\*/g,
    `<strong style="color:${COLORS.goldLight};font-weight:700;">$1</strong>`,
  );
const plain = (s: string) => s.replace(/\*\*(.+?)\*\*/g, "$1");

export function renderEmail(c: EmailContent): {
  subject: string;
  html: string;
  text: string;
} {
  const lang = emailLocale(c.locale);
  const f = FOOTER[lang];
  const kind = c.kind ?? "account";
  const link = (path: string) => `${SITE_URL}/${lang}${path}`;
  const footerLink = (href: string, label: string) =>
    `<a href="${escape(href)}" style="color:#b8a26a;text-decoration:underline;">${escape(label)}</a>`;
  const footerLinks = [
    footerLink(link("/account"), f.account),
    footerLink(link("/terms-of-use"), f.terms),
    footerLink(link("/privacy-policy"), f.privacy),
    ...(kind === "news" && c.unsubscribeUrl
      ? [footerLink(c.unsubscribeUrl, f.unsubscribe)]
      : []),
  ].join(
    `<span style="color:${COLORS.faint};">&nbsp;&nbsp;·&nbsp;&nbsp;</span>`,
  );

  const paragraphs = c.paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-family:${SANS};font-size:15px;line-height:1.65;color:${COLORS.text};">${rich(p)}</p>`,
    )
    .join("");
  const highlight = c.highlight
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 24px;"><tr><td style="background:${COLORS.iceGround};border-left:3px solid ${COLORS.ice};border-radius:6px;padding:14px 18px;">
        <p style="margin:0 0 4px;font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${COLORS.muted};">${escape(c.highlight.label)}</p>
        <p style="margin:0;font-family:${SANS};font-size:16px;font-weight:600;color:${COLORS.ice};word-break:break-all;">${escape(c.highlight.value)}</p>
      </td></tr></table>`
    : "";
  // a "bulletproof" button: the cell carries the color, so Outlook paints it too
  const cta = c.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:8px auto 28px;"><tr>
        <td align="center" bgcolor="${COLORS.gold}" style="border-radius:6px;background:${COLORS.gold};background-image:linear-gradient(180deg,#f6dc8f 0%,#d9a845 55%,#a8761f 100%);box-shadow:0 8px 24px rgba(217,168,69,0.25);">
          <a href="${escape(c.cta.url)}" target="_blank" style="display:inline-block;padding:15px 34px;font-family:${SANS};font-size:14px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#1f1505;text-decoration:none;border-radius:6px;">${escape(c.cta.label)}</a>
        </td></tr></table>`
    : "";
  const notes = (c.notes ?? [])
    .map(
      (n) =>
        `<p style="margin:0 0 8px;font-family:${SANS};font-size:13px;line-height:1.55;color:${COLORS.muted};">${rich(n)}</p>`,
    )
    .join("");
  const fallback = c.cta
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;"><tr><td style="border-top:1px solid ${COLORS.cardBorder};padding-top:16px;">
        <p style="margin:0 0 6px;font-family:${SANS};font-size:12px;color:${COLORS.faint};">${escape(f.linkHint)}</p>
        <p style="margin:0;font-family:${SANS};font-size:12px;line-height:1.5;word-break:break-all;"><a href="${escape(c.cta.url)}" style="color:${COLORS.ice};text-decoration:none;">${escape(c.cta.url)}</a></p>
      </td></tr></table>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="${lang}" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${escape(c.subject)}</title>
<style>
  :root { color-scheme: dark; supported-color-schemes: dark; }
  @media only screen and (max-width: 620px) {
    .lw-pad { padding-left: 20px !important; padding-right: 20px !important; }
    .lw-card { padding: 28px 22px !important; }
    .lw-h1 { font-size: 22px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${COLORS.ground};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${COLORS.ground};font-size:1px;line-height:1px;">${escape(c.preview)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${COLORS.ground}" style="background:${COLORS.ground};">
  <tr><td align="center" class="lw-pad" style="padding:24px 12px 40px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">
      <tr><td style="border-radius:14px 14px 0 0;overflow:hidden;line-height:0;">
        <a href="${SITE_URL}/${lang}" target="_blank" style="text-decoration:none;"><img src="${SITE_URL}/img/email/header-rimeheart.jpg" width="600" alt="" style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:14px 14px 0 0;"></a>
      </td></tr>
      <tr><td align="center" style="padding:0 0 22px;">
        <img src="${SITE_URL}/img/email/logo-144.png" width="64" height="64" alt="Lordaeron" style="display:block;margin:-6px auto 10px;border:0;">
        <p style="margin:0;font-family:${SERIF};font-size:20px;font-weight:700;letter-spacing:7px;color:${COLORS.gold};">LORDAERON</p>
      </td></tr>
      <tr><td class="lw-card" style="background:${COLORS.card};border:1px solid ${COLORS.cardBorder};border-radius:12px;padding:38px 36px;">
        <h1 class="lw-h1" style="margin:0 0 12px;font-family:${SERIF};font-size:25px;line-height:1.3;font-weight:700;color:${COLORS.goldLight};">${escape(c.heading)}</h1>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr><td width="56" height="2" bgcolor="${COLORS.gold}" style="background:${COLORS.gold};font-size:0;line-height:0;">&nbsp;</td><td width="18" height="2" style="font-size:0;line-height:0;">&nbsp;</td><td width="8" height="2" bgcolor="${COLORS.ice}" style="background:${COLORS.ice};font-size:0;line-height:0;">&nbsp;</td></tr></table>
        ${paragraphs}
        ${highlight}
        ${cta}
        ${notes}
        ${fallback}
      </td></tr>
      <tr><td align="center" class="lw-pad" style="padding:28px 24px 0;">
        <p style="margin:0 0 10px;font-family:${SERIF};font-size:13px;color:${COLORS.muted};">${escape(f.signature)}</p>
        <p style="margin:0 0 14px;font-family:${SANS};font-size:12px;line-height:1.6;color:${COLORS.faint};">${escape(f.why[kind])}</p>
        <p style="margin:0 0 14px;font-family:${SANS};font-size:12px;line-height:1.6;color:${COLORS.faint};">${escape(f.questions)} <a href="mailto:${CONTACT_EMAIL}" style="color:#b8a26a;text-decoration:underline;">${CONTACT_EMAIL}</a></p>
        <p style="margin:0 0 14px;font-family:${SANS};font-size:12px;line-height:1.8;">${footerLinks}</p>
        <p style="margin:0;font-family:${SANS};font-size:11px;line-height:1.6;color:#4a4740;">${escape(f.disclaimer)}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  const text = [
    "LORDAERON",
    "",
    c.heading,
    "",
    ...c.paragraphs.map(plain).flatMap((p) => [p, ""]),
    ...(c.highlight ? [`${c.highlight.label}: ${c.highlight.value}`, ""] : []),
    ...(c.cta ? [`${c.cta.label}: ${c.cta.url}`, ""] : []),
    ...(c.notes ?? []).map(plain),
    "",
    "--",
    f.signature,
    f.why[kind],
    `${f.questions} ${CONTACT_EMAIL}`,
    `${f.terms}: ${link("/terms-of-use")}`,
    `${f.privacy}: ${link("/privacy-policy")}`,
    ...(kind === "news" && c.unsubscribeUrl
      ? [`${f.unsubscribe}: ${c.unsubscribeUrl}`]
      : []),
    f.disclaimer,
  ].join("\n");

  return { subject: c.subject, html, text };
}
