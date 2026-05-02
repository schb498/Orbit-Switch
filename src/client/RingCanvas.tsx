import { getOrbAt } from '../shared/engine/GameState';
import type { Connection } from '../shared/engine/GameState';
import type { Ring } from '../shared/engine/Ring';
import { RING_R, ORB_R, ANIM_MS, PAL, posAngle, posXY } from './constants';

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

      {/* Bigger centre direction indicator */}
      <circle
        cx={0}
        cy={0}
        r={8}
        fill={ring.direction === 'ccw' ? '#f59e0b' : '#60a5fa'} // orange = CCW, blue = CW
        opacity={0.95}
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

      {/* Arrow now orbits around centre indicator */}
      {(() => {
        const r = 12; // just outside centre circle (radius 8)

        const step = Math.PI / 2;
        const base = -Math.PI / 2;

        const ccw = ring.direction === 'ccw';

        const a0 = base;
        const a1 = ccw ? base - step : base + step;

        const x0 = r * Math.cos(a0);
        const y0 = r * Math.sin(a0);
        const x1 = r * Math.cos(a1);
        const y1 = r * Math.sin(a1);

        const sweep = ccw ? 0 : 1;

        const tx = Math.cos(a1 + (ccw ? -Math.PI / 2 : Math.PI / 2));
        const ty = Math.sin(a1 + (ccw ? -Math.PI / 2 : Math.PI / 2));

        const ah = 5;

        return (
          <g opacity={0.85}>
            <path
              d={`M ${x0} ${y0} A ${r} ${r} 0 0 ${sweep} ${x1} ${y1}`}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <polygon
              points={`${x1 + tx * ah},${y1 + ty * ah} ${x1 - tx * 3 - ty * 3},${y1 - ty * 3 + tx * 3} ${x1 - tx * 3 + ty * 3},${y1 + ty * 3 + tx * 3}`}
              fill="#e5e7eb"
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
