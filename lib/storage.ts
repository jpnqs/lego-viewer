import { DEFAULT_ZOOM, STORAGE_KEY } from "@/config/experience";
import type { PageRotation, StoredProgress } from "@/lib/types";

function isBrowser() {
  return typeof window !== "undefined";
}

function isPageRotation(value: unknown): value is PageRotation {
  return value === 0 || value === 90 || value === 180 || value === 270;
}

export function loadProgress(): StoredProgress | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredProgress>;
    if (typeof parsed.page !== "number") return null;
    return {
      version: 1,
      page: parsed.page,
      zoom: typeof parsed.zoom === "number" ? parsed.zoom : DEFAULT_ZOOM,
      rotation: isPageRotation(parsed.rotation) ? parsed.rotation : 0,
      openedMessages: Array.isArray(parsed.openedMessages) ? parsed.openedMessages : [],
      autoOpenedMessages: Array.isArray(parsed.autoOpenedMessages) ? parsed.autoOpenedMessages : [],
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : 0,
    };
  } catch {
    return null;
  }
}

export function saveProgress(progress: StoredProgress) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage unavailable (private mode, quota) — fail silently, progress just won't persist.
  }
}

export function clearProgress() {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
