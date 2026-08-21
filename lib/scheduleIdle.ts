/**
 * Runs `callback` once the browser has spare time, so background work never
 * competes with the current page's own render or the user's interaction.
 * Falls back to a short `setTimeout` where `requestIdleCallback` doesn't
 * exist (notably Safari). Returns a function that cancels the pending call.
 */
export function scheduleIdle(callback: () => void, timeout = 500): () => void {
  if (typeof window === "undefined") return () => {};

  if (typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(callback, { timeout });
    return () => window.cancelIdleCallback?.(handle);
  }

  const timer = setTimeout(callback, 200);
  return () => clearTimeout(timer);
}
