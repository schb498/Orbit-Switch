import type { GameState } from './engine/GameState';

const RING_R = 62;

export const LEVEL_1: GameState = {
  moveCount: 0,
  connections: [
    { a: 0, aPos: 1, b: 1, bPos: 3 },
    { a: 1, aPos: 1, b: 2, bPos: 3 },
  ],
  rings: [
    {
      id: 0, x: 84, y: 148, radius: RING_R,
      rotation: 0,
      slots: ['blue', null, null, null],
      target: null,
      label: 'Ring 0',
      connectedTo: [1],
    },
    {
      id: 1, x: 208, y: 148, radius: RING_R,
      rotation: 0,
      slots: [null, null, null, null],
      target: null,
      label: 'Ring 1',
      connectedTo: [0, 2],
    },
    {
      id: 2, x: 332, y: 148, radius: RING_R,
      rotation: 0,
      slots: [null, null, null, null],
      target: 'blue',
      label: 'Ring 2',
      connectedTo: [1],
    },
  ],
};
