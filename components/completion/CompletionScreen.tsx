"use client";

import { motion } from "framer-motion";
import { experienceConfig } from "@/config/experience";
import { Button } from "@/components/ui/Button";
import { GoldRain } from "@/components/ui/GoldRain";

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

  return (
    <main className="relative flex h-screen-safe w-full flex-col items-center justify-center overflow-hidden bg-cream-50 px-6 safe-top safe-bottom">
      <GoldRain />

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
