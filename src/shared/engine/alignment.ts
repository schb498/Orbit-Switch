import type { Ring } from './Ring.js';

const TRANSFER_POINTS = [0, 90, 180, 270];
const THRESHOLD = 5;

export function checkAlignment(ringA: Ring, ringB: Ring): boolean {
  const diff = Math.abs(ringA.angle - ringB.angle) % 360;
  return TRANSFER_POINTS.some(tp => Math.abs(diff - tp) < THRESHOLD);
}
