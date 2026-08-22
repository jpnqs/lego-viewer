"use client";

import { Component, Suspense } from "react";
import type { ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, Environment, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Loader } from "@/components/ui/Loader";
import { ErrorState } from "@/components/ui/ErrorState";
import { useModelLoader } from "@/components/model-viewer/useModelLoader";

interface ModelViewerStageProps {
  objFile: string;
  mtlFile: string;
}

function LoadedModel({ objFile, mtlFile }: ModelViewerStageProps) {
  const obj = useModelLoader(objFile, mtlFile);

  // Model coordinates come from a BrickLink Studio export (raw LDU scale),
  // so we let Bounds compute the fit instead of assuming a fixed size.
  return (
    <Bounds fit clip observe margin={1.2}>
      <primitive object={obj} />
    </Bounds>
  );
}

// Loader errors (bad network, corrupt file) throw during render; only a
// class component can catch those via getDerivedStateFromError.
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

export function ModelViewerStage({ objFile, mtlFile }: ModelViewerStageProps) {
  return (
    <ModelErrorBoundary
      fallback={
        <ErrorState
          message="Das 3D-Modell konnte leider nicht geladen werden."
          onRetry={() => window.location.reload()}
        />
      }
    >
      <Suspense fallback={<Loader label="Das Modell wird geladen …" />}>
        {/* Camera direction (not distance) sets the initial viewing angle — Bounds only moves it closer/farther along this line; target is recomputed to the bounding-box center regardless. */}
        <Canvas camera={{ position: [497.18, 444.93, -853.36], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 5]} intensity={1.2} />
          {/* Self-hosted so the viewer never depends on drei's default GitHub-hosted preset CDN. */}
          <Environment files="/hdri/studio_small_03_1k.hdr" />
          <LoadedModel objFile={objFile} mtlFile={mtlFile} />
          <OrbitControls
            makeDefault
            minDistance={1}
            maxDistance={20}
            // TEMP: logs camera position/target on every drag release so a good initial angle can be picked, then removed.
            onEnd={(e) => {
              const controls = e?.target as OrbitControlsImpl | undefined;
              if (!controls) return;
              console.log(
                "camera position:",
                controls.object.position.toArray(),
              );
              console.log("camera target:", controls.target.toArray());
            }}
          />
        </Canvas>
      </Suspense>
    </ModelErrorBoundary>
  );
}
