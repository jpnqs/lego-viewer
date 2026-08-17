import { experienceConfig } from "@/config/experience";
import type { ExperienceMessage } from "@/lib/types";

export function getMessageForPage(page: number): ExperienceMessage | undefined {
  return experienceConfig.messages.find((m) => m.page === page);
}

export function pageHasMessage(page: number): boolean {
  return experienceConfig.messages.some((m) => m.page === page);
}
