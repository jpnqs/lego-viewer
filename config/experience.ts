import type { ExperienceConfig } from "@/lib/types";

export const experienceConfig: ExperienceConfig = {
  couple: {
    name1: "Milena",
    name2: "Hannes",
  },

  sender: {
    name: "Jonas",
  },

  intro: {
    title: "Für Milena & Hannes",
    quote: "Stein für Stein. Schritt für Schritt. Ein Leben lang zusammen.",
    description: "Ein kleines Geschenk für euren großen gemeinsamen Weg.",
    date: undefined,
    cta: "Gemeinsam losbauen",
  },

  pdf: {
    file: "/instructions.pdf",
  },

  completion: {
    heading: "Geschafft!",
    lines: [
      "Ihr habt es gemeinsam gebaut.",
      "Eine gemeinsame Zukunft entsteht nicht auf einmal. Sie entsteht Stein für Stein.",
      "Alles Liebe für euren gemeinsamen Weg.",
    ],
    signature: "Jonas",
    restartLabel: "Noch einmal von vorne",
  },

  tutorialHint:
    "Auf manchen Seiten warten Nachrichten auf euch. Ihr erkennt sie am pulsierenden Herz!",

  messages: [
    {
      page: 3,
      type: "letter",
      title: "Eine Nachricht von Jonas",
      text: "Liebe Milena, lieber Hannes,\n\nich wollte euch nicht einfach nur etwas schenken, sondern euch etwas geben, das ihr gemeinsam bauen könnt.\n\nIch hoffe, dass euch dieses kleine Set immer daran erinnert, dass die schönsten Dinge entstehen, wenn man sie gemeinsam Stein für Stein aufbaut.\n\nAlles Liebe für euch beide!",
      autoOpen: true,
    },
    {
      page: 4,
      type: "surprise",
      title: 'Surprise',
      text: 'test'
    },
    {
      page: 12,
      type: "short",
      title: "Kleine Baupause",
      text: "Kurz durchatmen, euch anlächeln - und weiter geht's.",
      autoOpen: true,
    },
    {
      page: 18,
      type: "photo",
      title: "Ein Blick zurück",
      text: "Ersetze dieses Bild gern durch ein eigenes Foto von euch beiden.",
      photoSrc: "/images/example-photo.svg",
      photoAlt: "Platzhalter-Foto",
    },
  ],
};

export const AUTO_OPEN_REVEAL_MS = 1600;
export const STORAGE_KEY = "lego-viewer:progress:v1";
export const MIN_ZOOM = 0.6;
export const MAX_ZOOM = 2.5;
export const DEFAULT_ZOOM = 1;
export const ZOOM_STEP = 0.2;
export const PDF_WORKER_SRC = "/pdf.worker.min.mjs";
