"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import {
  clearModel,
  peekModel,
  watchModel,
  type ModelSnapshot,
} from "@/lib/three/loadModel";

export interface UseModelResult extends ModelSnapshot {
  /** Throws the cached entry away and starts the load again. */
  reload: () => void;
}

/**
 * Subscribes to one model in the cache. Unlike a Suspense read this never
 * throws, so the component tree — and the WebGL context it owns — stays
 * mounted while a different model loads.
 */
export function useModel(objFile: string, mtlFile: string): UseModelResult {
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Reading during render must stay side-effect free, so the load is kicked
    // off here. `attempt` is a dependency so a reload re-runs this.
    return watchModel(objFile, mtlFile, rerender);
  }, [objFile, mtlFile, attempt]);

  const reload = useCallback(() => {
    clearModel(objFile, mtlFile);
    setAttempt((n) => n + 1);
  }, [objFile, mtlFile]);

  return { ...peekModel(objFile, mtlFile), reload };
}
