/*
 * The legal notice's facts (app/[locale]/legal-notice; French law: LCEN art. 6 III and 19, Code de la consommation, RGPD).
 * The publisher (Ayoub, 13/10/2026: "sans mes infos perso ni boîte mail ni médiateur conso"): Lordaeron, an independent fan project, its
 * administrator as publication director, reached on Discord and by in-game tickets. Its name and director are translated in the
 * messages (legalNotice.sections.publisher); the optional fields below appear on the page only once filled. The providers' facts were
 * checked on 13/10/2026 (sources beside each).
 */

export interface LegalEntity {
  name: string;
  legalForm?: string;
  registration?: string;
  address: string;
  phone?: string;
  website?: string;
}

export interface LegalConfig {
  // optional publisher details, shown only when set (a company's legal form and registration, for instance)
  publisher: {
    legalForm?: string;
    registration?: string;
    vatNumber?: string;
  };
  host: LegalEntity;
  providers: (LegalEntity & { role: "email" | "payment" | "domain" })[];
}

export const legal: LegalConfig = {
  publisher: {},
  // the French company registry (recherche-entreprises.api.gouv.fr, SIREN 424 761 419: SAS, 2 rue Kellermann 59100 Roubaix); phone from
  // OVHcloud's legal notices; the game and web servers' IP block belongs to OVH's German data centres (whois 217.182.198.21)
  host: {
    name: "OVH SAS (OVHcloud)",
    legalForm: "SAS",
    registration: "RCS Lille Métropole 424 761 419",
    address: "2 rue Kellermann, 59100 Roubaix, France",
    phone: "+33 9 72 10 10 07",
    website: "https://www.ovhcloud.com",
  },
  providers: [
    // the French company registry (SIREN 498 019 298: SAS, 17 rue Salneuve 75017 Paris)
    {
      role: "email",
      name: "Sendinblue SAS (Brevo)",
      legalForm: "SAS",
      registration: "RCS Paris 498 019 298",
      address: "17 rue Salneuve, 75017 Paris, France",
      website: "https://www.brevo.com",
    },
    // stripe.com/legal/legal-process-guide: the EEA entity's registered office
    {
      role: "payment",
      name: "Stripe Payments Europe, Limited",
      address: "One Wilton Park, Wilton Place, Dublin 2, D02 FX04, Ireland",
      website: "https://stripe.com",
    },
    // hostinger.com/legal/universal-terms-of-service-agreement and its list of countries: the contracting entity for France
    {
      role: "domain",
      name: "Hostinger International Limited",
      address: "61 Lordou Vironos str., 6023 Larnaca, Cyprus",
      website: "https://www.hostinger.com",
    },
  ],
};
