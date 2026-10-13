import {
  CONTACT_EMAIL,
  emailLocale,
  renderEmail,
  type EmailLocale,
} from "./layout";

/*
 * The account's e-mails (Ayoub, 13/10/2026): the welcome with the address to confirm, a new address to confirm, the notice to the
 * old address once it changed, and the security notices of the second factor. {name} is the account name.
 */

type Texts = {
  welcome: {
    subject: string;
    preview: string;
    heading: string;
    body: string[];
    cta: string;
    notes: string[];
  };
  change: {
    subject: string;
    preview: string;
    heading: string;
    body: string[];
    label: string;
    cta: string;
    notes: string[];
  };
  changed: {
    subject: string;
    preview: string;
    heading: string;
    body: string[];
    label: string;
    notes: string[];
  };
  factorOn: {
    subject: string;
    preview: string;
    heading: string;
    body: string[];
    notes: string[];
  };
  factorOff: {
    subject: string;
    preview: string;
    heading: string;
    body: string[];
    notes: string[];
  };
  account: string;
};

const T: Record<EmailLocale, Texts> = {
  en: {
    welcome: {
      subject: "Welcome to Lordaeron, {name}: confirm your address",
      preview: "One click to confirm your address, and Azeroth is yours.",
      heading: "Welcome, {name}!",
      body: [
        "Your Lordaeron account is ready. One last step: confirm that this address is yours, so you can always get your account back.",
        "Then install the client and the patch from the guide, and see you in game.",
      ],
      cta: "Confirm my address",
      notes: [
        "This link expires in **48 hours**. You can send a new one from your account page.",
        "You did not create this account? Ignore this e-mail.",
      ],
    },
    change: {
      subject: "Confirm your new Lordaeron address",
      preview: "Confirm this address to make it your account's.",
      heading: "Confirm your new address",
      body: [
        "You asked to use this address for the Lordaeron account **{name}**. Click the button to confirm it: the change applies only then.",
      ],
      label: "New address",
      cta: "Confirm this address",
      notes: [
        "This link works once and expires in **24 hours**.",
        "You did not ask for this? Ignore this e-mail: nothing changes.",
      ],
    },
    changed: {
      subject: "Your Lordaeron address was changed",
      preview: "Your account now uses another e-mail address.",
      heading: "Your address was changed",
      body: [
        "The e-mail address of the Lordaeron account **{name}** was just changed. From now on, our messages go to the new address.",
      ],
      label: "New address",
      notes: [
        `Was it not you? Change your password right away and write to **${CONTACT_EMAIL}**: we will secure your account.`,
      ],
    },
    factorOn: {
      subject: "Two-step verification is on for your Lordaeron account",
      preview: "Your account is now protected by an authenticator app.",
      heading: "Your account is protected",
      body: [
        "Two-step verification is now on for **{name}**. From now on, the game and the website ask for the code of your authenticator app at every sign-in.",
        "Keep your phone close: without it, you can no longer sign in.",
      ],
      notes: [`Was it not you? Write to **${CONTACT_EMAIL}** right away.`],
    },
    factorOff: {
      subject: "Two-step verification was removed from your Lordaeron account",
      preview: "Your account no longer asks for an authenticator code.",
      heading: "Two-step verification removed",
      body: [
        "Two-step verification was just removed from **{name}**. The game and the website now ask only for your password.",
        "You can turn it back on at any time from your account page.",
      ],
      notes: [
        `Was it not you? Change your password right away and write to **${CONTACT_EMAIL}**.`,
      ],
    },
    account: "Open my account",
  },
  fr: {
    welcome: {
      subject: "Bienvenue sur Lordaeron, {name} : confirmez votre adresse",
      preview: "Un clic pour confirmer votre adresse, et Azeroth est à vous.",
      heading: "Bienvenue, {name} !",
      body: [
        "Votre compte Lordaeron est prêt. Dernière étape : confirmez que cette adresse est bien la vôtre, pour toujours pouvoir récupérer votre compte.",
        "Installez ensuite le client et le patch depuis le guide, et à tout de suite en jeu.",
      ],
      cta: "Confirmer mon adresse",
      notes: [
        "Ce lien expire dans **48 heures**. Vous pouvez en recevoir un nouveau depuis votre espace compte.",
        "Vous n'avez pas créé ce compte ? Ignorez cet e-mail.",
      ],
    },
    change: {
      subject: "Confirmez votre nouvelle adresse Lordaeron",
      preview: "Confirmez cette adresse pour l'associer à votre compte.",
      heading: "Confirmez votre nouvelle adresse",
      body: [
        "Vous avez demandé à utiliser cette adresse pour le compte Lordaeron **{name}**. Cliquez sur le bouton pour la confirmer : le changement ne s'applique qu'à ce moment-là.",
      ],
      label: "Nouvelle adresse",
      cta: "Confirmer cette adresse",
      notes: [
        "Ce lien ne sert qu'une fois et expire dans **24 heures**.",
        "Vous n'avez rien demandé ? Ignorez cet e-mail : rien ne change.",
      ],
    },
    changed: {
      subject: "L'adresse de votre compte Lordaeron a changé",
      preview: "Votre compte utilise désormais une autre adresse e-mail.",
      heading: "Votre adresse a été modifiée",
      body: [
        "L'adresse e-mail du compte Lordaeron **{name}** vient d'être modifiée. Nos messages iront désormais à la nouvelle adresse.",
      ],
      label: "Nouvelle adresse",
      notes: [
        `Ce n'était pas vous ? Changez tout de suite votre mot de passe et écrivez à **${CONTACT_EMAIL}** : nous sécuriserons votre compte.`,
      ],
    },
    factorOn: {
      subject:
        "La double authentification est activée sur votre compte Lordaeron",
      preview:
        "Votre compte est désormais protégé par une application d'authentification.",
      heading: "Votre compte est protégé",
      body: [
        "La double authentification est activée pour **{name}**. Désormais, le jeu et le site demandent le code de votre application d'authentification à chaque connexion.",
        "Gardez votre téléphone à portée de main : sans lui, vous ne pourrez plus vous connecter.",
      ],
      notes: [
        `Ce n'était pas vous ? Écrivez tout de suite à **${CONTACT_EMAIL}**.`,
      ],
    },
    factorOff: {
      subject:
        "La double authentification a été retirée de votre compte Lordaeron",
      preview: "Votre compte ne demande plus de code d'authentification.",
      heading: "Double authentification retirée",
      body: [
        "La double authentification vient d'être retirée de **{name}**. Le jeu et le site ne demandent plus que votre mot de passe.",
        "Vous pouvez la réactiver à tout moment depuis votre espace compte.",
      ],
      notes: [
        `Ce n'était pas vous ? Changez tout de suite votre mot de passe et écrivez à **${CONTACT_EMAIL}**.`,
      ],
    },
    account: "Ouvrir mon compte",
  },
  de: {
    welcome: {
      subject: "Willkommen bei Lordaeron, {name}: Bestätige deine Adresse",
      preview:
        "Ein Klick zur Bestätigung deiner Adresse, und Azeroth gehört dir.",
      heading: "Willkommen, {name}!",
      body: [
        "Dein Lordaeron-Konto ist bereit. Ein letzter Schritt: Bestätige, dass diese Adresse dir gehört, damit du dein Konto jederzeit wiederherstellen kannst.",
        "Installiere dann den Client und den Patch laut Anleitung, und wir sehen uns im Spiel.",
      ],
      cta: "Adresse bestätigen",
      notes: [
        "Dieser Link läuft in **48 Stunden** ab. Auf deiner Kontoseite kannst du einen neuen anfordern.",
        "Du hast dieses Konto nicht erstellt? Ignoriere diese E-Mail.",
      ],
    },
    change: {
      subject: "Bestätige deine neue Lordaeron-Adresse",
      preview:
        "Bestätige diese Adresse, um sie mit deinem Konto zu verknüpfen.",
      heading: "Bestätige deine neue Adresse",
      body: [
        "Du möchtest diese Adresse für das Lordaeron-Konto **{name}** verwenden. Klicke auf den Button, um sie zu bestätigen: Erst dann wird die Änderung wirksam.",
      ],
      label: "Neue Adresse",
      cta: "Adresse bestätigen",
      notes: [
        "Dieser Link funktioniert einmal und läuft in **24 Stunden** ab.",
        "Du hast nichts angefordert? Ignoriere diese E-Mail: Es ändert sich nichts.",
      ],
    },
    changed: {
      subject: "Die Adresse deines Lordaeron-Kontos wurde geändert",
      preview: "Dein Konto verwendet jetzt eine andere E-Mail-Adresse.",
      heading: "Deine Adresse wurde geändert",
      body: [
        "Die E-Mail-Adresse des Lordaeron-Kontos **{name}** wurde soeben geändert. Unsere Nachrichten gehen ab jetzt an die neue Adresse.",
      ],
      label: "Neue Adresse",
      notes: [
        `Das warst nicht du? Ändere sofort dein Passwort und schreibe an **${CONTACT_EMAIL}**: Wir sichern dein Konto.`,
      ],
    },
    factorOn: {
      subject:
        "Die Zwei-Faktor-Authentifizierung ist für dein Lordaeron-Konto aktiv",
      preview: "Dein Konto ist jetzt durch eine Authenticator-App geschützt.",
      heading: "Dein Konto ist geschützt",
      body: [
        "Die Zwei-Faktor-Authentifizierung ist für **{name}** aktiv. Spiel und Website fragen ab jetzt bei jeder Anmeldung nach dem Code deiner Authenticator-App.",
        "Halte dein Handy griffbereit: Ohne es kannst du dich nicht mehr anmelden.",
      ],
      notes: [`Das warst nicht du? Schreibe sofort an **${CONTACT_EMAIL}**.`],
    },
    factorOff: {
      subject:
        "Die Zwei-Faktor-Authentifizierung wurde von deinem Lordaeron-Konto entfernt",
      preview: "Dein Konto fragt nicht mehr nach einem Authenticator-Code.",
      heading: "Zwei-Faktor-Authentifizierung entfernt",
      body: [
        "Die Zwei-Faktor-Authentifizierung wurde soeben von **{name}** entfernt. Spiel und Website fragen jetzt nur noch nach deinem Passwort.",
        "Du kannst sie jederzeit auf deiner Kontoseite wieder aktivieren.",
      ],
      notes: [
        `Das warst nicht du? Ändere sofort dein Passwort und schreibe an **${CONTACT_EMAIL}**.`,
      ],
    },
    account: "Mein Konto öffnen",
  },
  es: {
    welcome: {
      subject: "Bienvenido a Lordaeron, {name}: confirma tu dirección",
      preview: "Un clic para confirmar tu dirección, y Azeroth es tuyo.",
      heading: "¡Bienvenido, {name}!",
      body: [
        "Tu cuenta de Lordaeron está lista. Último paso: confirma que esta dirección es tuya, para poder recuperar siempre tu cuenta.",
        "Después instala el cliente y el parche desde la guía, y nos vemos en el juego.",
      ],
      cta: "Confirmar mi dirección",
      notes: [
        "Este enlace caduca en **48 horas**. Puedes pedir uno nuevo desde tu cuenta.",
        "¿No creaste esta cuenta? Ignora este correo.",
      ],
    },
    change: {
      subject: "Confirma tu nueva dirección de Lordaeron",
      preview: "Confirma esta dirección para asociarla a tu cuenta.",
      heading: "Confirma tu nueva dirección",
      body: [
        "Pediste usar esta dirección para la cuenta de Lordaeron **{name}**. Haz clic en el botón para confirmarla: el cambio solo se aplica entonces.",
      ],
      label: "Nueva dirección",
      cta: "Confirmar esta dirección",
      notes: [
        "Este enlace sirve una sola vez y caduca en **24 horas**.",
        "¿No lo pediste? Ignora este correo: no cambia nada.",
      ],
    },
    changed: {
      subject: "La dirección de tu cuenta de Lordaeron cambió",
      preview: "Tu cuenta ahora usa otra dirección de correo.",
      heading: "Tu dirección ha cambiado",
      body: [
        "La dirección de correo de la cuenta de Lordaeron **{name}** acaba de cambiar. Nuestros mensajes irán a partir de ahora a la nueva dirección.",
      ],
      label: "Nueva dirección",
      notes: [
        `¿No fuiste tú? Cambia tu contraseña enseguida y escribe a **${CONTACT_EMAIL}**: protegeremos tu cuenta.`,
      ],
    },
    factorOn: {
      subject:
        "La verificación en dos pasos está activa en tu cuenta de Lordaeron",
      preview: "Tu cuenta ahora está protegida por una app de autenticación.",
      heading: "Tu cuenta está protegida",
      body: [
        "La verificación en dos pasos está activa para **{name}**. A partir de ahora, el juego y la web piden el código de tu app de autenticación en cada inicio de sesión.",
        "Ten tu teléfono a mano: sin él, ya no podrás iniciar sesión.",
      ],
      notes: [`¿No fuiste tú? Escribe enseguida a **${CONTACT_EMAIL}**.`],
    },
    factorOff: {
      subject:
        "Se quitó la verificación en dos pasos de tu cuenta de Lordaeron",
      preview: "Tu cuenta ya no pide un código de autenticación.",
      heading: "Verificación en dos pasos quitada",
      body: [
        "Se acaba de quitar la verificación en dos pasos de **{name}**. El juego y la web ahora solo piden tu contraseña.",
        "Puedes volver a activarla cuando quieras desde tu cuenta.",
      ],
      notes: [
        `¿No fuiste tú? Cambia tu contraseña enseguida y escribe a **${CONTACT_EMAIL}**.`,
      ],
    },
    account: "Abrir mi cuenta",
  },
  it: {
    welcome: {
      subject: "Benvenuto su Lordaeron, {name}: conferma il tuo indirizzo",
      preview: "Un clic per confermare il tuo indirizzo, e Azeroth è tuo.",
      heading: "Benvenuto, {name}!",
      body: [
        "Il tuo account Lordaeron è pronto. Ultimo passo: conferma che questo indirizzo è tuo, così potrai sempre recuperare il tuo account.",
        "Poi installa il client e la patch seguendo la guida, e ci vediamo in gioco.",
      ],
      cta: "Conferma il mio indirizzo",
      notes: [
        "Questo link scade tra **48 ore**. Puoi richiederne uno nuovo dalla pagina del tuo account.",
        "Non hai creato tu questo account? Ignora questa email.",
      ],
    },
    change: {
      subject: "Conferma il tuo nuovo indirizzo Lordaeron",
      preview: "Conferma questo indirizzo per associarlo al tuo account.",
      heading: "Conferma il tuo nuovo indirizzo",
      body: [
        "Hai chiesto di usare questo indirizzo per l'account Lordaeron **{name}**. Clicca il pulsante per confermarlo: la modifica si applica solo allora.",
      ],
      label: "Nuovo indirizzo",
      cta: "Conferma questo indirizzo",
      notes: [
        "Questo link funziona una sola volta e scade tra **24 ore**.",
        "Non hai chiesto nulla? Ignora questa email: non cambia nulla.",
      ],
    },
    changed: {
      subject: "L'indirizzo del tuo account Lordaeron è cambiato",
      preview: "Il tuo account ora usa un altro indirizzo email.",
      heading: "Il tuo indirizzo è stato modificato",
      body: [
        "L'indirizzo email dell'account Lordaeron **{name}** è appena stato modificato. D'ora in poi i nostri messaggi andranno al nuovo indirizzo.",
      ],
      label: "Nuovo indirizzo",
      notes: [
        `Non sei stato tu? Cambia subito la password e scrivi a **${CONTACT_EMAIL}**: metteremo al sicuro il tuo account.`,
      ],
    },
    factorOn: {
      subject: "La verifica in due passaggi è attiva sul tuo account Lordaeron",
      preview: "Il tuo account ora è protetto da un'app di autenticazione.",
      heading: "Il tuo account è protetto",
      body: [
        "La verifica in due passaggi è attiva per **{name}**. D'ora in poi il gioco e il sito chiedono il codice della tua app di autenticazione a ogni accesso.",
        "Tieni il telefono a portata di mano: senza di esso non potrai più accedere.",
      ],
      notes: [`Non sei stato tu? Scrivi subito a **${CONTACT_EMAIL}**.`],
    },
    factorOff: {
      subject:
        "La verifica in due passaggi è stata rimossa dal tuo account Lordaeron",
      preview: "Il tuo account non chiede più un codice di autenticazione.",
      heading: "Verifica in due passaggi rimossa",
      body: [
        "La verifica in due passaggi è appena stata rimossa da **{name}**. Il gioco e il sito ora chiedono solo la password.",
        "Puoi riattivarla in qualsiasi momento dalla pagina del tuo account.",
      ],
      notes: [
        `Non sei stato tu? Cambia subito la password e scrivi a **${CONTACT_EMAIL}**.`,
      ],
    },
    account: "Apri il mio account",
  },
  pl: {
    welcome: {
      subject: "Witaj w Lordaeron, {name}: potwierdź swój adres",
      preview: "Jedno kliknięcie, by potwierdzić adres, i Azeroth jest twój.",
      heading: "Witaj, {name}!",
      body: [
        "Twoje konto Lordaeron jest gotowe. Ostatni krok: potwierdź, że ten adres należy do ciebie, aby zawsze móc odzyskać konto.",
        "Następnie zainstaluj klienta i patch według poradnika i do zobaczenia w grze.",
      ],
      cta: "Potwierdź mój adres",
      notes: [
        "Ten link wygasa za **48 godzin**. Nowy możesz wysłać ze strony konta.",
        "Nie zakładałeś tego konta? Zignoruj tę wiadomość.",
      ],
    },
    change: {
      subject: "Potwierdź nowy adres Lordaeron",
      preview: "Potwierdź ten adres, aby przypisać go do konta.",
      heading: "Potwierdź nowy adres",
      body: [
        "Poprosiłeś o użycie tego adresu dla konta Lordaeron **{name}**. Kliknij przycisk, aby go potwierdzić: zmiana zostanie zastosowana dopiero wtedy.",
      ],
      label: "Nowy adres",
      cta: "Potwierdź ten adres",
      notes: [
        "Ten link działa raz i wygasa za **24 godziny**.",
        "Nie prosiłeś o to? Zignoruj tę wiadomość: nic się nie zmieni.",
      ],
    },
    changed: {
      subject: "Adres twojego konta Lordaeron został zmieniony",
      preview: "Twoje konto używa teraz innego adresu e-mail.",
      heading: "Twój adres został zmieniony",
      body: [
        "Adres e-mail konta Lordaeron **{name}** został właśnie zmieniony. Nasze wiadomości będą odtąd trafiać na nowy adres.",
      ],
      label: "Nowy adres",
      notes: [
        `To nie ty? Natychmiast zmień hasło i napisz na **${CONTACT_EMAIL}**: zabezpieczymy twoje konto.`,
      ],
    },
    factorOn: {
      subject: "Weryfikacja dwuetapowa jest włączona na twoim koncie Lordaeron",
      preview: "Twoje konto jest teraz chronione aplikacją uwierzytelniającą.",
      heading: "Twoje konto jest chronione",
      body: [
        "Weryfikacja dwuetapowa jest włączona dla **{name}**. Od teraz gra i strona proszą o kod z aplikacji uwierzytelniającej przy każdym logowaniu.",
        "Miej telefon pod ręką: bez niego nie zalogujesz się.",
      ],
      notes: [`To nie ty? Natychmiast napisz na **${CONTACT_EMAIL}**.`],
    },
    factorOff: {
      subject:
        "Weryfikacja dwuetapowa została usunięta z twojego konta Lordaeron",
      preview: "Twoje konto nie prosi już o kod uwierzytelniający.",
      heading: "Weryfikacja dwuetapowa usunięta",
      body: [
        "Weryfikacja dwuetapowa została właśnie usunięta z **{name}**. Gra i strona proszą teraz tylko o hasło.",
        "Możesz ją ponownie włączyć w każdej chwili na stronie konta.",
      ],
      notes: [
        `To nie ty? Natychmiast zmień hasło i napisz na **${CONTACT_EMAIL}**.`,
      ],
    },
    account: "Otwórz moje konto",
  },
  pt: {
    welcome: {
      subject: "Bem-vindo a Lordaeron, {name}: confirma o teu endereço",
      preview: "Um clique para confirmar o teu endereço, e Azeroth é teu.",
      heading: "Bem-vindo, {name}!",
      body: [
        "A tua conta Lordaeron está pronta. Último passo: confirma que este endereço é teu, para poderes sempre recuperar a tua conta.",
        "Depois instala o cliente e o patch a partir do guia, e até já no jogo.",
      ],
      cta: "Confirmar o meu endereço",
      notes: [
        "Este link expira dentro de **48 horas**. Podes pedir um novo na página da tua conta.",
        "Não criaste esta conta? Ignora este e-mail.",
      ],
    },
    change: {
      subject: "Confirma o teu novo endereço Lordaeron",
      preview: "Confirma este endereço para o associar à tua conta.",
      heading: "Confirma o teu novo endereço",
      body: [
        "Pediste para usar este endereço na conta Lordaeron **{name}**. Clica no botão para o confirmar: a alteração só se aplica nesse momento.",
      ],
      label: "Novo endereço",
      cta: "Confirmar este endereço",
      notes: [
        "Este link funciona uma vez e expira dentro de **24 horas**.",
        "Não pediste nada? Ignora este e-mail: nada muda.",
      ],
    },
    changed: {
      subject: "O endereço da tua conta Lordaeron foi alterado",
      preview: "A tua conta usa agora outro endereço de e-mail.",
      heading: "O teu endereço foi alterado",
      body: [
        "O endereço de e-mail da conta Lordaeron **{name}** acabou de ser alterado. As nossas mensagens passam a ir para o novo endereço.",
      ],
      label: "Novo endereço",
      notes: [
        `Não foste tu? Muda já a tua palavra-passe e escreve para **${CONTACT_EMAIL}**: vamos proteger a tua conta.`,
      ],
    },
    factorOn: {
      subject: "A verificação em dois passos está ativa na tua conta Lordaeron",
      preview: "A tua conta está agora protegida por uma app de autenticação.",
      heading: "A tua conta está protegida",
      body: [
        "A verificação em dois passos está ativa para **{name}**. A partir de agora, o jogo e o site pedem o código da tua app de autenticação em cada início de sessão.",
        "Mantém o telemóvel por perto: sem ele, já não consegues iniciar sessão.",
      ],
      notes: [`Não foste tu? Escreve já para **${CONTACT_EMAIL}**.`],
    },
    factorOff: {
      subject:
        "A verificação em dois passos foi removida da tua conta Lordaeron",
      preview: "A tua conta já não pede um código de autenticação.",
      heading: "Verificação em dois passos removida",
      body: [
        "A verificação em dois passos acabou de ser removida de **{name}**. O jogo e o site pedem agora apenas a tua palavra-passe.",
        "Podes reativá-la a qualquer momento na página da tua conta.",
      ],
      notes: [
        `Não foste tu? Muda já a tua palavra-passe e escreve para **${CONTACT_EMAIL}**.`,
      ],
    },
    account: "Abrir a minha conta",
  },
  ru: {
    welcome: {
      subject: "Добро пожаловать в Lordaeron, {name}: подтвердите адрес",
      preview: "Один клик, чтобы подтвердить адрес, и Азерот ваш.",
      heading: "Добро пожаловать, {name}!",
      body: [
        "Ваша учётная запись Lordaeron готова. Последний шаг: подтвердите, что этот адрес принадлежит вам, чтобы всегда иметь возможность восстановить доступ.",
        "Затем установите клиент и патч по руководству — и до встречи в игре.",
      ],
      cta: "Подтвердить адрес",
      notes: [
        "Ссылка истекает через **48 часов**. Новую можно отправить со страницы учётной записи.",
        "Вы не создавали эту учётную запись? Просто проигнорируйте письмо.",
      ],
    },
    change: {
      subject: "Подтвердите новый адрес Lordaeron",
      preview: "Подтвердите этот адрес, чтобы привязать его к учётной записи.",
      heading: "Подтвердите новый адрес",
      body: [
        "Вы попросили использовать этот адрес для учётной записи Lordaeron **{name}**. Нажмите кнопку, чтобы подтвердить его: изменение вступит в силу только после этого.",
      ],
      label: "Новый адрес",
      cta: "Подтвердить адрес",
      notes: [
        "Ссылка действует один раз и истекает через **24 часа**.",
        "Вы ничего не запрашивали? Проигнорируйте письмо: ничего не изменится.",
      ],
    },
    changed: {
      subject: "Адрес вашей учётной записи Lordaeron изменён",
      preview: "Ваша учётная запись теперь использует другой адрес.",
      heading: "Ваш адрес изменён",
      body: [
        "Адрес электронной почты учётной записи Lordaeron **{name}** только что изменён. Теперь наши письма будут приходить на новый адрес.",
      ],
      label: "Новый адрес",
      notes: [
        `Это были не вы? Немедленно смените пароль и напишите на **${CONTACT_EMAIL}**: мы защитим вашу учётную запись.`,
      ],
    },
    factorOn: {
      subject:
        "Двухэтапная проверка включена для вашей учётной записи Lordaeron",
      preview:
        "Ваша учётная запись теперь защищена приложением-аутентификатором.",
      heading: "Ваша учётная запись защищена",
      body: [
        "Двухэтапная проверка включена для **{name}**. Теперь игра и сайт запрашивают код из приложения-аутентификатора при каждом входе.",
        "Держите телефон под рукой: без него войти не получится.",
      ],
      notes: [`Это были не вы? Немедленно напишите на **${CONTACT_EMAIL}**.`],
    },
    factorOff: {
      subject:
        "Двухэтапная проверка отключена для вашей учётной записи Lordaeron",
      preview: "Ваша учётная запись больше не запрашивает код аутентификатора.",
      heading: "Двухэтапная проверка отключена",
      body: [
        "Двухэтапная проверка только что отключена для **{name}**. Игра и сайт теперь запрашивают только пароль.",
        "Вы можете снова включить её в любой момент на странице учётной записи.",
      ],
      notes: [
        `Это были не вы? Немедленно смените пароль и напишите на **${CONTACT_EMAIL}**.`,
      ],
    },
    account: "Открыть учётную запись",
  },
};

const fill = (s: string, name: string) => s.replaceAll("{name}", name);
const fillAll = (list: string[], name: string) =>
  list.map((s) => fill(s, name));

// a@b.com -> a•••@b.com: the old address is told where the account went without spelling it out
export function maskEmail(email: string) {
  const [user, domain] = email.split("@");

  if (!domain) return email;

  return `${user.slice(0, Math.min(2, user.length))}•••@${domain}`;
}

export function welcomeEmail(locale: string, name: string, confirmUrl: string) {
  const lang = emailLocale(locale);
  const t = T[lang].welcome;

  return renderEmail({
    locale: lang,
    subject: fill(t.subject, name),
    preview: t.preview,
    heading: fill(t.heading, name),
    paragraphs: fillAll(t.body, name),
    cta: { label: t.cta, url: confirmUrl },
    notes: t.notes,
  });
}

export function emailChangeEmail(
  locale: string,
  name: string,
  newEmail: string,
  confirmUrl: string,
) {
  const lang = emailLocale(locale);
  const t = T[lang].change;

  return renderEmail({
    locale: lang,
    subject: t.subject,
    preview: t.preview,
    heading: t.heading,
    paragraphs: fillAll(t.body, name),
    highlight: { label: t.label, value: newEmail },
    cta: { label: t.cta, url: confirmUrl },
    notes: t.notes,
  });
}

export function emailChangedNotice(
  locale: string,
  name: string,
  newEmail: string,
  accountUrl: string,
) {
  const lang = emailLocale(locale);
  const t = T[lang].changed;

  return renderEmail({
    locale: lang,
    subject: t.subject,
    preview: t.preview,
    heading: t.heading,
    paragraphs: fillAll(t.body, name),
    highlight: { label: t.label, value: maskEmail(newEmail) },
    cta: { label: T[lang].account, url: accountUrl },
    notes: t.notes,
  });
}

export function secondFactorNotice(
  locale: string,
  name: string,
  enabled: boolean,
  accountUrl: string,
) {
  const lang = emailLocale(locale);
  const t = enabled ? T[lang].factorOn : T[lang].factorOff;

  return renderEmail({
    locale: lang,
    subject: t.subject,
    preview: t.preview,
    heading: t.heading,
    paragraphs: fillAll(t.body, name),
    cta: { label: T[lang].account, url: accountUrl },
    notes: t.notes,
  });
}
