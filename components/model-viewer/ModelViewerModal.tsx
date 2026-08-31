"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ModelViewerStage } from "@/components/model-viewer/ModelViewerStage";
import { ModelTabs, type ModelTab } from "@/components/model-viewer/ModelTabs";

interface ModelViewerModalProps {
  open: boolean;
  onClose: () => void;
  /** One entry per 3D view available here; the first is the default. */
  tabs: ModelTab[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function ModelViewerModal({
  open,
  onClose,
  tabs,
  activeId,
  onSelect,
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

  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <AnimatePresence>
      {open && active && (
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
            aria-label="Das Modell in 3D"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="safe-bottom safe-left safe-right relative flex h-[85vh] w-full flex-col overflow-hidden rounded-t-3xl bg-cream-50 shadow-2xl sm:h-[75vh] sm:max-w-2xl sm:rounded-2xl"
          >
            <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-anthracite-900/15 sm:hidden" />

            <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-6">
              {/* A single view needs no tab bar — it just gets a title. */}
              {tabs.length > 1 ? (
                <ModelTabs tabs={tabs} activeId={active.id} onSelect={onSelect} />
              ) : (
                <h2 className="truncate font-serif text-2xl text-anthracite-900 sm:text-3xl">
                  {active.label}
                </h2>
              )}
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Schließen"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-anthracite-700 transition-colors hover:bg-anthracite-900/5"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="relative min-h-0 flex-1 px-2 pb-2 sm:px-4 sm:pb-4">
              {/* Deliberately not keyed on the active tab: one <Canvas> stays
                  mounted for the whole visit and the model is swapped inside
                  it, so switching tabs never recreates the WebGL context. */}
              <ModelViewerStage
                objFile={active.objFile}
                mtlFile={active.mtlFile}
              />
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
