import { getOrbAt } from '../shared/engine/GameState';
import type { Connection } from '../shared/engine/GameState';
import type { Ring } from '../shared/engine/Ring';

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
function posAngle(p: number): number {
  return ((p * 90 - 90) * Math.PI) / 180;
}
export function posXY(p: number): { x: number; y: number } {
  return {
    x: RING_R * Math.cos(posAngle(p)),
    y: RING_R * Math.sin(posAngle(p)),
  };
}

export interface RingViewProps {
  ring: Ring;
  onClick: () => void;
  interactive: boolean;
  isWin: boolean;
  onHover: (hovering: boolean) => void;
}

export function RingView({
  ring,
  onClick,
  interactive,
  isWin,
  onHover,
}: RingViewProps) {
  return (
    <g
      transform={`translate(${ring.x},${ring.y})`}
      onClick={interactive ? onClick : undefined}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      style={{
        cursor: interactive ? 'pointer' : 'default',
        pointerEvents: 'all',
      }}
    >
      <circle
        r={RING_R}
        fill="#101828"
        stroke={isWin ? '#4aef8a' : '#1c2c48'}
        strokeWidth={isWin ? 3 : 2}
        style={{
          transition: 'stroke 0.25s, stroke-width 0.25s',
          filter: isWin ? 'drop-shadow(0 0 8px rgba(74,239,138,0.5))' : 'none',
        }}
      />
      {[0, 1, 2, 3].map((p) => {
        const a = posAngle(p);
        const r0 = RING_R - 7,
          r1 = RING_R + 1;
        return (
          <line
            key={p}
            x1={r0 * Math.cos(a)}
            y1={r0 * Math.sin(a)}
            x2={r1 * Math.cos(a)}
            y2={r1 * Math.sin(a)}
            stroke="#1c2c48"
            strokeWidth="2"
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
}

export function RingHoverVisuals({
  ring,
  isHovering,
}: {
  ring: Ring;
  isHovering: boolean;
}) {
  if (!isHovering) return null;

  return (
    <g
      transform={`translate(${ring.x},${ring.y})`}
      style={{ pointerEvents: 'none' }}
    >
      <circle
        r={RING_R + 6}
        fill="none"
        stroke="#3a5490"
        strokeWidth="1.5"
        opacity={0.6}
      />
      {(() => {
        const r = RING_R + 16;
        const a0 = -0.5,
          a1 = 1.1;
        const ccw = ring.direction === 'ccw';
        const x0 = r * Math.cos(ccw ? a1 : a0),
          y0 = r * Math.sin(ccw ? a1 : a0);
        const x1 = r * Math.cos(ccw ? a0 : a1),
          y1 = r * Math.sin(ccw ? a0 : a1);
        const sweep = ccw ? 0 : 1;
        const tx = ccw ? Math.sin(a0) : -Math.sin(a1);
        const ty = ccw ? -Math.cos(a0) : Math.cos(a1);
        const ah = 6;
        return (
          <g opacity={0.55}>
            <path
              d={`M ${x0} ${y0} A ${r} ${r} 0 0 ${sweep} ${x1} ${y1}`}
              fill="none"
              stroke="#6a8acc"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <polygon
              points={`${x1 + tx * ah},${y1 + ty * ah} ${x1 - tx * 3 - ty * 3},${y1 - ty * 3 + tx * 3} ${x1 - tx * 3 + ty * 3},${y1 + ty * 3 + tx * 3}`}
              fill="#6a8acc"
            />
          </g>
        );
      })()}
    </g>
  );
}

/* orbsOnly=false → empty slot markers only
   orbsOnly=true  → filled orbs only        */
export function RingOrbs({
  ring,
  orbsOnly,
}: {
  ring: Ring;
  orbsOnly: boolean;
}) {
  return (
    <g
      transform={`translate(${ring.x},${ring.y})`}
      style={{ pointerEvents: 'none' }}
    >
      <g
        style={{
          transform: `rotate(${ring.rotation}deg)`,
          transformOrigin: '0px 0px',
          transition: `transform ${ANIM_MS / 1000}s cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
      >
        {[0, 1, 2, 3].map((si) => {
          const { x, y } = posXY(si);
          const color = ring.slots[si];
          if (orbsOnly) {
            if (!color) return null;
            const p = PAL[color];
            if (!p) return null;
            return (
              <g key={si}>
                <circle cx={x} cy={y} r={ORB_R + 7} fill={p.glow} />
                <circle
                  cx={x}
                  cy={y}
                  r={ORB_R}
                  fill={p.fill}
                  style={{ filter: `drop-shadow(0 0 5px ${p.fill})` }}
                />
              </g>
            );
          }
          if (color) return null;
          return (
            <circle
              key={si}
              cx={x}
              cy={y}
              r={4}
              fill="#0e1628"
              stroke="#2a3960"
              strokeWidth="1.5"
            />
          );
        })}
      </g>
    </g>
  );
}

export interface JunctionDotProps {
  rings: Ring[];
  conn: Connection;
}

export function JunctionDot({ rings, conn }: JunctionDotProps) {
  const ringA = rings[conn.a];
  const ringB = rings[conn.b];
  if (!ringA || !ringB) return null;

  const angle = posAngle(conn.aPos);
  const cx = ringA.x + RING_R * Math.cos(angle);
  const cy = ringA.y + RING_R * Math.sin(angle);

  const orb = getOrbAt(ringA, conn.aPos) ?? getOrbAt(ringB, conn.bPos);
  if (!orb) return null;

  const p = PAL[orb];
  if (!p) return null;

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={12}
        fill={p.glow}
        style={{ animation: 'junctionPulse 1.1s ease infinite' }}
      />
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={p.fill}
        opacity={0.9}
        style={{ filter: `drop-shadow(0 0 4px ${p.fill})` }}
      />
    </g>
  );
}
