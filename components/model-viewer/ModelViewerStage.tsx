"use client";

import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import type { RootState } from "@react-three/fiber";
import { Bounds, Environment, OrbitControls, useBounds } from "@react-three/drei";
import type { Group } from "three";
import { Loader } from "@/components/ui/Loader";
import { ErrorState } from "@/components/ui/ErrorState";
import { useModel } from "@/components/model-viewer/useModel";

interface ModelViewerStageProps {
  objFile: string;
  mtlFile: string;
}

/**
 * Viewing angle only. Models are normalised to a 2-unit box on load, so this
 * is a sensible starting distance for any of them — and `Bounds` then moves
 * the camera along this same line until the model fits the viewport.
 */
const CAMERA_POSITION: [number, number, number] = [1.84, 1.64, -3.15];

function Model({ source }: { source: Group }) {
  // The cache hands every caller the same Group. Clone before mounting so this
  // Canvas can never re-parent the cached original out from under a later
  // viewer; clones share geometries and materials, so it stays cheap even for
  // the 36 MB full model.
  const object = useMemo(() => source.clone(), [source]);
  const bounds = useBounds();

  // Swapping tabs replaces the object inside a Bounds group that never
  // remounts, so the fit has to be re-triggered by hand. Going through the api
  // rather than the `fit` prop is what makes it a glide: Bounds interpolates
  // the camera to the new framing instead of snapping to it.
  useEffect(() => {
    bounds.refresh(object).clip().fit();
  }, [bounds, object]);

  // dispose={null}: geometries and materials belong to the cache and get
  // reused next time the viewer opens, so swapping this out must not release
  // them.
  return <primitive object={object} dispose={null} />;
}

/**
 * The HDRI is a nicety, not a requirement — the directional lights already
 * light the model. Failing to fetch or decode it (iOS is the usual culprit,
 * half-float textures under memory pressure) must not take the viewer down
 * with it, so it gets a boundary of its own.
 */
function SceneEnvironment() {
  return (
    <StageErrorBoundary fallback={null}>
      <Suspense fallback={null}>
        {/* Self-hosted so the viewer never depends on drei's default
            GitHub-hosted preset CDN. */}
        <Environment files="/hdri/studio_small_03_1k.hdr" />
      </Suspense>
    </StageErrorBoundary>
  );
}

// Errors thrown during render (a corrupt HDRI, a bad draw call) can only be
// caught by a class component.
class StageErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function Overlay({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-cream-50">
      {children}
    </div>
  );
}

export function ModelViewerStage({ objFile, mtlFile }: ModelViewerStageProps) {
  const { status, model, reload } = useModel(objFile, mtlFile);
  const [contextLost, setContextLost] = useState(false);
  // Bumping this remounts the <Canvas>, which is the only way to get a fresh
  // WebGL context when the browser never restores the lost one.
  const [canvasAttempt, setCanvasAttempt] = useState(0);

  // Hold on to whatever is already on screen so switching tabs keeps the
  // previous model visible until the next one is ready, instead of blanking
  // the canvas. Setting state straight from render is React's own pattern for
  // deriving state from changing props — it re-renders before painting.
  const [shown, setShown] = useState<Group | null>(null);
  if (model && model !== shown) setShown(model);

  const isLoading = status === "idle" || status === "pending";

  // iOS discards WebGL contexts aggressively when the tab is backgrounded or
  // memory runs short. Calling preventDefault is what makes the loss
  // recoverable at all; without it the context is gone for good and the canvas
  // just sits there blank.
  const handleCreated = useCallback(({ gl }: RootState) => {
    const canvas = gl.domElement;
    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      setContextLost(true);
    });
    canvas.addEventListener("webglcontextrestored", () => {
      setContextLost(false);
    });
  }, []);

  const retryAfterContextLoss = useCallback(() => {
    setContextLost(false);
    setCanvasAttempt((n) => n + 1);
  }, []);

  return (
    <div className="relative h-full w-full">
      {/* Mounted for the whole time the viewer is open. Tab switches swap the
          model inside it, so the WebGL context is created once per visit
          rather than once per model. */}
      <Canvas
        key={canvasAttempt}
        // iPhones report a device pixel ratio of 3; rendering the full model
        // at that resolution is what pushes them into dropping the context.
        dpr={[1, 2]}
        camera={{ position: CAMERA_POSITION, fov: 45, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={handleCreated}
      >
        <ambientLight intensity={1.4} />
        <directionalLight position={[5, 8, 5]} intensity={2.2} />
        <directionalLight position={[-5, 4, -5]} intensity={1} />
        <SceneEnvironment />
        {/* `fit`+`observe` keep the framing right across rotations and
            resizes; the per-model refit is triggered from <Model> itself,
            because swapping the object inside a Bounds that never remounts
            is not something Bounds notices on its own. */}
        <Bounds fit clip observe margin={1.25}>
          {shown && <Model source={shown} />}
        </Bounds>
        <OrbitControls makeDefault minDistance={1.5} maxDistance={12} />
      </Canvas>

      {/* Nothing on screen yet — the visitor needs the full loader. */}
      {isLoading && !shown && (
        <Overlay>
          <Loader label="Das Modell wird geladen …" />
        </Overlay>
      )}

      {/* A model is already up: keep it interactive and just say the next one
          is on its way. */}
      {isLoading && shown && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center">
          <span className="rounded-full bg-anthracite-900/80 px-4 py-1.5 text-xs font-medium text-cream-50 shadow-lg backdrop-blur">
            Wird geladen …
          </span>
        </div>
      )}

      {status === "rejected" && (
        <Overlay>
          <ErrorState
            message="Das 3D-Modell konnte leider nicht geladen werden."
            onRetry={reload}
          />
        </Overlay>
      )}

      {contextLost && (
        <Overlay>
          <ErrorState
            message="Die 3D-Ansicht musste kurz pausieren."
            onRetry={retryAfterContextLoss}
          />
        </Overlay>
      )}
    </div>
  );
}
