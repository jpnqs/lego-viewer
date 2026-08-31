"use client";

import { Component, Suspense, useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import type { RootState } from "@react-three/fiber";
import { Bounds, Environment, OrbitControls } from "@react-three/drei";
import { Loader } from "@/components/ui/Loader";
import { ErrorState } from "@/components/ui/ErrorState";
import { clearModel, readModel } from "@/lib/three/loadModel";

interface ModelSource {
  objFile: string;
  mtlFile: string;
}

/**
 * Viewing angle only. Models are normalised to a 2-unit box on load, so this
 * is a sensible starting distance for any of them — and `Bounds` then moves
 * the camera along this same line until the model fits the viewport.
 */
const CAMERA_POSITION: [number, number, number] = [1.84, 1.64, -3.15];

function Model({ objFile, mtlFile }: ModelSource) {
  const source = readModel(objFile, mtlFile);

  // The cache hands every caller the same Group. Clone before mounting so this
  // Canvas can never re-parent the cached original out from under a later
  // viewer; clones share geometries and materials, so it stays cheap even for
  // the 36 MB full model.
  const object = useMemo(() => source.clone(), [source]);

  return (
    <Bounds fit clip observe margin={1.25}>
      {/* dispose={null}: geometries and materials belong to the cache and get
          reused next time the viewer opens, so closing this Canvas must not
          release them. */}
      <primitive object={object} dispose={null} />
    </Bounds>
  );
}

/**
 * The HDRI is a nicety, not a requirement — the directional lights already
 * light the model. Failing to fetch or decode it (iOS is the usual culprit,
 * half-float textures under memory pressure) must not take the viewer down
 * with it, so it gets a boundary of its own.
 */
function SceneEnvironment() {
  return (
    <ModelErrorBoundary fallback={null}>
      <Suspense fallback={null}>
        {/* Self-hosted so the viewer never depends on drei's default
            GitHub-hosted preset CDN. */}
        <Environment files="/hdri/studio_small_03_1k.hdr" />
      </Suspense>
    </ModelErrorBoundary>
  );
}

// Loader errors (bad network, corrupt file) throw during render; only a class
// component can catch those via getDerivedStateFromError.
class ModelErrorBoundary extends Component<
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

export function ModelViewerStage({ objFile, mtlFile }: ModelSource) {
  // Bumped by a retry. It keys the whole subtree, so a retry gets a fresh
  // error boundary and a fresh WebGL context rather than re-showing the
  // failure the previous attempt already latched.
  const [attempt, setAttempt] = useState(0);
  const [contextLost, setContextLost] = useState(false);

  const retry = useCallback(() => {
    clearModel(objFile, mtlFile);
    setContextLost(false);
    setAttempt((n) => n + 1);
  }, [objFile, mtlFile]);

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

  if (contextLost) {
    return (
      <ErrorState
        message="Die 3D-Ansicht musste kurz pausieren. Bitte erneut öffnen."
        onRetry={retry}
      />
    );
  }

  return (
    <ModelErrorBoundary
      key={attempt}
      fallback={
        <ErrorState
          message="Das 3D-Modell konnte leider nicht geladen werden."
          onRetry={retry}
        />
      }
    >
      <Suspense fallback={<Loader label="Das Modell wird geladen …" />}>
        <Canvas
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
          <Model objFile={objFile} mtlFile={mtlFile} />
          <OrbitControls makeDefault minDistance={1.5} maxDistance={12} />
        </Canvas>
      </Suspense>
    </ModelErrorBoundary>
  );
}
