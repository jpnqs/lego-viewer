"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { experienceConfig } from "@/config/experience";
import { useExperienceState } from "@/lib/hooks/useExperienceState";
import { getMessageForPage, pageHasMessage } from "@/lib/messages";
import { getSubModelForPage } from "@/lib/subModels";
import { scheduleIdle } from "@/lib/scheduleIdle";
import { TopToolbar } from "@/components/navigation/TopToolbar";
import { BottomNav } from "@/components/navigation/BottomNav";
import { MessageModal } from "@/components/messages/MessageModal";
import { MessageIndicator } from "@/components/messages/MessageIndicator";
import { AutoOpenToast } from "@/components/messages/AutoOpenToast";
import { TutorialHint } from "@/components/messages/TutorialHint";
import { ModelIndicator } from "@/components/model-viewer/ModelIndicator";
import type { ModelTab } from "@/components/model-viewer/ModelTabs";
import { CompletionScreen } from "@/components/completion/CompletionScreen";
import { ResumePrompt } from "@/components/ui/ResumePrompt";
import { Loader } from "@/components/ui/Loader";

// three.js touches WebGL/canvas globals at module-evaluation time — like
// react-pdf, it must never be part of the server bundle.
const ModelViewerModal = dynamic(
  () =>
    import("@/components/model-viewer/ModelViewerModal").then(
      (m) => m.ModelViewerModal,
    ),
  { ssr: false },
);

const ModelPreloader = dynamic(
  () =>
    import("@/components/model-viewer/ModelPreloader").then(
      (m) => m.ModelPreloader,
    ),
  { ssr: false },
);

// react-pdf pulls in pdfjs-dist, which touches browser-only globals (DOMMatrix)
// at module-evaluation time — it must never be part of the server bundle.
const PdfViewer = dynamic(
  () => import("@/components/pdf-viewer/PdfViewer").then((m) => m.PdfViewer),
  {
    ssr: false,
    loading: () => <Loader label="Eure Bauanleitung wird vorbereitet …" />,
  },
);

export function ExperienceRoot() {
  const state = useExperienceState();
  const [warmFullModel, setWarmFullModel] = useState(false);

  // The finished model is a 36MB fetch and parse, so it waits for idle time
  // rather than competing with the instructions. Sub-models are small enough
  // to warm straight away.
  useEffect(() => {
    if (state.viewState !== "active") return;
    return scheduleIdle(() => setWarmFullModel(true));
  }, [state.viewState]);

  useEffect(() => {
    if (state.viewState !== "active") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (state.isCompleted) return;
      // An open modal owns the arrow keys — the 3D viewer uses them to move
      // between its tabs.
      if (state.modelView !== null || state.openMessagePage !== null) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        state.prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        state.next();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [state]);

  if (state.viewState === "checking") {
    return <div className="h-screen-safe w-full bg-cream-50" />;
  }

  if (state.viewState === "resume-prompt") {
    return (
      <ResumePrompt
        page={state.savedPageForPrompt ?? 1}
        onContinue={state.resumeContinue}
        onRestart={state.resumeRestart}
      />
    );
  }

  if (state.isCompleted) {
    return <CompletionScreen onRestart={state.restartFromCompletion} />;
  }

  const currentMessage =
    state.openMessagePage !== null
      ? (getMessageForPage(state.openMessagePage) ?? null)
      : null;
  const currentSubModel = getSubModelForPage(state.currentPage);
  const showChrome = state.totalPages !== null && !state.loadError;

  // The sub-model comes first: on a page that has one, it is what the visitor
  // is building right now, and the finished model is the reference behind it.
  const modelTabs: ModelTab[] = [
    ...(currentSubModel
      ? [
          {
            id: "sub",
            label: currentSubModel.label ?? "Dieser Bauabschnitt",
            objFile: currentSubModel.objFile,
            mtlFile: currentSubModel.mtlFile,
          },
        ]
      : []),
    {
      id: "full",
      label: "Das fertige Modell",
      objFile: experienceConfig.model.objFile,
      mtlFile: experienceConfig.model.mtlFile,
    },
  ];

  // Turning a page can drop the "sub" tab out from under an open viewer.
  const activeModelTab =
    modelTabs.find((t) => t.id === state.modelView)?.id ?? modelTabs[0].id;

  return (
    <div className="flex h-screen-safe w-full flex-col overflow-hidden bg-cream-50">
      {showChrome && (
        <TopToolbar
          zoom={state.zoom}
          rotation={state.rotation}
          onZoomIn={state.zoomIn}
          onZoomOut={state.zoomOut}
          onZoomReset={state.resetZoom}
          onRotate={state.rotateClockwise}
        />
      )}

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {showChrome && (
          <AutoOpenToast visible={state.pendingAutoOpenPage !== null} />
        )}
        <PdfViewer
          file={experienceConfig.pdf.file}
          pageNumber={state.currentPage}
          zoom={state.zoom}
          rotation={state.rotation}
          loadError={state.loadError}
          onLoadSuccess={state.handleDocumentLoadSuccess}
          onLoadError={state.handleDocumentLoadError}
          onRetry={state.retry}
          onSwipeNext={state.next}
          onSwipePrev={state.prev}
        />
        {showChrome && pageHasMessage(state.currentPage) && (
          <MessageIndicator
            onClick={() => state.openMessage(state.currentPage)}
          />
        )}
        {showChrome && !pageHasMessage(state.currentPage) && (
          <TutorialHint
            visible={state.showTutorialHint}
            onDismiss={state.dismissTutorialHint}
          />
        )}
        {showChrome && (
          <ModelIndicator
            onClick={() =>
              state.showModelView(currentSubModel ? "sub" : "full")
            }
            modelCount={currentSubModel ? 2 : 1}
          />
        )}
      </div>

      {showChrome && state.totalPages !== null && (
        <BottomNav
          currentPage={state.currentPage}
          totalPages={state.totalPages}
          onPrev={state.prev}
          onNext={state.next}
          onJumpToPage={state.goToPage}
        />
      )}

      <MessageModal message={currentMessage} onClose={state.closeMessage} />

      {/* One viewer for every 3D view on this page. It keeps a single
          <Canvas> alive and swaps the model between tabs, so switching never
          recreates the WebGL context. */}
      <ModelViewerModal
        open={state.modelView !== null}
        onClose={state.closeModelViewer}
        tabs={modelTabs}
        activeId={activeModelTab}
        onSelect={(id) => state.showModelView(id as "sub" | "full")}
      />

      {/* Warm every tab, not just the one that opens first, so switching is
          instant rather than a fetch-and-parse away. */}
      {modelTabs
        .filter((tab) => tab.id !== "full" || warmFullModel)
        .map((tab) => (
          <ModelPreloader
            key={tab.id}
            objFile={tab.objFile}
            mtlFile={tab.mtlFile}
          />
        ))}
    </div>
  );
}
