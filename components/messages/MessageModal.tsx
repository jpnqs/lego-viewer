"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageContent } from "@/components/messages/MessageContent";
import { Button } from "@/components/ui/Button";
import type { ExperienceMessage } from "@/lib/types";

interface MessageModalProps {
  message: ExperienceMessage | null;
  onClose: () => void;
}

export function MessageModal({ message, onClose }: MessageModalProps) {
  const continueButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Intentionally no backdrop-click or Escape handling here: these messages
  // are meant to be read deliberately, so the only way to close them is the
  // explicit "Weiterbauen" button — accidental taps/Escape must not dismiss them.
  useEffect(() => {
    if (!message) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    continueButtonRef.current?.focus();

    return () => {
      previouslyFocused.current?.focus?.();
    };
  }, [message]);

  return (
    <AnimatePresence>
      {message && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-anthracite-900/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="message-modal-title"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="safe-bottom safe-left safe-right relative flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-3xl bg-cream-50 shadow-2xl sm:max-w-lg sm:rounded-2xl"
          >
            <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-anthracite-900/15 sm:hidden" />

            <div className="px-6 pt-4 sm:px-8 sm:pt-8">
              <h2
                id="message-modal-title"
                className="font-serif text-2xl text-anthracite-900 sm:text-3xl"
              >
                {message.title}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 sm:px-8 sm:pb-8">
              <MessageContent message={message} />
            </div>

            <div className="border-t border-anthracite-900/10 px-6 py-4 sm:px-8">
              <Button
                ref={continueButtonRef}
                onClick={onClose}
                variant="primary"
                size="md"
                className="w-full sm:w-auto"
              >
                Weiterbauen
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
