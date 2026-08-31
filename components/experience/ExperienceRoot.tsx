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
  const [preloadModel, setPreloadModel] = useState(false);

  // Warm the 3D model's loader cache once while the visitor is busy reading
  // instructions, so opening the viewer later doesn't wait on a 36MB fetch/parse.
  useEffect(() => {
    if (state.viewState !== "active") return;
    return scheduleIdle(() => setPreloadModel(true));
  }, [state.viewState]);

  useEffect(() => {
    if (state.viewState !== "active") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (state.isCompleted) return;

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
            onClick={state.open3DViewer}
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
      <ModelViewerModal
        open={state.show3DViewer}
        onClose={state.close3DViewer}
        objFile={experienceConfig.model.objFile}
        mtlFile={experienceConfig.model.mtlFile}
        subModel={currentSubModel}
      />
      {preloadModel && (
        <ModelPreloader
          objFile={experienceConfig.model.objFile}
          mtlFile={experienceConfig.model.mtlFile}
        />
      )}
      {currentSubModel && (
        <ModelPreloader
          objFile={currentSubModel.objFile}
          mtlFile={currentSubModel.mtlFile}
        />
      )}
    </div>
  );
}
