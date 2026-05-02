import type { GameState } from './engine/GameState';

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
      id: 0,
      x: 84,
      y: 148,
      radius: RING_R,
      rotation: 0,
      slots: ['blue', null, null, null],
      label: 'Ring 0',
      connectedTo: [1],
    },
    {
      id: 1,
      x: 208,
      y: 148,
      radius: RING_R,
      rotation: 0,
      slots: [null, null, null, null],
      label: 'Ring 1',
      connectedTo: [0, 2],
    },
    {
      id: 2,
      x: 332,
      y: 148,
      radius: RING_R,
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
      id: 0,
      x: 84,
      y: 148,
      radius: RING_R,
      rotation: 0,
      slots: ['blue', null, null, null],
      label: 'Ring 0',
      connectedTo: [1],
    },
    {
      id: 1,
      x: 208,
      y: 148,
      radius: RING_R,
      rotation: 0,
      slots: [null, null, null, null],
      label: 'Ring 1',
      connectedTo: [0, 2],
    },
    {
      id: 2,
      x: 332,
      y: 148,
      radius: RING_R,
      rotation: 0,
      slots: [null, null, 'orange', null],
      label: 'Ring 2',
      connectedTo: [1],
    },
  ],
  targets: [
    { ringIndex: 0, color: 'orange', wPos: 3 }, // orange must end up at Ring 0, left slot
    { ringIndex: 2, color: 'blue', wPos: 1 }, // blue must end up at Ring 2, right slot
  ],
};

// Level 3 — Square Swap: route both orbs around a 2x2 grid
export const LEVEL_3: GameState = {
  moveCount: 0,
  connections: [
    { a: 0, aPos: 1, b: 1, bPos: 3 },
    { a: 0, aPos: 2, b: 2, bPos: 0 },
    { a: 1, aPos: 2, b: 3, bPos: 0 },
    { a: 2, aPos: 1, b: 3, bPos: 3 },
  ],
  rings: [
    {
      id: 0,
      x: 146,
      y: 73,
      radius: 62,
      rotation: 0,
      slots: [null, 'blue', null, null],
      label: 'Ring 0',
      connectedTo: [1, 2],
    },
    {
      id: 1,
      x: 270,
      y: 73,
      radius: 62,
      rotation: 0,
      slots: [null, null, null, null],
      label: 'Ring 1',
      connectedTo: [0, 3],
    },
    {
      id: 2,
      x: 146,
      y: 197,
      radius: 62,
      rotation: 0,
      slots: [null, null, null, null],
      label: 'Ring 2',
      connectedTo: [0, 3],
    },
    {
      id: 3,
      x: 270,
      y: 197,
      radius: 62,
      rotation: 0,
      slots: [null, null, null, 'orange'],
      label: 'Ring 3',
      connectedTo: [1, 2],
    },
  ],
  targets: [
    { ringIndex: 0, color: 'orange', wPos: 3 },
    { ringIndex: 3, color: 'blue', wPos: 1 },
  ],
};

export const LEVEL_4: GameState = {
  moveCount: 0,
  connections: [
    { a: 0, aPos: 2, b: 2, bPos: 0 },
    { a: 1, aPos: 1, b: 2, bPos: 3 },
    { a: 2, aPos: 1, b: 3, bPos: 3 },
  ],
  rings: [
    {
      id: 0,
      x: 208,
      y: 73,
      radius: 62,
      rotation: 0,
      slots: ['orange', null, null, null],
      label: 'Ring 0',
      connectedTo: [2],
    },
    {
      id: 1,
      x: 84,
      y: 197,
      radius: 62,
      rotation: 0,
      slots: ['blue', null, null, null],
      label: 'Ring 1',
      connectedTo: [2],
    },
    {
      id: 2,
      x: 208,
      y: 197,
      radius: 62,
      rotation: 0,
      slots: [null, null, null, null],
      label: 'Ring 2',
      connectedTo: [0, 1, 3],
    },
    {
      id: 3,
      x: 332,
      y: 197,
      radius: 62,
      rotation: 0,
      slots: [null, null, 'blue', null],
      label: 'Ring 3',
      connectedTo: [2],
    },
  ],
  targets: [
    { ringIndex: 2, color: 'orange', wPos: 2 },
    { ringIndex: 0, color: 'blue', wPos: 1 },
    { ringIndex: 0, color: 'blue', wPos: 3 },
  ],
};

export const LEVELS: GameState[] = [LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4];
