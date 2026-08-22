"use client";

import { Component, Suspense } from "react";
import type { ReactNode } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { Bounds, Environment, OrbitControls } from "@react-three/drei";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { Loader } from "@/components/ui/Loader";
import { ErrorState } from "@/components/ui/ErrorState";

interface ModelViewerStageProps {
  objFile: string;
  mtlFile: string;
}

function LoadedModel({ objFile, mtlFile }: ModelViewerStageProps) {
  const materials = useLoader(MTLLoader, mtlFile);
  const obj = useLoader(OBJLoader, objFile, (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });

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
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 5]} intensity={1.2} />
          <Environment preset="studio" />
          <LoadedModel objFile={objFile} mtlFile={mtlFile} />
          <OrbitControls
            makeDefault
            enablePan={false}
            minDistance={1}
            maxDistance={20}
          />
        </Canvas>
      </Suspense>
    </ModelErrorBoundary>
  );
}
