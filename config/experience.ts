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
    title: "Für das sweete Brautpaar!",
    quote: "Steinchen für Steinchen. ",
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
      "Genauso wie ihr im Set den Weg gebaut habt.",
      "Werdet ihr auch eure gemeinsame Zukunft Stein für Stein bauen.",
      "Ich wünsch euch alles alles liebe für eure gemeinsame Zukunft!",
    ],
    signature: "Jonas",
    restartLabel: "Noch einmal von vorne",
  },

  tutorialHint:
    "Auf manchen Seiten warten Nachrichten auf euch. Ihr erkennt sie am pulsierenden Herz!",

  // Jedes Beutelchen startet einen neuen Bauabschnitt. Die Hinweise öffnen
  // sich automatisch, damit niemand versehentlich ohne die richtigen Steine
  // weiterbaut. Schema siehe ExperienceMessage in lib/types.ts.
  messages: [
    {
      page: 1,
      type: "short",
      title: "Beutelchen 1 öffnen",
      text: "Bevor ihr loslegt: Öffnet Beutelchen 1. Alles für den Anfang steckt da drin.",
      autoOpen: true,
    },
    {
      page: 9,
      type: "short",
      title: "Beutelchen 2 öffnen",
      text: "Beutelchen 1 hat seinen Dienst getan - jetzt darf Beutelchen 2 aufgemacht werden.",
      autoOpen: true,
    },
    {
      page: 19,
      type: "short",
      title: "Beutelchen 3 öffnen",
      text: "Weiter geht's: Öffnet jetzt Beutelchen 3.",
      autoOpen: true,
    },
    {
      page: 31,
      type: "short",
      title: "Beutelchen 4 öffnen",
      text: "Zeit für Beutelchen 4 - ab hier wächst der Baum.",
      autoOpen: true,
    },
    {
      page: 56,
      type: "short",
      title: "Beutelchen 5 öffnen",
      text: "Das letzte: Öffnet Beutelchen 5 und bringt euer Werk zu Ende.",
      autoOpen: true,
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
