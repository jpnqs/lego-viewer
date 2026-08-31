"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ModelViewerStage } from "@/components/model-viewer/ModelViewerStage";

interface ModelViewerModalProps {
  open: boolean;
  onClose: () => void;
  objFile: string;
  mtlFile: string;
  title: string;
  /** Optional CTA to jump to the other model view (e.g. sub-model <-> full
   * model). This modal has no knowledge of what that other view is — the
   * parent decides, so the two views stay fully independent of each other. */
  switchAction?: {
    label: string;
    onClick: () => void;
  };
}

export function ModelViewerModal({
  open,
  onClose,
  objFile,
  mtlFile,
  title,
  switchAction,
}: ModelViewerModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Unlike MessageModal, this is a casual viewer: backdrop click and Escape
  // both dismiss it, in addition to the explicit close button.
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-anthracite-900/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="model-viewer-modal-title"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="safe-bottom safe-left safe-right relative flex h-[85vh] w-full flex-col overflow-hidden rounded-t-3xl bg-cream-50 shadow-2xl sm:h-[75vh] sm:max-w-2xl sm:rounded-2xl"
          >
            <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-anthracite-900/15 sm:hidden" />

            <div className="flex items-center justify-between px-6 pt-4 sm:px-8 sm:pt-6">
              <h2
                id="model-viewer-modal-title"
                className="font-serif text-2xl text-anthracite-900 sm:text-3xl"
              >
                {title}
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Schließen"
                className="flex h-10 w-10 items-center justify-center rounded-full text-anthracite-700 transition-colors hover:bg-anthracite-900/5"
              >
                <CloseIcon />
              </button>
            </div>

            {switchAction && (
              <button
                type="button"
                onClick={switchAction.onClick}
                className="mx-6 mt-2 self-start text-sm font-medium text-anthracite-700 underline decoration-anthracite-700/30 underline-offset-4 transition-colors hover:text-anthracite-900 sm:mx-8"
              >
                {switchAction.label} →
              </button>
            )}

            <div className="relative min-h-0 flex-1 px-2 pb-2 sm:px-4 sm:pb-4">
              {/* Only ever rendered while this specific modal is open, and
                  never alongside the other model view's modal/Canvas. */}
              {open && (
                <ModelViewerStage
                  key={`${objFile}|${mtlFile}`}
                  objFile={objFile}
                  mtlFile={mtlFile}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
