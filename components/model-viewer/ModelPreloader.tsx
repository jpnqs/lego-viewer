"use client";

import { Suspense } from "react";
import { useModelLoader } from "@/components/model-viewer/useModelLoader";

interface ModelPreloaderProps {
  objFile: string;
  mtlFile: string;
}

// Warms react-three-fiber's loader cache while the visitor is still on the
// instructions, so opening the model modal later is instant. Renders nothing.
function PreloadTrigger({ objFile, mtlFile }: ModelPreloaderProps) {
  useModelLoader(objFile, mtlFile);
  return null;
}

export function ModelPreloader(props: ModelPreloaderProps) {
  return (
    <Suspense fallback={null}>
      <PreloadTrigger {...props} />
    </Suspense>
  );
}
