"use client";

import "@/lib/pdfWorker";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Document, Page } from "react-pdf";
import { useElementSize } from "@/lib/hooks/useElementSize";
import { useSwipe } from "@/lib/hooks/useSwipe";
import { DEFAULT_ZOOM } from "@/config/experience";
import { Loader } from "@/components/ui/Loader";

const MAX_PAGE_WIDTH = 820;
const HORIZONTAL_PADDING = 32;
const VERTICAL_PADDING = 24;
const DEFAULT_ASPECT_RATIO = 1 / Math.SQRT2; // A4 portrait, width / height
// Canvases render at CSS-width × devicePixelRatio physical pixels. On a 3x
// phone screen that's 9x the pixel-fill/decode cost of a 1x display for a
// sharpness gain that's invisible at this page size — capping it keeps pages
// crisp while cutting render time substantially on high-DPI devices.
const MAX_DEVICE_PIXEL_RATIO = 2;
// The server serves the PDF with byte-range support, so pdf.js fetches only
// the bytes a requested page actually needs rather than the whole file.
// Warming several pages ahead (readers mostly go forward) means those range
// requests already happened by the time "Weiter" is tapped.
const FORWARD_PRELOAD_PAGES = 3;
const BACKWARD_PRELOAD_PAGES = 1;
const PRELOAD_DELAY_MS = 200;

interface PdfProxy {
  numPages: number;
  getPage: (pageNumber: number) => Promise<unknown>;
}

interface PdfStageProps {
  file: string;
  pageNumber: number;
  zoom: number;
  rotation: number;
  onLoadSuccess: (numPages: number) => void;
  onLoadError: () => void;
  onPageError: () => void;
  onSwipeNext: () => void;
  onSwipePrev: () => void;
}

export function PdfStage({
  file,
  pageNumber,
  zoom,
  rotation,
  onLoadSuccess,
  onLoadError,
  onPageError,
  onSwipeNext,
  onSwipePrev,
}: PdfStageProps) {
  const [containerRef, size] = useElementSize<HTMLDivElement>();
  const [aspectRatio, setAspectRatio] = useState(DEFAULT_ASPECT_RATIO);
  const [prevPage, setPrevPage] = useState(pageNumber);
  const [direction, setDirection] = useState(0);
  const [pdfProxy, setPdfProxy] = useState<PdfProxy | null>(null);
  const devicePixelRatio = Math.min(
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
    MAX_DEVICE_PIXEL_RATIO,
  );

  if (pageNumber !== prevPage) {
    setDirection(pageNumber > prevPage ? 1 : -1);
    setPrevPage(pageNumber);
  }

  const swipeHandlers = useSwipe(onSwipeNext, onSwipePrev, zoom === DEFAULT_ZOOM);

  const handleDocumentLoadSuccess = useCallback(
    (pdf: PdfProxy) => {
      setPdfProxy(pdf);
      onLoadSuccess(pdf.numPages);
    },
    [onLoadSuccess],
  );

  // Warm pdf.js's cache for upcoming pages while the current one is being
  // viewed, so paging forward doesn't pay for fetching/parsing that page
  // from scratch — it's already resolved by the time react-pdf asks for it.
  // Delayed slightly so the current page's own fetch always wins the race
  // for bandwidth, and cancelled on rapid navigation to avoid warming
  // targets that are already stale.
  useEffect(() => {
    if (!pdfProxy) return;

    const targets: number[] = [];
    for (let offset = 1; offset <= FORWARD_PRELOAD_PAGES; offset++) {
      targets.push(pageNumber + offset);
    }
    for (let offset = 1; offset <= BACKWARD_PRELOAD_PAGES; offset++) {
      targets.push(pageNumber - offset);
    }

    const timer = setTimeout(() => {
      for (const target of targets) {
        if (target >= 1 && target <= pdfProxy.numPages) {
          pdfProxy.getPage(target).catch(() => {});
        }
      }
    }, PRELOAD_DELAY_MS);

    return () => clearTimeout(timer);
  }, [pageNumber, pdfProxy]);

  const handlePageLoadSuccess = useCallback((page: { originalWidth: number; originalHeight: number }) => {
    // Use the unscaled page size, not the rendered width/height — those
    // reflect the `width` prop we just passed in and would feed back into
    // the size calculation below, causing an infinite render loop.
    if (page.originalWidth && page.originalHeight) {
      setAspectRatio((prev) => {
        const next = page.originalWidth / page.originalHeight;
        return Math.abs(next - prev) < 0.001 ? prev : next;
      });
    }
  }, []);

  // react-pdf's `width` prop always maps to the rendered canvas width, but
  // when rotated 90/270 the page's displayed shape is height×width swapped —
  // so fitting it to the available space means solving with the inverse ratio.
  const isSideways = rotation === 90 || rotation === 270;
  const displayAspectRatio = isSideways ? 1 / aspectRatio : aspectRatio;

  const availableWidth = Math.max(size.width - HORIZONTAL_PADDING, 0);
  const availableHeight = Math.max(size.height - VERTICAL_PADDING, 0);
  const widthFromHeight = isSideways ? availableHeight / aspectRatio : availableHeight * aspectRatio;
  const baseWidth = Math.min(availableWidth, widthFromHeight || availableWidth, MAX_PAGE_WIDTH) || availableWidth;
  const pageWidth = Math.max(baseWidth * zoom, 1);

  const isZoomed = zoom > DEFAULT_ZOOM + 0.001;

  return (
    <div
      ref={containerRef}
      className={`relative flex h-full w-full min-h-0 flex-1 items-start justify-center ${
        isZoomed ? "overflow-auto" : "overflow-hidden"
      }`}
      {...swipeHandlers}
    >
      <div
        className="flex min-h-full w-full items-center justify-center py-3"
        style={isZoomed ? { minWidth: pageWidth + HORIZONTAL_PADDING } : undefined}
      >
        <Document
          file={file}
          onLoadSuccess={handleDocumentLoadSuccess}
          onLoadError={onLoadError}
          loading={<Loader label="Eure Bauanleitung wird vorbereitet …" />}
          error={null}
          className="flex items-center justify-center"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pageNumber}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -24 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden rounded-sm bg-white shadow-[0_8px_30px_rgba(33,31,29,0.12)]"
            >
              <Page
                pageNumber={pageNumber}
                width={pageWidth}
                rotate={rotation}
                devicePixelRatio={devicePixelRatio}
                onLoadSuccess={handlePageLoadSuccess}
                onLoadError={onPageError}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={
                  <div
                    style={{ width: pageWidth, aspectRatio: displayAspectRatio }}
                    className="animate-pulse bg-cream-200"
                  />
                }
              />
            </motion.div>
          </AnimatePresence>
        </Document>
      </div>
    </div>
  );
}
