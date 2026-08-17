"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { experienceConfig } from "@/config/experience";
import { HeartIcon } from "@/components/ui/HeartIcon";

const AUTO_DISMISS_MS = 7000;

export function TutorialHint({
  visible,
  onDismiss,
}: {
  visible: boolean;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={onDismiss}
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
          className="absolute bottom-4 right-4 z-10 flex max-w-[15.5rem] items-start gap-3 rounded-2xl border border-gold-400/40 bg-anthracite-900 px-4 py-3.5 text-left shadow-lg shadow-anthracite-900/20 sm:bottom-6 sm:right-6"
          aria-label={`${experienceConfig.tutorialHint} Tippen zum Ausblenden.`}
        >
          <motion.span
            aria-hidden
            className="mt-0.5 shrink-0 text-gold-400"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <HeartIcon className="h-4 w-4" />
          </motion.span>
          <span className="font-sans text-sm leading-relaxed text-cream-50">
            {experienceConfig.tutorialHint}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
