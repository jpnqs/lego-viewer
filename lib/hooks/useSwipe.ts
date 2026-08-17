"use client";

import { useMemo, useRef } from "react";

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

const SWIPE_THRESHOLD_PX = 55;
const SWIPE_MAX_VERTICAL_PX = 70;

export function useSwipe(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  enabled = true,
): SwipeHandlers {
  const start = useRef<{ x: number; y: number } | null>(null);

  return useMemo(() => {
    if (!enabled) {
      const noop = () => {};
      return { onTouchStart: noop, onTouchMove: noop, onTouchEnd: noop };
    }

    return {
      onTouchStart: (e: React.TouchEvent) => {
        const t = e.touches[0];
        start.current = { x: t.clientX, y: t.clientY };
      },
      onTouchMove: () => {},
      onTouchEnd: (e: React.TouchEvent) => {
        if (!start.current) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - start.current.x;
        const dy = t.clientY - start.current.y;
        start.current = null;

        if (Math.abs(dy) > SWIPE_MAX_VERTICAL_PX) return;
        if (dx <= -SWIPE_THRESHOLD_PX) onSwipeLeft();
        else if (dx >= SWIPE_THRESHOLD_PX) onSwipeRight();
      },
    };
  }, [enabled, onSwipeLeft, onSwipeRight]);
}
