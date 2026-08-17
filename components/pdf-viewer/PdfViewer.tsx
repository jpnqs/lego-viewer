"use client";

import { PdfStage } from "@/components/pdf-viewer/PdfStage";
import { ErrorState } from "@/components/ui/ErrorState";

interface PdfViewerProps {
  file: string;
  pageNumber: number;
  zoom: number;
  rotation: number;
  loadError: boolean;
  onLoadSuccess: (numPages: number) => void;
  onLoadError: () => void;
  onRetry: () => void;
  onSwipeNext: () => void;
  onSwipePrev: () => void;
}

export function PdfViewer({
  file,
  pageNumber,
  zoom,
  rotation,
  loadError,
  onLoadSuccess,
  onLoadError,
  onRetry,
  onSwipeNext,
  onSwipePrev,
}: PdfViewerProps) {
  if (loadError) {
    return (
      <ErrorState
        message="Die Bauanleitung konnte leider nicht geladen werden."
        onRetry={onRetry}
      />
    );
  }

  return (
    <PdfStage
      file={file}
      pageNumber={pageNumber}
      zoom={zoom}
      rotation={rotation}
      onLoadSuccess={onLoadSuccess}
      onLoadError={onLoadError}
      onPageError={onLoadError}
      onSwipeNext={onSwipeNext}
      onSwipePrev={onSwipePrev}
    />
  );
}
