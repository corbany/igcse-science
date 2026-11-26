export const MAP_SIZE = 5120;
export const MAP_CENTER = 2560;
export const SPAWN_EDGE_MARGIN = 560;

export interface SpawnCoordinate {
  x: number;
  y: number;
  angle: number;
}

export function hashSpawnSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function createSeededRng(seedStr: string): () => number {
  let a = hashSpawnSeed(seedStr) || 1337;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: T[], seedStr: string): T[] {
  const arr = [...items];
  const rand = createSeededRng(seedStr);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

/**
 * Generates `count` spawn coordinates equally distributed across the full 5120x5120 arena
 * within [560..4560] x [560..4560] (every point is well inside the 3600px opening storm radius).
 * Assigns grid cells balanced across rows & columns, then deterministically shuffles per match seed.
 */
export function computeEqualMapSpawns(
  count: number,
  seedStr: string = 'live'
): SpawnCoordinate[] {
  if (count <= 0) return [];

  if (count === 1) {
    return [{ x: MAP_CENTER, y: MAP_CENTER, angle: 0 }];
  }

  const usableSpan = MAP_SIZE - SPAWN_EDGE_MARGIN * 2; // 4000px: [560 .. 4560]
  const rawSlots: SpawnCoordinate[] = [];

  if (count === 2) {
    const horizontal = hashSpawnSeed(`${seedStr}_axis`) % 2 === 0;
    const pts = horizontal
      ? [
          { x: SPAWN_EDGE_MARGIN + Math.round(usableSpan * 0.25), y: MAP_CENTER },
          { x: SPAWN_EDGE_MARGIN + Math.round(usableSpan * 0.75), y: MAP_CENTER }
        ]
      : [
          { x: MAP_CENTER, y: SPAWN_EDGE_MARGIN + Math.round(usableSpan * 0.25) },
          { x: MAP_CENTER, y: SPAWN_EDGE_MARGIN + Math.round(usableSpan * 0.75) }
        ];
    for (const pt of pts) {
      rawSlots.push({
        x: pt.x,
        y: pt.y,
        angle: Number(Math.atan2(MAP_CENTER - pt.y, MAP_CENTER - pt.x).toFixed(3))
      });
    }
    return seededShuffle(rawSlots, seedStr);
  }

  const rows = Math.max(1, Math.round(Math.sqrt(count)));
  const baseCols = Math.floor(count / rows);
  const extraRows = count % rows;
  const transpose = hashSpawnSeed(`${seedStr}_rot`) % 2 === 1;

  for (let r = 0; r < rows; r++) {
    const rowCols = baseCols + (r < extraRows ? 1 : 0);
    const rowCoord = Math.round(SPAWN_EDGE_MARGIN + ((r + 0.5) / rows) * usableSpan);
    for (let c = 0; c < rowCols; c++) {
      const colCoord = Math.round(SPAWN_EDGE_MARGIN + ((c + 0.5) / rowCols) * usableSpan);
      const x = transpose ? rowCoord : colCoord;
      const y = transpose ? colCoord : rowCoord;
      rawSlots.push({
        x,
        y,
        angle: Number(Math.atan2(MAP_CENTER - y, MAP_CENTER - x).toFixed(3))
      });
    }
  }

  return seededShuffle(rawSlots, seedStr);
}

/**
 * Picks an open equal-area map slot farthest from already-spawned alive players.
 * Used for late joiners or fallback spawns not pre-seeded in the lobby batch.
 */
export function pickFarthestOpenMapSpawn(
  uid: string,
  seedStr?: string | null,
  existingPlayers?: Array<{
    uid?: string;
    x: number;
    y: number;
    isAlive?: boolean;
    isSpectator?: boolean;
  }>
): SpawnCoordinate {
  const resolvedSeed = seedStr || 'live';
  const occupied = (existingPlayers || []).filter(
    (p) =>
      p &&
      p.uid !== uid &&
      !p.isSpectator &&
      p.isAlive !== false &&
      Number.isFinite(p.x) &&
      Number.isFinite(p.y)
  );

  const slotCount = Math.max(9, occupied.length + 2);
  const candidates = computeEqualMapSpawns(slotCount, `${resolvedSeed}_open`);

  if (occupied.length === 0) {
    return candidates[hashSpawnSeed(`${uid}_${resolvedSeed}`) % candidates.length];
  }

  let bestSlot = candidates[0];
  let bestScore = -Infinity;

  for (const slot of candidates) {
    let minDist = Infinity;
    let sumDist = 0;
    for (const p of occupied) {
      const d = Math.hypot(slot.x - p.x, slot.y - p.y);
      if (d < minDist) minDist = d;
      sumDist += d;
    }
    const tieJitter = (hashSpawnSeed(`${uid}_${slot.x}_${slot.y}`) % 100) * 0.01;
    const score = minDist + (sumDist / occupied.length) * 0.05 + tieJitter;
    if (score > bestScore) {
      bestScore = score;
      bestSlot = slot;
    }
  }

  return bestSlot;
}
