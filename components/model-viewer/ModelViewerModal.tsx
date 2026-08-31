"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ModelViewerStage } from "@/components/model-viewer/ModelViewerStage";
import type { SubModelEntry } from "@/lib/types";

interface ModelViewerModalProps {
  open: boolean;
  onClose: () => void;
  objFile: string;
  mtlFile: string;
  /** Sub-model for the current PDF page, if configured; adds a tab switcher. */
  subModel?: SubModelEntry;
}

type ViewTab = "sub" | "full";

export function ModelViewerModal({
  open,
  onClose,
  objFile,
  mtlFile,
  subModel,
}: ModelViewerModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>(
    subModel ? "sub" : "full",
  );

  // Unlike MessageModal, this is a casual viewer: backdrop click and Escape
  // both dismiss it, in addition to the explicit close button.
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    // Default to the sub-model tab so builders see the current step first,
    // resetting each time the modal is reopened (possibly for a new page).
    setActiveTab(subModel ? "sub" : "full");

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose]);

  const showingSub = activeTab === "sub" && !!subModel;
  const activeObjFile = showingSub ? subModel!.objFile : objFile;
  const activeMtlFile = showingSub ? subModel!.mtlFile : mtlFile;
  const title = showingSub
    ? (subModel!.label ?? "Dieser Bauabschnitt")
    : "Das fertige Modell";

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

            {subModel && (
              <div
                role="tablist"
                aria-label="Modellansicht wählen"
                className="mx-6 mt-3 flex gap-1 rounded-full bg-anthracite-900/5 p-1 sm:mx-8"
              >
                <TabButton
                  active={activeTab === "sub"}
                  onClick={() => setActiveTab("sub")}
                >
                  {subModel.label ?? "Dieser Bauabschnitt"}
                </TabButton>
                <TabButton
                  active={activeTab === "full"}
                  onClick={() => setActiveTab("full")}
                >
                  Gesamtmodell
                </TabButton>
              </div>
            )}

            <div className="relative min-h-0 flex-1 px-2 pb-2 sm:px-4 sm:pb-4">
              {open && (
                <ModelViewerStage
                  key={activeObjFile}
                  objFile={activeObjFile}
                  mtlFile={activeMtlFile}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-cream-50 text-anthracite-900 shadow-sm"
          : "text-anthracite-700 hover:text-anthracite-900"
      }`}
    >
      {children}
    </button>
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
