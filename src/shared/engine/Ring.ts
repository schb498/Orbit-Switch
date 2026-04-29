import type { Atom } from './Atom.js';

export interface Ring {
  id: number;
  x: number;
  y: number;
  radius: number;
  angle: number;          // 0–359 degrees
  slots: (Atom | null)[];
  connectedTo: number[];  // IDs of rings atoms can transfer to/from
}
