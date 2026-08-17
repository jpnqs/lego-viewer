"use client";

import { useEffect, useState } from "react";

interface RainDrop {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  blur: number;
}

const DROP_COUNT = 18;

function generateDrops(count: number): RainDrop[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 100,
    size: 4 + Math.random() * 6,
    duration: 11 + Math.random() * 9,
    delay: Math.random() * 14,
    blur: 1.5 + Math.random() * 2.5,
  }));
}

export function GoldRain() {
  // Generated client-side only, after mount — Math.random() during the
  // server render would produce values that don't match the client's first
  // render and trigger a hydration mismatch.
  const [drops, setDrops] = useState<RainDrop[] | null>(null);

  // Math.random() is inherently client-only for consistent hydration, so
  // this can't be computed during render — it must wait for mount.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setDrops(generateDrops(DROP_COUNT));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!drops) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {drops.map((drop) => (
        <span
          key={drop.id}
          className="animate-gold-rain-fall absolute rounded-full bg-gold-400"
          style={{
            left: `${drop.left}%`,
            top: "-10%",
            width: drop.size,
            height: drop.size,
            filter: `blur(${drop.blur}px)`,
            animationDuration: `${drop.duration}s`,
            animationDelay: `${drop.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
