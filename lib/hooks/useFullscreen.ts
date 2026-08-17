"use client";

import { useCallback, useEffect, useState } from "react";
import type { RefObject } from "react";

export function useFullscreen(containerRef: RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const enter = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
      }
    } catch {
      // Fullscreen not available (e.g. iOS Safari) — the app already looks
      // full-bleed, so silently continue without native fullscreen.
    }
  }, [containerRef]);

  const exit = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // ignore
    }
  }, []);

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      void exit();
    } else {
      void enter();
    }
  }, [enter, exit]);

  return { isFullscreen, enter, exit, toggle };
}
