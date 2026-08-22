"use client";

import { useLoader } from "@react-three/fiber";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

// Shared by the visible stage and the background preloader so both hit the
// exact same react-three-fiber loader cache entry (keyed by loader + url,
// not by this extend callback).
export function useModelLoader(objFile: string, mtlFile: string) {
  const materials = useLoader(MTLLoader, mtlFile);
  return useLoader(OBJLoader, objFile, (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });
}
