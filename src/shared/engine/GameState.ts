import type { Ring } from './Ring';

export interface WinTarget {
  ringIndex: number;
  color: string;
  wPos: number; // 0=top 1=right 2=bottom 3=left (world-space)
}

export interface Connection {
  a: number;    // ring index
  aPos: number; // world-space slot on ring a  (0=top 1=right 2=bottom 3=left)
  b: number;    // ring index
  bPos: number; // world-space slot on ring b
}

export interface GameState {
  rings: Ring[];
  connections: Connection[];
  moveCount: number;
  targets: WinTarget[];
}

export function worldToSlot(wPos: number, rotation: number): number {
  return (((wPos - Math.round(rotation / 90)) % 4) + 4) % 4;
}

export function getOrbAt(ring: Ring, wPos: number): string | null {
  return ring.slots[worldToSlot(wPos, ring.rotation)] ?? null;
}

function withOrbAt(ring: Ring, wPos: number, color: string): Ring {
  const slots = [...ring.slots];
  slots[worldToSlot(wPos, ring.rotation)] = color;
  return { ...ring, slots };
}

function clearAtWorld(ring: Ring, wPos: number): Ring {
  const slots = [...ring.slots];
  slots[worldToSlot(wPos, ring.rotation)] = null;
  return { ...ring, slots };
}

// Clicking a ring: collect orbs from neighbour contact points, then rotate 90° (CW or CCW per ring.direction).
export function clickRing(state: GameState, ringIdx: number): GameState {
  const rings = state.rings.map((r) => ({ ...r, slots: [...r.slots] }));

  for (const conn of state.connections) {
    if (conn.b === ringIdx) {
      const src = rings[conn.a];
      const dst = rings[ringIdx];
      if (!src || !dst) continue;
      const orb = getOrbAt(src, conn.aPos);
      if (orb !== null && getOrbAt(dst, conn.bPos) === null) {
        rings[conn.a] = clearAtWorld(src, conn.aPos);
        rings[ringIdx] = withOrbAt(dst, conn.bPos, orb);
      }
    }
    if (conn.a === ringIdx) {
      const src = rings[conn.b];
      const dst = rings[ringIdx];
      if (!src || !dst) continue;
      const orb = getOrbAt(src, conn.bPos);
      if (orb !== null && getOrbAt(dst, conn.aPos) === null) {
        rings[conn.b] = clearAtWorld(src, conn.bPos);
        rings[ringIdx] = withOrbAt(dst, conn.aPos, orb);
      }
    }
  }

  const ring = rings[ringIdx];
  if (ring) {
    const delta = ring.direction === 'ccw' ? -90 : 90;
    rings[ringIdx] = { ...ring, rotation: ring.rotation + delta };
  }

  return { ...state, rings, moveCount: state.moveCount + 1 };
}

export function checkWin(state: GameState): boolean {
  if (state.targets.length === 0) return false;
  return state.targets.every((t) => {
    const ring = state.rings[t.ringIndex];
    if (!ring) return false;
    return getOrbAt(ring, t.wPos) === t.color;
  });
}
