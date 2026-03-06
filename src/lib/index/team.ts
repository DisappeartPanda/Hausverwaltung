export type TeamMember = {
  name: string;
  role: string;
  description: string;
  image: string; // Pfad aus /public (z.B. /team/max.jpg)
  phone?: string;
  email?: string;
  linkedin?: string;
};

export const team: TeamMember[] = [
  {
    name: "Max Mustermann",
    role: "Hausverwaltung",
    description: "Ihr Ansprechpartner für Verwaltung, Abrechnung und Objektbetreuung.",
    image: "/team/max.jpg",
    phone: "tel:+49123456789",
    email: "mailto:max@immobilienpro.de",
    linkedin: "https://www.linkedin.com/"
  },
  {
    name: "Lisa Beispiel",
    role: "Instandhaltung",
    description: "Koordiniert Handwerker, Wartungen und Reparaturen effizient.",
    image: "/team/lisa.jpg",
    phone: "tel:+49123456780",
    email: "mailto:lisa@immobilienpro.de"
  },
  {
    name: "Tom Muster",
    role: "Support",
    description: "Schnelle Hilfe bei Fragen, Prozessen und digitaler Abwicklung.",
    image: "/team/tom.jpg",
    email: "mailto:support@immobilienpro.de"
  }
];