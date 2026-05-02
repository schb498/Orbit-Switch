import './index.css';

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { clickRing, checkWin, getOrbAt } from '../shared/engine/GameState';
import type { GameState } from '../shared/engine/GameState';
import { LEVELS } from '../shared/levels';
import { ORB_R, VB_W, VB_H, ANIM_MS, PAL, posXY } from './constants';
import { RingView, RingHoverVisuals, RingOrbs, JunctionDot } from './RingCanvas';
import styles from './game.module.css';

export const App = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [game, setGame] = useState<GameState>(LEVELS[0]!);
  const [animating, setAnim] = useState(false);
  const [hoverRing, setHoverRing] = useState<number | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showLevels, setShowLevels] = useState(false);
  const won = checkWin(game);

  const achieved = game.targets.map((t) => {
    const ring = game.rings[t.ringIndex];
    if (!ring) return false;
    const orb = getOrbAt(ring, t.wPos);
    return orb === t.color;
  });

  function handleClick(i: number) {
    if (animating || won) return;
    setAnim(true);
    setGame(clickRing(game, i));
    setTimeout(() => setAnim(false), ANIM_MS);
  }

  function restart() {
    setGame(LEVELS[currentLevel]!);
    setAnim(false);
  }

  function goLevel(idx: number) {
    if (idx < 0 || idx >= LEVELS.length) return;
    setCurrentLevel(idx);
    setGame(LEVELS[idx]!);
    setAnim(false);
  }

  function nextLevel() {
    goLevel(currentLevel + 1);
  }

  return (
    <div className={styles.pageRoot}>
      {/* ── Top bar ── */}
      <div className={styles.topBar}>
        <button
          onClick={() => setShowLevels(true)}
          className={`${styles.iconBtn} ${styles.levelsBtn}`}
        >
          ☰ Levels
        </button>

        <div className={styles.titleCenter}>
          <div className={styles.titleText}>Orbit Switch</div>
          <div className={styles.titleSub}>
            Moves:{' '}
            <strong style={{ color: '#b8d0ee' }}>{game.moveCount}</strong>
            {' · '}
            <span style={{ color: '#4a6890' }}>Level {currentLevel + 1}</span>
          </div>
        </div>

        <div className={styles.btnRow}>
          <button onClick={restart} title="Restart" className={styles.iconBtn}>
            ↺
          </button>
          <button onClick={() => setShowHelp(true)} className={styles.iconBtn}>
            ?
          </button>
        </div>
      </div>

      {/* ── Level select modal ── */}
      {showLevels && (
        <div
          onClick={() => setShowLevels(false)}
          className={styles.modalBackdrop}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${styles.modalBox} ${styles.modalBoxLevels}`}
          >
            <h2 className={styles.modalTitle}>Levels</h2>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '20px',
              }}
            >
              {LEVELS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    goLevel(i);
                    setShowLevels(false);
                  }}
                  style={{
                    background:
                      i === currentLevel
                        ? 'rgba(74,158,255,0.13)'
                        : 'transparent',
                    border: `1px solid ${i === currentLevel ? 'rgba(74,158,255,0.45)' : '#1c2c48'}`,
                    borderRadius: '20px',
                    color: i === currentLevel ? '#4a9eff' : '#8ab0d8',
                    padding: '6px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Level {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowLevels(false)}
              className={styles.modalCloseBtn}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── Help modal ── */}
      {showHelp && (
        <div
          onClick={() => setShowHelp(false)}
          className={styles.modalBackdrop}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${styles.modalBox} ${styles.modalBoxHelp}`}
          >
            <h2 className={styles.modalTitle}>How to Play</h2>
            <ul className={styles.helpList}>
              <li>Click a ring to rotate it to move the orbs.</li>
              <li>
                Orbs can be passed between rings at their connection points.
              </li>
              <li>
                Move all orbs to their target positions to solve the level.
              </li>
            </ul>
            <button
              onClick={() => setShowHelp(false)}
              className={styles.modalCloseBtn}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ── SVG Board ── */}
      <div className={styles.boardWrapper}>
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className={styles.boardSvg}>
          {/* Pass 1: Ring bodies */}
          {game.rings.map((ring, i) => {
            const ringHasTarget =
              won &&
              game.targets.some((t, ti) => t.ringIndex === i && achieved[ti]);
            return (
              <RingView
                key={i}
                ring={ring}
                onClick={() => handleClick(i)}
                interactive={!animating && !won}
                isWin={ringHasTarget}
                onHover={(h) => setHoverRing(h ? i : null)}
              />
            );
          })}

          {/* Pass 2: Empty slot markers */}
          {game.rings.map((ring, i) => (
            <RingOrbs key={i} ring={ring} orbsOnly={false} />
          ))}

          {/* Pass 3: Target position markers */}
          {game.targets.map((t, i) => {
            const ring = game.rings[t.ringIndex];
            if (!ring) return null;
            const pal = PAL[t.color];
            if (!pal) return null;
            const hit = !!achieved[i];
            const { x, y } = posXY(t.wPos);
            return (
              <g key={i} transform={`translate(${ring.x},${ring.y})`}>
                <circle
                  cx={x}
                  cy={y}
                  r={ORB_R}
                  fill="none"
                  stroke={pal.fill}
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  opacity={hit ? 0.4 : 0.9}
                  style={{ transition: 'opacity 0.3s' }}
                />
              </g>
            );
          })}

          {/* Pass 4: Junction indicators — hidden during animation to avoid ghost orbs */}
          {!animating &&
            game.connections.map((conn, ci) => (
              <JunctionDot key={ci} rings={game.rings} conn={conn} />
            ))}

          {/* Pass 5: Hover visuals */}
          {game.rings.map((ring, i) => (
            <RingHoverVisuals
              key={i}
              ring={ring}
              isHovering={hoverRing === i && !animating && !won}
            />
          ))}

          {/* Pass 6: Orbs — top layer */}
          {game.rings.map((ring, i) => (
            <RingOrbs key={i} ring={ring} orbsOnly={true} />
          ))}
        </svg>
      </div>

      {/* ── Win state — fixed at bottom, doesn't shift board ── */}
      {won && (
        <div
          style={{
            position: 'fixed',
            bottom: '28px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            animation: 'winPop 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
            zIndex: 50,
          }}
        >
          <div className={styles.winBadge}>
            ✦ Solved in {game.moveCount}{' '}
            {game.moveCount === 1 ? 'move' : 'moves'}!
          </div>
          {currentLevel + 1 < LEVELS.length && (
            <button onClick={nextLevel} className={styles.nextLevelBtn}>
              Next Level →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
