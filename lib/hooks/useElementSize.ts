"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

export function useElementSize<T extends HTMLElement>(): [RefObject<T | null>, { width: number; height: number }] {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    console.log("DEBUG_USE_ELEMENT_SIZE mount", { hasEl: !!el });
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      console.log("DEBUG_USE_ELEMENT_SIZE callback", { hasEntry: !!entry, contentRect: entry?.contentRect });
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, size];
}
