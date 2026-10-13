import type { RealmAccent } from "./types";

/* The classes each accent paints the template with: Lordaeron keeps its gold title, blue kicker and gold buttons; Rimeheart is frost
   from top to bottom (ice title, frost buttons and rings, cold glows). */
export const THEME: Record<
  RealmAccent,
  {
    kicker: string;
    title: string;
    eyebrow: string;
    line: string;
    primary: string;
    secondary: string;
    panel: string;
    card: string;
    icon: string;
    number: string;
    glow: string;
  }
> = {
  gold: {
    kicker:
      "text-wow-blue drop-shadow-[0_0_10px_rgba(79,195,247,0.4)] drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]",
    title:
      "wow-gradient-text drop-shadow-[0_0_30px_rgba(199,156,62,0.3)] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]",
    eyebrow: "text-wow-gold",
    line: "via-wow-gold/60",
    primary:
      "bg-gradient-to-r from-wow-gold to-wow-gold-light text-black glow-gold-strong hover:shadow-[0_0_40px_rgba(199,156,62,0.5)]",
    secondary:
      "border-2 border-wow-blue/30 text-wow-blue hover:bg-wow-blue/10 hover:border-wow-blue/50 backdrop-blur-sm",
    panel:
      "border-wow-gold/25 bg-black/45 shadow-[0_20px_60px_-25px_rgba(199,156,62,0.45)]",
    card: "border-wow-gold/10 hover:border-wow-gold/40 hover:shadow-[0_0_30px_-10px_rgba(199,156,62,0.5)]",
    icon: "border-wow-gold/50",
    number: "text-wow-gold-light",
    glow: "bg-[radial-gradient(ellipse_at_center,rgba(79,195,247,0.08)_0%,transparent_70%)]",
  },
  ice: {
    kicker:
      "text-wow-blue-ice drop-shadow-[0_0_12px_rgba(125,211,252,0.6)] drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]",
    title:
      "text-white drop-shadow-[0_0_30px_rgba(125,211,252,0.35)] drop-shadow-[0_6px_24px_rgba(0,0,0,0.9)]",
    eyebrow: "text-wow-blue-ice",
    line: "via-wow-blue-ice/70",
    primary:
      "bg-gradient-to-b from-[#e8f8ff] via-[#9fdcf7] to-[#3a9fd0] text-[#04121f] shadow-[0_0_0_1px_rgba(224,247,255,0.8),0_12px_40px_-8px_rgba(79,195,247,0.9)] hover:shadow-[0_0_0_1px_rgba(240,252,255,1),0_16px_50px_-6px_rgba(79,195,247,1)]",
    secondary:
      "border-2 border-wow-blue-ice/50 bg-[#06121f]/60 text-wow-blue-ice shadow-[inset_0_0_18px_-8px_rgba(79,195,247,0.6)] hover:bg-wow-blue-ice/10 hover:border-wow-blue-ice backdrop-blur-sm",
    panel:
      "border-wow-blue-ice/25 bg-[#04101c]/60 shadow-[0_20px_60px_-25px_rgba(79,195,247,0.55),inset_0_1px_0_rgba(125,211,252,0.15)]",
    card: "border-wow-blue-ice/10 hover:border-wow-blue-ice/50 hover:shadow-[0_0_30px_-10px_rgba(79,195,247,0.6)]",
    icon: "border-wow-blue-ice/60",
    number: "text-wow-blue-ice",
    glow: "bg-[radial-gradient(ellipse_at_70%_20%,rgba(79,195,247,0.22),transparent_60%)]",
  },
};
