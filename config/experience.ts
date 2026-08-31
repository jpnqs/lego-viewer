import type { ExperienceConfig, SubModelEntry } from "@/lib/types";

// Which sub-assembly each instruction page is about, read off the PDF itself.
// The landscape base runs to step 55 (page 30); from step 56 the tree is built
// as its own sub-model, and its seven leaf branches are each assembled on their
// own before being clipped onto the trunk. Ranges are inclusive page numbers.
const subModelRanges: Array<{
  pages: [from: number, to: number];
  /** Basename under /public/models — the .obj and .mtl share it. */
  file: string;
  label: string;
}> = [
    { pages: [31, 39], file: "tree", label: "Baum" }, // Stamm, Schritte 56-68
    { pages: [40, 40], file: "leave-1", label: "Zweig 1" }, // Schritt 69
    { pages: [41, 41], file: "leave-2", label: "Zweig 2" }, // Schritt 70
    { pages: [42, 42], file: "leave-3", label: "Zweig 3" }, // Schritte 71-72
    { pages: [43, 43], file: "leave-4", label: "Zweig 4" }, // Schritt 74
    { pages: [44, 44], file: "tree", label: "Baum" }, // Schritte 75-76
    { pages: [45, 47], file: "big-leave-1", label: "Blütenzweig 1" }, // Schritte 77-80
    { pages: [48, 49], file: "big-leave-2", label: "Blütenzweig 2" }, // Schritte 82-83
    { pages: [50, 51], file: "tree", label: "Baum" }, // Schritte 84-86
    { pages: [52, 54], file: "big-leave-3", label: "Blütenzweig 3" }, // Schritte 88-91
    { pages: [55, 55], file: "tree", label: "Baum" }, // Schritte 92-93
  ];

const subModels: SubModelEntry[] = subModelRanges.flatMap(
  ({ pages: [from, to], file, label }) =>
    Array.from({ length: to - from + 1 }, (_, i) => ({
      page: from + i,
      objFile: `/models/${file}.obj`,
      mtlFile: `/models/${file}.mtl`,
      label,
    })),
);

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

  model: {
    objFile: "/models/hochzeit_v2.obj",
    mtlFile: "/models/hochzeit_v2.mtl",
  },

  subModels,

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
// Gap between fully closing one 3D viewer modal and opening the other, so
// the first Canvas's WebGL context is released before the next one mounts.
export const MODEL_VIEW_SWITCH_DELAY_MS = 400;
export const PDF_WORKER_SRC = "/pdf.worker.min.mjs";
