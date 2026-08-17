"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { experienceConfig } from "@/config/experience";
import { Button } from "@/components/ui/Button";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.5, delayChildren: 0.3 } },
};

const lineVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] as const } },
};

export function CompletionScreen({ onRestart }: { onRestart: () => void }) {
  const { completion } = experienceConfig;
  const particles = useMemo(() => generateParticles(16), []);

  return (
    <main className="relative flex h-screen-safe w-full flex-col items-center justify-center overflow-hidden bg-cream-50 px-6 safe-top safe-bottom">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((p) => (
          <span
            key={p.id}
            className="animate-gentle-fall absolute block rounded-full"
            style={{
              left: `${p.left}%`,
              top: "-4%",
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 flex max-w-xl flex-col items-center text-center"
      >
        <motion.h1 variants={lineVariants} className="font-serif text-5xl text-anthracite-900 sm:text-6xl">
          {completion.heading}
        </motion.h1>

        {completion.lines.map((line, i) => (
          <motion.p
            key={i}
            variants={lineVariants}
            className="mt-7 max-w-md font-serif text-xl italic leading-relaxed text-anthracite-700 sm:text-2xl"
          >
            {line}
          </motion.p>
        ))}

        <motion.p variants={lineVariants} className="mt-8 font-serif text-xl text-anthracite-800">
          {completion.signature}
        </motion.p>

        <motion.div variants={lineVariants} className="mt-12">
          <Button onClick={onRestart} variant="secondary" size="md">
            {completion.restartLabel}
          </Button>
        </motion.div>
      </motion.div>
    </main>
  );
}

interface Particle {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

function generateParticles(count: number): Particle[] {
  const colors = ["#c9a667", "#e3cf9c", "#fdfbf7"];
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 100,
    size: 4 + Math.random() * 6,
    duration: 5 + Math.random() * 4,
    delay: Math.random() * 3,
    color: colors[id % colors.length],
  }));
}
