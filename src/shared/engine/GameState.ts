import type { Ring } from './Ring';

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
}

function worldToSlot(wPos: number, rotation: number): number {
  return (((wPos - Math.round(rotation / 90)) % 4) + 4) % 4;
}

function getAtomAt(ring: Ring, wPos: number): string | null {
  return ring.slots[worldToSlot(wPos, ring.rotation)] ?? null;
}

function withAtomAt(ring: Ring, wPos: number, color: string): Ring {
  const slots = [...ring.slots];
  slots[worldToSlot(wPos, ring.rotation)] = color;
  return { ...ring, slots };
}

function clearAtWorld(ring: Ring, wPos: number): Ring {
  const slots = [...ring.slots];
  slots[worldToSlot(wPos, ring.rotation)] = null;
  return { ...ring, slots };
}

// Clicking a ring: collect atoms from neighbour contact points, then rotate 90° CW.
export function clickRing(state: GameState, ringIdx: number): GameState {
  const rings = state.rings.map((r) => ({ ...r, slots: [...r.slots] }));

  for (const conn of state.connections) {
    if (conn.b === ringIdx) {
      const src = rings[conn.a];
      const dst = rings[ringIdx];
      if (!src || !dst) continue;
      const atom = getAtomAt(src, conn.aPos);
      if (atom !== null && getAtomAt(dst, conn.bPos) === null) {
        rings[conn.a] = clearAtWorld(src, conn.aPos);
        rings[ringIdx] = withAtomAt(dst, conn.bPos, atom);
      }
    }
    if (conn.a === ringIdx) {
      const src = rings[conn.b];
      const dst = rings[ringIdx];
      if (!src || !dst) continue;
      const atom = getAtomAt(src, conn.bPos);
      if (atom !== null && getAtomAt(dst, conn.aPos) === null) {
        rings[conn.b] = clearAtWorld(src, conn.bPos);
        rings[ringIdx] = withAtomAt(dst, conn.aPos, atom);
      }
    }
  }

  const ring = rings[ringIdx];
  if (ring) {
    rings[ringIdx] = { ...ring, rotation: ring.rotation + 90 };
  }

  return { ...state, rings, moveCount: state.moveCount + 1 };
}

export function checkWin(state: GameState): boolean {
  return state.rings.every((ring) => {
    if (!ring.target) return true;
    const atoms = ring.slots.filter((s): s is string => s !== null);
    return atoms.length > 0 && atoms.every((a) => a === ring.target);
  });
}
