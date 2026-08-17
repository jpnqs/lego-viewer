"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function ResumePrompt({
  page,
  onContinue,
  onRestart,
}: {
  page: number;
  onContinue: () => void;
  onRestart: () => void;
}) {
  return (
    <main className="flex h-screen-safe w-full flex-col items-center justify-center bg-cream-50 px-6 text-center safe-top safe-bottom">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex max-w-sm flex-col items-center gap-8"
      >
        <p className="font-serif text-2xl leading-relaxed text-anthracite-900">
          Ihr wart zuletzt auf Seite {page}.
        </p>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={onContinue} variant="primary" size="md" className="w-full sm:w-auto">
            Weiterbauen
          </Button>
          <Button onClick={onRestart} variant="secondary" size="md" className="w-full sm:w-auto">
            Von vorne beginnen
          </Button>
        </div>
      </motion.div>
    </main>
  );
}
