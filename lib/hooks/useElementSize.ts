"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

export function useElementSize<T extends HTMLElement>(): [RefObject<T | null>, { width: number; height: number }] {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Seed the real size immediately: ResizeObserver is spec'd to fire once
    // on observe(), but don't leave layout dependent on that promise alone —
    // reading the rect synchronously here means callers never see a
    // momentary {0,0} that could feed into a size calculation.
    const rect = el.getBoundingClientRect();
    setSize({ width: rect.width, height: rect.height });

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, size];
}
