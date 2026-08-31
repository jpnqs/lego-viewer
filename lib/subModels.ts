import { experienceConfig } from "@/config/experience";
import type { SubModelEntry } from "@/lib/types";

export function getSubModelForPage(page: number): SubModelEntry | undefined {
  return experienceConfig.subModels?.find((m) => m.page === page);
}

export function pageHasSubModel(page: number): boolean {
  return experienceConfig.subModels?.some((m) => m.page === page) ?? false;
}
