import type { Ring } from './Ring.js';
import type { Atom } from './Atom.js';
import { checkAlignment } from './alignment.js';

export interface GameState {
  rings: Ring[];
  moveCount: number;
}

export function rotateRing(
  state: GameState,
  ringId: number,
  direction: 'cw' | 'ccw',
  degrees: number = 90,
): GameState {
  const delta = direction === 'cw' ? degrees : -degrees;
  return {
    ...state,
    moveCount: state.moveCount + 1,
    rings: state.rings.map(r =>
      r.id === ringId
        ? { ...r, angle: ((r.angle + delta) % 360 + 360) % 360 }
        : r,
    ),
  };
}

export function canTransfer(
  state: GameState,
  fromRingId: number,
  toRingId: number,
): boolean {
  const from = state.rings.find(r => r.id === fromRingId);
  const to = state.rings.find(r => r.id === toRingId);
  if (!from || !to) return false;
  return from.connectedTo.includes(toRingId) && checkAlignment(from, to);
}

export function transferAtom(
  state: GameState,
  atomId: string,
  fromRingId: number,
  toRingId: number,
): GameState | null {
  if (!canTransfer(state, fromRingId, toRingId)) return null;

  const fromRing = state.rings.find(r => r.id === fromRingId)!;
  const atomIndex = fromRing.slots.findIndex(a => a?.id === atomId);
  if (atomIndex === -1) return null;

  const toRing = state.rings.find(r => r.id === toRingId)!;
  const emptySlot = toRing.slots.findIndex(s => s === null);
  if (emptySlot === -1) return null;

  const atom = fromRing.slots[atomIndex] as Atom;

  return {
    ...state,
    moveCount: state.moveCount + 1,
    rings: state.rings.map(r => {
      if (r.id === fromRingId) {
        const slots = [...r.slots];
        slots[atomIndex] = null;
        return { ...r, slots };
      }
      if (r.id === toRingId) {
        const slots = [...r.slots];
        slots[emptySlot] = atom;
        return { ...r, slots };
      }
      return r;
    }),
  };
}

export function checkWin(state: GameState): boolean {
  return state.rings.every(ring =>
    ring.slots.every(atom => atom === null || atom.targetRingId === ring.id),
  );
}
