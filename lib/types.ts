export type MessageType = "letter" | "short" | "photo" | "surprise";

export type PageRotation = 0 | 90 | 180 | 270;

export interface ExperienceMessage {
  /** PDF page number this message is attached to (1-indexed). */
  page: number;
  type: MessageType;
  title: string;
  text: string;
  /** Optional signature override; falls back to experienceConfig.sender.name. */
  signature?: string;
  /** Path to an image under /public, only used by type "photo". */
  photoSrc?: string;
  photoAlt?: string;
  /** Show a one-time auto-reveal animation the first time this page is reached. */
  autoOpen?: boolean;
}

export interface ExperienceConfig {
  couple: {
    name1: string;
    name2: string;
  };
  sender: {
    name: string;
  };
  intro: {
    title: string;
    quote: string;
    description: string;
    date?: string;
    cta: string;
  };
  pdf: {
    file: string;
  };
  model: {
    objFile: string;
    mtlFile: string;
  };
  completion: {
    heading: string;
    lines: string[];
    signature: string;
    restartLabel: string;
  };
  /** Hint shown on page 1 explaining the message feature. */
  tutorialHint: string;
  messages: ExperienceMessage[];
}

export interface StoredProgress {
  version: 1;
  page: number;
  zoom: number;
  rotation: PageRotation;
  openedMessages: number[];
  autoOpenedMessages: number[];
  updatedAt: number;
}
