import './index.css';

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { clickRing, checkWin } from '../shared/engine/GameState';
import type { GameState, Connection } from '../shared/engine/GameState';
import type { Ring } from '../shared/engine/Ring';
import { LEVEL_1 } from '../shared/levels';

/* ── Constants (match design dimensions) ── */
const RING_R = 62;
const ATOM_R = 10;
const VB_W   = 416;
const VB_H   = 270;

const PAL: Record<string, { fill: string; glow: string }> = {
  blue:   { fill: '#4a9eff', glow: 'rgba(74,158,255,0.38)' },
  orange: { fill: '#ff8c42', glow: 'rgba(255,140,66,0.38)'  },
};

/* ── Geometry ──
   pos: 0=top  1=right  2=bottom  3=left  (world space)
   slot: local index 0–3 on the ring (rotates with ring)      */
function posAngle(p: number): number { return (p * 90 - 90) * Math.PI / 180; }
function posXY(p: number): { x: number; y: number } {
  return { x: RING_R * Math.cos(posAngle(p)), y: RING_R * Math.sin(posAngle(p)) };
}

function worldToSlot(wPos: number, rotation: number): number {
  return (((wPos - Math.round(rotation / 90)) % 4) + 4) % 4;
}

function getAtomAt(ring: Ring, wPos: number): string | null {
  return ring.slots[worldToSlot(wPos, ring.rotation)] ?? null;
}

/* ── RingView ── */
interface RingViewProps {
  ring: Ring;
  onClick: () => void;
  interactive: boolean;
  isWin: boolean;
}

function RingView({ ring, onClick, interactive, isWin }: RingViewProps) {
  const [hov, setHov] = useState(false);

  return (
    <g
      transform={`translate(${ring.x},${ring.y})`}
      onClick={interactive ? onClick : undefined}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ cursor: interactive ? 'pointer' : 'default' }}
    >
      {hov && interactive && (
        <circle r={RING_R + 6} fill="none" stroke="#3a5490" strokeWidth="1.5" opacity={0.6} />
      )}

      <circle r={RING_R}
        fill="#101828"
        stroke={isWin ? '#4aef8a' : hov && interactive ? '#304870' : '#1c2c48'}
        strokeWidth={isWin ? 3 : 2}
        style={{
          transition: 'stroke 0.25s, stroke-width 0.25s',
          filter: isWin ? 'drop-shadow(0 0 8px rgba(74,239,138,0.5))' : 'none',
        }}
      />

      {/* Slot notch marks on ring edge */}
      {[0, 1, 2, 3].map((p) => {
        const a = posAngle(p);
        const r0 = RING_R - 7, r1 = RING_R + 1;
        return (
          <line key={p}
            x1={r0 * Math.cos(a)} y1={r0 * Math.sin(a)}
            x2={r1 * Math.cos(a)} y2={r1 * Math.sin(a)}
            stroke="#1c2c48" strokeWidth="2" strokeLinecap="round"
          />
        );
      })}

      {/* CW arrow on hover */}
      {hov && interactive && (() => {
        const r = RING_R + 16;
        const a0 = -0.5, a1 = 1.1;
        const x0 = r * Math.cos(a0), y0 = r * Math.sin(a0);
        const x1 = r * Math.cos(a1), y1 = r * Math.sin(a1);
        const tx = -Math.sin(a1), ty = Math.cos(a1);
        const ah = 6;
        return (
          <g opacity={0.55}>
            <path d={`M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`}
              fill="none" stroke="#6a8acc" strokeWidth="1.5" strokeLinecap="round" />
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

/* ── RingAtoms — painted in two separate passes to guarantee z-order:
     atomsOnly=false → empty slot markers only
     atomsOnly=true  → filled atoms only                              ── */
function RingAtoms({ ring, atomsOnly }: { ring: Ring; atomsOnly: boolean }) {
  return (
    <g transform={`translate(${ring.x},${ring.y})`} style={{ pointerEvents: 'none' }}>
      <g style={{
        transform: `rotate(${ring.rotation}deg)`,
        transformOrigin: '0px 0px',
        transition: 'transform 0.38s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {[0, 1, 2, 3].map((si) => {
          const { x, y } = posXY(si);
          const color = ring.slots[si];
          if (atomsOnly) {
            if (!color) return null;
            const p = PAL[color];
            if (!p) return null;
            return (
              <g key={si}>
                <circle cx={x} cy={y} r={ATOM_R + 7} fill={p.glow} />
                <circle cx={x} cy={y} r={ATOM_R} fill={p.fill}
                  style={{ filter: `drop-shadow(0 0 5px ${p.fill})` }} />
              </g>
            );
          }
          if (color) return null;
          return (
            <circle key={si} cx={x} cy={y} r={4}
              fill="#0e1628" stroke="#2a3960" strokeWidth="1.5" />
          );
        })}
      </g>
    </g>
  );
}

/* ── JunctionDot ── glows when an atom sits at the contact point */
interface JunctionDotProps {
  rings: Ring[];
  conn: Connection;
}

function JunctionDot({ rings, conn }: JunctionDotProps) {
  const ringA = rings[conn.a];
  const ringB = rings[conn.b];
  if (!ringA || !ringB) return null;

  // Contact point: right edge of ring A (aPos=1)
  const cx = ringA.x + RING_R;
  const cy = ringA.y;

  const atom = getAtomAt(ringA, conn.aPos) ?? getAtomAt(ringB, conn.bPos);

  if (!atom) return null;

  const p = PAL[atom];
  if (!p) return null;

  return (
    <g>
      <circle cx={cx} cy={cy} r={12} fill={p.glow}
        style={{ animation: 'junctionPulse 1.1s ease infinite' }} />
      <circle cx={cx} cy={cy} r={6} fill={p.fill} opacity={0.9}
        style={{ filter: `drop-shadow(0 0 4px ${p.fill})` }} />
    </g>
  );
}

/* ── App ── */
export const App = () => {
  const [game, setGame]       = useState<GameState>(LEVEL_1);
  const [animating, setAnim]  = useState(false);
  const won = checkWin(game);

  const achieved = game.rings.map((ring) => {
    if (!ring.target) return false;
    const atoms = ring.slots.filter((s): s is string => s !== null);
    return atoms.length > 0 && atoms.every((a) => a === ring.target);
  });

  function handleClick(i: number) {
    if (animating || won) return;
    setAnim(true);
    setGame(clickRing(game, i));
    setTimeout(() => setAnim(false), 400);
  }

  function restart() {
    setGame(LEVEL_1);
    setAnim(false);
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '22px 16px 28px', userSelect: 'none',
      minHeight: '100dvh', justifyContent: 'center',
    }}>
      <h1 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.5px', color: '#dce8ff', marginBottom: '10px' }}>
        Orbit Switch
      </h1>

      {/* Level tab */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
        <button style={{
          background: 'rgba(74,158,255,0.13)',
          border: '1px solid rgba(74,158,255,0.45)',
          borderRadius: '20px', color: '#4a9eff',
          padding: '4px 14px', fontSize: '12px', fontWeight: 600,
          cursor: 'default', fontFamily: 'inherit',
        }}>Level 1</button>
      </div>

      {/* Subtitle + moves */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', marginBottom: '10px' }}>
        <span style={{ color: '#6a8fba' }}>Relay</span>
        <span style={{ color: '#304870' }}>·</span>
        <span style={{ color: '#7090b8' }}>
          Moves: <strong style={{ color: '#b8d0ee' }}>{game.moveCount}</strong>
        </span>
      </div>

      {/* Win banner */}
      {won && (
        <div style={{
          background: 'rgba(74,239,138,0.07)',
          border: '1px solid rgba(74,239,138,0.28)',
          borderRadius: '10px', padding: '7px 22px',
          color: '#4aef8a', fontSize: '13px', fontWeight: 600,
          marginBottom: '10px',
          animation: 'winPop 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>
          ✦ Solved in {game.moveCount} {game.moveCount === 1 ? 'move' : 'moves'}!
        </div>
      )}

      {/* SVG Board */}
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`}
        style={{ width: '100%', maxWidth: '416px', overflow: 'visible' }}>

        {/* Target dots above each ring */}
        {game.rings.map((ring, i) => {
          if (!ring.target) return null;
          const pal = PAL[ring.target];
          if (!pal) return null;
          const hit = !!achieved[i];
          return (
            <g key={i}>
              <circle cx={ring.x} cy={ring.y - RING_R - 20} r={8}
                fill={hit ? pal.glow : 'rgba(255,255,255,0.04)'}
                stroke={hit ? pal.fill : '#1c2c48'}
                strokeWidth="1.5"
                style={{ transition: 'all 0.3s' }} />
              <circle cx={ring.x} cy={ring.y - RING_R - 20} r={4.5}
                fill={pal.fill} opacity={hit ? 1 : 0.38}
                style={{ transition: 'opacity 0.3s' }} />
            </g>
          );
        })}

        {/* Ring labels */}
        {game.rings.map((ring, i) => (
          <text key={i} x={ring.x} y={ring.y + RING_R + 17}
            textAnchor="middle" fill="#4a6890" fontSize="12"
            fontFamily="inherit">{ring.label}</text>
        ))}

        {/* Junction indicators */}
        {game.connections.map((conn, ci) => (
          <JunctionDot key={ci} rings={game.rings} conn={conn} />
        ))}

        {/* Rings */}
        {game.rings.map((ring, i) => (
          <RingView key={i}
            ring={ring}
            onClick={() => handleClick(i)}
            interactive={!animating && !won}
            isWin={won && !!achieved[i]}
          />
        ))}

        {/* Empty slot markers — second pass, below atoms */}
        {game.rings.map((ring, i) => (
          <RingAtoms key={i} ring={ring} atomsOnly={false} />
        ))}

        {/* Atoms — third pass, always on top of all markers and ring bodies */}
        {game.rings.map((ring, i) => (
          <RingAtoms key={i} ring={ring} atomsOnly={true} />
        ))}
      </svg>

      {/* Hint */}
      {!won && (
        <p style={{
          color: '#4a6890', fontSize: '12px', textAlign: 'center',
          maxWidth: '280px', lineHeight: 1.65, marginTop: '6px',
        }}>
          Move blue from Ring 0 all the way to Ring 2.<br />
          Click a ring — it collects atoms from neighbours, then rotates 90° CW.
        </p>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        <button onClick={restart} style={{
          background: 'transparent', border: '1px solid #1c2c48',
          borderRadius: '8px', color: '#304060', padding: '9px 22px',
          fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
          cursor: 'pointer', transition: 'all 0.15s',
        }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#304870'; (e.currentTarget as HTMLButtonElement).style.color = '#6a90c0'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#1c2c48'; (e.currentTarget as HTMLButtonElement).style.color = '#304060'; }}
        >Restart</button>
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
