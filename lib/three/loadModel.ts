import { Box3, Group, Mesh, Vector3 } from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

/**
 * Every loaded model is rescaled so its longest axis is this many world units.
 * The OBJ files are raw BrickLink Studio exports in LDU, where the full model
 * spans hundreds of units and a small sub-model only a handful. Normalising on
 * load means the camera, the near/far planes and the OrbitControls distance
 * limits are one fixed set of numbers that fit every model.
 */
const TARGET_SIZE = 2;

interface ModelRecord {
  status: "pending" | "resolved" | "rejected";
  promise: Promise<void>;
  model?: Group;
  error?: Error;
  /** Notified once when the load settles, so React can re-read the snapshot. */
  listeners: Set<() => void>;
}

/** What a caller sees when it reads the cache. "idle" = not requested yet. */
export interface ModelSnapshot {
  status: "idle" | "pending" | "resolved" | "rejected";
  model?: Group;
  error?: Error;
}

const records = new Map<string, ModelRecord>();

function cacheKey(objFile: string, mtlFile: string): string {
  return `${objFile}\u0000${mtlFile}`;
}

/**
 * Loads one model with loader instances that belong to this call alone.
 *
 * This is the whole point of the module. `useLoader` from react-three-fiber
 * memoises a single loader instance per loader class and shares it across
 * every url, while `OBJLoader.setMaterials()` stores the material set *on that
 * instance*. Two models loading at once therefore race: the second call
 * overwrites the materials before the first one's download has finished
 * parsing, and `MaterialCreator.create()` silently returns a default white
 * MeshPhongMaterial for every name it does not recognise. That is exactly how
 * a second model ends up rendering all-white — reliably on iOS, where the
 * request ordering makes the race land.
 */
async function loadNormalized(objFile: string, mtlFile: string): Promise<Group> {
  const materials = await new MTLLoader().loadAsync(mtlFile);
  materials.preload();

  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  const model = await objLoader.loadAsync(objFile);

  model.traverse((child) => {
    const mesh = child as Mesh;
    if (!mesh.isMesh) return;
    // Studio exports carry normals, but a hand-written OBJ may not, and a
    // mesh without them shades as a flat silhouette.
    if (!mesh.geometry.getAttribute("normal")) {
      mesh.geometry.computeVertexNormals();
    }
    mesh.geometry.computeBoundingSphere();
  });

  return normalize(model);
}

/** Centres the model on the origin and scales it into a TARGET_SIZE box. */
function normalize(model: Group): Group {
  const box = new Box3().setFromObject(model);
  if (box.isEmpty()) return model;

  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  const longestAxis = Math.max(size.x, size.y, size.z);

  // Wrapping instead of mutating the model's own transform keeps the two
  // steps independent: the inner group carries the centring offset, the
  // wrapper the uniform scale.
  model.position.sub(center);
  const wrapper = new Group();
  wrapper.name = `${model.name || "model"}-normalized`;
  wrapper.add(model);
  if (longestAxis > 0) wrapper.scale.setScalar(TARGET_SIZE / longestAxis);

  return wrapper;
}

function getRecord(objFile: string, mtlFile: string): ModelRecord {
  const key = cacheKey(objFile, mtlFile);
  const existing = records.get(key);
  if (existing) return existing;

  const settle = () => {
    for (const listener of record.listeners) listener();
    record.listeners.clear();
  };

  const record: ModelRecord = {
    status: "pending",
    listeners: new Set(),
    // Settling both outcomes into the record means this promise itself never
    // rejects, so a background preload can never raise an unhandled rejection.
    promise: loadNormalized(objFile, mtlFile).then(
      (model) => {
        record.status = "resolved";
        record.model = model;
        settle();
      },
      (cause: unknown) => {
        record.status = "rejected";
        record.error = cause instanceof Error ? cause : new Error(String(cause));
        settle();
      },
    ),
  };

  records.set(key, record);
  return record;
}

/**
 * Reads the cache without starting anything, so it is safe to call during
 * render. Nothing here suspends: the viewer keeps one <Canvas> alive for its
 * whole lifetime and swaps models inside it, and suspending would tear that
 * Canvas — and its WebGL context — down on every tab switch.
 */
export function peekModel(objFile: string, mtlFile: string): ModelSnapshot {
  const record = records.get(cacheKey(objFile, mtlFile));
  if (!record) return { status: "idle" };
  return { status: record.status, model: record.model, error: record.error };
}

/**
 * Starts the load if it has not begun, and calls `listener` once it settles.
 * Returns an unsubscribe.
 */
export function watchModel(
  objFile: string,
  mtlFile: string,
  listener: () => void,
): () => void {
  const record = getRecord(objFile, mtlFile);
  if (record.status !== "pending") return () => {};

  record.listeners.add(listener);
  return () => record.listeners.delete(listener);
}

/** Starts a load in the background without suspending or throwing. */
export function preloadModel(objFile: string, mtlFile: string): void {
  getRecord(objFile, mtlFile);
}

/** Drops a cached entry so the next read starts a fresh load. */
export function clearModel(objFile: string, mtlFile: string): void {
  records.delete(cacheKey(objFile, mtlFile));
}
