"use client";

import { useEffect } from "react";
import { preloadModel } from "@/lib/three/loadModel";

interface ModelPreloaderProps {
  objFile: string;
  mtlFile: string;
}

/**
 * Warms the model cache while the visitor is still on the instructions, so
 * opening the viewer later doesn't wait on the fetch and parse. Renders
 * nothing, never suspends and never throws — a background warm-up must not be
 * able to stall or break the page around it, and a failure here just means the
 * viewer loads the model itself when it opens.
 */
export function ModelPreloader({ objFile, mtlFile }: ModelPreloaderProps) {
  useEffect(() => {
    preloadModel(objFile, mtlFile);
  }, [objFile, mtlFile]);

  return null;
}
