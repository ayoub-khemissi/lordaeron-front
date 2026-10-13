import { emailLocale, renderEmail, type EmailLocale } from "./layout";

// the password reset link (app/api/auth/forgot-password), valid one hour
const T: Record<
  EmailLocale,
  {
    subject: string;
    preview: string;
    heading: string;
    body: string;
    cta: string;
    expiry: string;
    ignore: string;
  }
> = {
  en: {
    subject: "Reset your Lordaeron password",
    preview: "A new password for your account, in one click.",
    heading: "Choose a new password",
    body: "Someone (hopefully you) asked to reset the password of your Lordaeron account. Click the button below to choose a new one.",
    cta: "Reset my password",
    expiry: "This link works once and expires in **1 hour**.",
    ignore: "Not you? Ignore this e-mail: your password stays as it is.",
  },
  fr: {
    subject: "Réinitialiser votre mot de passe Lordaeron",
    preview: "Un nouveau mot de passe pour votre compte, en un clic.",
    heading: "Choisissez un nouveau mot de passe",
    body: "Quelqu'un (vous, espérons-le) a demandé à réinitialiser le mot de passe de votre compte Lordaeron. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.",
    cta: "Réinitialiser mon mot de passe",
    expiry: "Ce lien ne sert qu'une fois et expire dans **1 heure**.",
    ignore:
      "Ce n'est pas vous ? Ignorez cet e-mail : votre mot de passe reste inchangé.",
  },
  de: {
    subject: "Setze dein Lordaeron-Passwort zurück",
    preview: "Ein neues Passwort für dein Konto, mit einem Klick.",
    heading: "Wähle ein neues Passwort",
    body: "Jemand (hoffentlich du) hat das Zurücksetzen des Passworts deines Lordaeron-Kontos angefordert. Klicke auf den Button, um ein neues zu wählen.",
    cta: "Passwort zurücksetzen",
    expiry: "Dieser Link funktioniert einmal und läuft in **1 Stunde** ab.",
    ignore:
      "Das warst nicht du? Ignoriere diese E-Mail: Dein Passwort bleibt unverändert.",
  },
  es: {
    subject: "Restablece tu contraseña de Lordaeron",
    preview: "Una nueva contraseña para tu cuenta, en un clic.",
    heading: "Elige una nueva contraseña",
    body: "Alguien (esperamos que tú) pidió restablecer la contraseña de tu cuenta de Lordaeron. Haz clic en el botón para elegir una nueva.",
    cta: "Restablecer mi contraseña",
    expiry: "Este enlace sirve una sola vez y caduca en **1 hora**.",
    ignore: "¿No fuiste tú? Ignora este correo: tu contraseña no cambia.",
  },
  it: {
    subject: "Reimposta la tua password di Lordaeron",
    preview: "Una nuova password per il tuo account, con un clic.",
    heading: "Scegli una nuova password",
    body: "Qualcuno (speriamo tu) ha chiesto di reimpostare la password del tuo account Lordaeron. Clicca il pulsante per sceglierne una nuova.",
    cta: "Reimposta la password",
    expiry: "Questo link funziona una sola volta e scade tra **1 ora**.",
    ignore:
      "Non sei stato tu? Ignora questa email: la tua password resta invariata.",
  },
  pl: {
    subject: "Zresetuj hasło do Lordaeron",
    preview: "Nowe hasło do twojego konta jednym kliknięciem.",
    heading: "Wybierz nowe hasło",
    body: "Ktoś (mamy nadzieję, że ty) poprosił o zresetowanie hasła do twojego konta Lordaeron. Kliknij przycisk, aby wybrać nowe.",
    cta: "Zresetuj hasło",
    expiry: "Ten link działa raz i wygasa za **1 godzinę**.",
    ignore:
      "To nie ty? Zignoruj tę wiadomość: twoje hasło pozostanie bez zmian.",
  },
  pt: {
    subject: "Redefine a tua palavra-passe Lordaeron",
    preview: "Uma nova palavra-passe para a tua conta, num clique.",
    heading: "Escolhe uma nova palavra-passe",
    body: "Alguém (esperamos que tu) pediu para redefinir a palavra-passe da tua conta Lordaeron. Clica no botão para escolheres uma nova.",
    cta: "Redefinir a palavra-passe",
    expiry: "Este link funciona uma vez e expira dentro de **1 hora**.",
    ignore: "Não foste tu? Ignora este e-mail: a tua palavra-passe fica igual.",
  },
  ru: {
    subject: "Сброс пароля Lordaeron",
    preview: "Новый пароль для вашей учётной записи в один клик.",
    heading: "Выберите новый пароль",
    body: "Кто-то (надеемся, вы) запросил сброс пароля учётной записи Lordaeron. Нажмите кнопку ниже, чтобы выбрать новый.",
    cta: "Сбросить пароль",
    expiry: "Ссылка действует один раз и истекает через **1 час**.",
    ignore:
      "Это были не вы? Просто проигнорируйте письмо: пароль останется прежним.",
  },
};

export function getPasswordResetEmail(locale: string, resetUrl: string) {
  const lang = emailLocale(locale);
  const t = T[lang];

  return renderEmail({
    locale: lang,
    subject: t.subject,
    preview: t.preview,
    heading: t.heading,
    paragraphs: [t.body],
    cta: { label: t.cta, url: resetUrl },
    notes: [t.expiry, t.ignore],
  });
}
