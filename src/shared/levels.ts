import type { GameState } from './engine/GameState';
import type { WinTarget } from './engine/Ring';

const RING_R = 62;

const CONNECTIONS = [
  { a: 0, aPos: 1, b: 1, bPos: 3 },
  { a: 1, aPos: 1, b: 2, bPos: 3 },
];

// Level 1 — Relay: move blue from Ring 0 to Ring 2 (right slot)
export const LEVEL_1: GameState = {
  moveCount: 0,
  connections: CONNECTIONS,
  rings: [
    {
      id: 0, x: 84, y: 148, radius: RING_R,
      rotation: 0,
      slots: ['blue', null, null, null],
      label: 'Ring 0',
      connectedTo: [1],
    },
    {
      id: 1, x: 208, y: 148, radius: RING_R,
      rotation: 0,
      slots: [null, null, null, null],
      label: 'Ring 1',
      connectedTo: [0, 2],
    },
    {
      id: 2, x: 332, y: 148, radius: RING_R,
      rotation: 0,
      slots: [null, null, null, null],
      label: 'Ring 2',
      connectedTo: [1],
    },
  ],
  targets: [
    { ringIndex: 2, color: 'blue', wPos: 1 }, // blue must be at Ring 2, right slot (world-space)
  ],
};

// Level 2 — The Swap: exchange blue (Ring 0) and orange (Ring 2).
export const LEVEL_2: GameState = {
  moveCount: 0,
  connections: CONNECTIONS,
  rings: [
    {
      id: 0, x: 84, y: 148, radius: RING_R,
      rotation: 0,
      slots: ['blue', null, null, null],
      label: 'Ring 0',
      connectedTo: [1],
    },
    {
      id: 1, x: 208, y: 148, radius: RING_R,
      rotation: 0,
      slots: [null, null, null, null],
      label: 'Ring 1',
      connectedTo: [0, 2],
    },
    {
      id: 2, x: 332, y: 148, radius: RING_R,
      rotation: 0,
      slots: [null, null, 'orange', null],
      label: 'Ring 2',
      connectedTo: [1],
    },
  ],
  targets: [
    { ringIndex: 0, color: 'orange', wPos: 3 }, // orange must end up at Ring 0, left slot
    { ringIndex: 2, color: 'blue', wPos: 1 },   // blue must end up at Ring 2, right slot
  ],
};

export const LEVELS: GameState[] = [LEVEL_1, LEVEL_2];

export const LEVEL_META = [
  { subtitle: 'Relay',    hint: 'Move blue from Ring 0 all the way to Ring 2.' },
  { subtitle: 'The Swap', hint: 'Swap blue (Ring 0) and orange (Ring 2).' },
];
