export const RING_R = 62;
export const ORB_R = 10;
export const VB_W = 416;
export const VB_H = 270;
export const ANIM_MS = 380;

export const PAL: Record<string, { fill: string; glow: string }> = {
  blue: { fill: '#4a9eff', glow: 'rgba(74,158,255,0.38)' },
  orange: { fill: '#ff8c42', glow: 'rgba(255,140,66,0.38)' },
};

/* pos: 0=top  1=right  2=bottom  3=left  (world space) */
export function posAngle(p: number): number {
  return ((p * 90 - 90) * Math.PI) / 180;
}

export function posXY(p: number): { x: number; y: number } {
  return {
    x: RING_R * Math.cos(posAngle(p)),
    y: RING_R * Math.sin(posAngle(p)),
  };
}
