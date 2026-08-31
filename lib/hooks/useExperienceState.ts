"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AUTO_OPEN_REVEAL_MS,
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  MODEL_VIEW_SWITCH_DELAY_MS,
  ZOOM_STEP,
} from "@/config/experience";
import { clearProgress, loadProgress, saveProgress } from "@/lib/storage";
import { getMessageForPage } from "@/lib/messages";
import type { PageRotation } from "@/lib/types";

type ViewState = "checking" | "resume-prompt" | "active";
type ModelView = "sub" | "full" | null;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function useExperienceState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlPage = searchParams.get("page");

  const [viewState, setViewState] = useState<ViewState>("checking");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [zoom, setZoomState] = useState(DEFAULT_ZOOM);
  const [rotation, setRotationState] = useState<PageRotation>(0);
  const [loadError, setLoadError] = useState(false);

  const [openedMessages, setOpenedMessages] = useState<Set<number>>(new Set());
  const [autoOpenedMessages, setAutoOpenedMessages] = useState<Set<number>>(new Set());
  const [openMessagePage, setOpenMessagePage] = useState<number | null>(null);
  const [pendingAutoOpenPage, setPendingAutoOpenPage] = useState<number | null>(null);
  const [savedPageForPrompt, setSavedPageForPrompt] = useState<number | null>(null);
  const [tutorialDismissed, setTutorialDismissed] = useState(false);
  const [prevPageForTutorial, setPrevPageForTutorial] = useState(currentPage);
  const [modelView, setModelView] = useState<ModelView>(null);

  const hasHydrated = useRef(false);
  const modelViewSwitchTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Resolve initial view state once, client-side only (localStorage + URL).
  // localStorage/searchParams aren't available at render time, so this
  // necessarily hydrates via an effect rather than during render.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;

    const stored = loadProgress();
    if (stored) {
      setOpenedMessages(new Set(stored.openedMessages));
      setAutoOpenedMessages(new Set(stored.autoOpenedMessages));
    }

    const parsedUrlPage = urlPage ? Number.parseInt(urlPage, 10) : NaN;
    if (Number.isFinite(parsedUrlPage) && parsedUrlPage > 0) {
      setCurrentPage(parsedUrlPage);
      if (stored) {
        setZoomState(stored.zoom);
        setRotationState(stored.rotation);
      }
      setViewState("active");
      return;
    }

    if (stored && stored.page > 1) {
      setSavedPageForPrompt(stored.page);
      setViewState("resume-prompt");
      return;
    }

    setViewState("active");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Persist progress while actively viewing.
  useEffect(() => {
    if (viewState !== "active") return;
    saveProgress({
      version: 1,
      page: currentPage,
      zoom,
      rotation,
      openedMessages: Array.from(openedMessages),
      autoOpenedMessages: Array.from(autoOpenedMessages),
      updatedAt: Date.now(),
    });
  }, [viewState, currentPage, zoom, rotation, openedMessages, autoOpenedMessages]);

  // Keep the URL in sync with the current page for shareable deep links.
  useEffect(() => {
    if (viewState !== "active" || !totalPages) return;
    if (currentPage < 1 || currentPage > totalPages) return;
    const next = `${pathname}?page=${currentPage}`;
    const current = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    if (next !== current) {
      router.replace(next, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, totalPages, viewState, pathname]);

  const isCompleted = totalPages !== null && currentPage > totalPages;

  const goToPage = useCallback(
    (page: number) => {
      if (totalPages === null) {
        setCurrentPage(Math.max(1, page));
        return;
      }
      setCurrentPage(clamp(page, 1, totalPages + 1));
    },
    [totalPages],
  );

  const next = useCallback(() => {
    setCurrentPage((p) => {
      const max = totalPages !== null ? totalPages + 1 : p + 1;
      return Math.min(p + 1, max);
    });
  }, [totalPages]);

  const prev = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1));
  }, []);

  const setZoom = useCallback((z: number) => {
    setZoomState(clamp(Number(z.toFixed(2)), MIN_ZOOM, MAX_ZOOM));
  }, []);

  const zoomIn = useCallback(() => setZoom(zoom + ZOOM_STEP), [zoom, setZoom]);
  const zoomOut = useCallback(() => setZoom(zoom - ZOOM_STEP), [zoom, setZoom]);
  const resetZoom = useCallback(() => setZoom(DEFAULT_ZOOM), [setZoom]);

  const rotateClockwise = useCallback(() => {
    setRotationState((r) => (((r + 90) % 360) as PageRotation));
  }, []);

  const openMessage = useCallback((page: number) => {
    setOpenMessagePage(page);
    setOpenedMessages((prev) => {
      if (prev.has(page)) return prev;
      const next = new Set(prev);
      next.add(page);
      return next;
    });
  }, []);

  const closeMessage = useCallback(() => setOpenMessagePage(null), []);

  // The sub-model and full-model viewers are two fully independent modals —
  // each mounts its own <Canvas> (own WebGL context) only while its own
  // `modelView` value is active, and the two are never both open at once.
  // Switching between them closes the current one and waits for it to fully
  // unmount (clearing its WebGL context) before mounting the other, rather
  // than swapping in the same tick — iOS Safari can otherwise drop the new
  // context if the old one hasn't been released yet.
  const openModelViewer = useCallback((view: "sub" | "full") => {
    if (modelViewSwitchTimeout.current) {
      clearTimeout(modelViewSwitchTimeout.current);
      modelViewSwitchTimeout.current = null;
    }
    setModelView(view);
  }, []);

  const closeModelViewer = useCallback(() => {
    if (modelViewSwitchTimeout.current) {
      clearTimeout(modelViewSwitchTimeout.current);
      modelViewSwitchTimeout.current = null;
    }
    setModelView(null);
  }, []);

  const switchModelView = useCallback((view: "sub" | "full") => {
    setModelView(null);
    modelViewSwitchTimeout.current = setTimeout(() => {
      setModelView(view);
      modelViewSwitchTimeout.current = null;
    }, MODEL_VIEW_SWITCH_DELAY_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (modelViewSwitchTimeout.current) {
        clearTimeout(modelViewSwitchTimeout.current);
      }
    };
  }, []);

  // Reset the dismissal whenever the visitor arrives at page 1 again, so the
  // hint reappears on every visit rather than only the very first time.
  if (currentPage !== prevPageForTutorial) {
    if (currentPage === 1) setTutorialDismissed(false);
    setPrevPageForTutorial(currentPage);
  }

  const showTutorialHint = viewState === "active" && !isCompleted && currentPage === 1 && !tutorialDismissed;
  const dismissTutorialHint = useCallback(() => setTutorialDismissed(true), []);

  // Trigger the one-time "heart" reveal animation when landing on a page
  // that carries an autoOpen message we haven't shown yet. This reacts to
  // navigation (a value changing over time), which is what effects are for;
  // marking the page as seen is bundled with starting the reveal timer.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (viewState !== "active" || isCompleted) return;
    const message = getMessageForPage(currentPage);
    if (!message?.autoOpen) return;
    if (autoOpenedMessages.has(currentPage)) return;

    setAutoOpenedMessages((prevSet) => {
      const next = new Set(prevSet);
      next.add(currentPage);
      return next;
    });
    setPendingAutoOpenPage(currentPage);

    const timer = setTimeout(() => {
      setPendingAutoOpenPage(null);
      openMessage(currentPage);
    }, AUTO_OPEN_REVEAL_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, viewState, isCompleted]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const resumeContinue = useCallback(() => {
    const stored = loadProgress();
    if (stored) {
      setCurrentPage(stored.page);
      setZoomState(stored.zoom);
      setRotationState(stored.rotation);
    }
    setViewState("active");
  }, []);

  const resumeRestart = useCallback(() => {
    clearProgress();
    setOpenedMessages(new Set());
    setAutoOpenedMessages(new Set());
    setCurrentPage(1);
    setZoomState(DEFAULT_ZOOM);
    setRotationState(0);
    setViewState("active");
  }, []);

  const restartFromCompletion = useCallback(() => {
    clearProgress();
    setOpenedMessages(new Set());
    setAutoOpenedMessages(new Set());
    setZoomState(DEFAULT_ZOOM);
    setRotationState(0);
    setCurrentPage(1);
  }, []);

  const retry = useCallback(() => {
    setLoadError(false);
  }, []);

  const handleDocumentLoadSuccess = useCallback((numPages: number) => {
    setTotalPages(numPages);
    setLoadError(false);
  }, []);

  const handleDocumentLoadError = useCallback(() => {
    setLoadError(true);
  }, []);

  return useMemo(
    () => ({
      viewState,
      currentPage,
      totalPages,
      isCompleted,
      zoom,
      rotation,
      loadError,
      openedMessages,
      autoOpenedMessages,
      openMessagePage,
      pendingAutoOpenPage,
      savedPageForPrompt,
      showTutorialHint,
      dismissTutorialHint,
      goToPage,
      next,
      prev,
      setZoom,
      zoomIn,
      zoomOut,
      resetZoom,
      rotateClockwise,
      openMessage,
      closeMessage,
      modelView,
      openModelViewer,
      closeModelViewer,
      switchModelView,
      resumeContinue,
      resumeRestart,
      restartFromCompletion,
      retry,
      handleDocumentLoadSuccess,
      handleDocumentLoadError,
    }),
    [
      viewState,
      currentPage,
      totalPages,
      isCompleted,
      zoom,
      rotation,
      loadError,
      openedMessages,
      autoOpenedMessages,
      openMessagePage,
      pendingAutoOpenPage,
      savedPageForPrompt,
      showTutorialHint,
      dismissTutorialHint,
      goToPage,
      next,
      prev,
      setZoom,
      zoomIn,
      zoomOut,
      resetZoom,
      rotateClockwise,
      openMessage,
      closeMessage,
      modelView,
      openModelViewer,
      closeModelViewer,
      switchModelView,
      resumeContinue,
      resumeRestart,
      restartFromCompletion,
      retry,
      handleDocumentLoadSuccess,
      handleDocumentLoadError,
    ],
  );
}

export type ExperienceState = ReturnType<typeof useExperienceState>;
