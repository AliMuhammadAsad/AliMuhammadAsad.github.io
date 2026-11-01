'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type GridType = '4x4' | '4x6' | '8x8';

interface FrozenLakeProps {
  onClose?: () => void;
}

const GRIDS: Record<GridType, string[]> = {
  '4x4': ['SHFF', 'FFFH', 'FHFH', 'HFFG'],
  '4x6': ['SFFFFF', 'FFFHFF', 'FHFHHH', 'HFFFFG'],
  '8x8': [
    'SFFHFFHH',
    'HFFFFFHF',
    'HFFHHFHH',
    'HFHHHFFF',
    'HFHHFHFF',
    'FFFFFFFH',
    'FHHFHFHH',
    'FHHFHFFG',
  ],
};

const ACTION_ARROWS = ['←', '↓', '→', '↑']; // 0: Left, 1: Down, 2: Right, 3: Up
const ACTION_NAMES = ['LEFT', 'DOWN', 'RIGHT', 'UP'];

export default function FrozenLakeRLMiniPlayer({ onClose }: FrozenLakeProps) {
  const [selectedGridType, setSelectedGridType] = useState<GridType>('4x6');
  const [gamma, setGamma] = useState<number>(0.95);
  const [isSlippery, setIsSlippery] = useState<boolean>(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(300); // ms per step

  // Agent State
  const [agentPos, setAgentPos] = useState<number>(0);
  const [episodesRun, setEpisodesRun] = useState<number>(0);
  const [successCount, setSuccessCount] = useState<number>(0);
  const [episodeSteps, setEpisodeSteps] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  // Value Iteration Results
  const [vValues, setVValues] = useState<number[]>([]);
  const [policy, setPolicy] = useState<number[]>([]);

  const grid = GRIDS[selectedGridType];
  const numRows = grid.length;
  const numCols = grid[0].length;
  const numStates = numRows * numCols;

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper: Get row & col from state
  const toCoord = (s: number) => ({
    r: Math.floor(s / numCols),
    c: s % numCols,
  });

  const toState = (r: number, c: number) => r * numCols + c;

  // Compute transition probabilities P(s' | s, a) and rewards
  const getTransitions = useCallback(
    (s: number, a: number): { prob: number; nextState: number; reward: number; done: boolean }[] => {
      const { r, c } = toCoord(s);
      const cell = grid[r][c];

      if (cell === 'H' || cell === 'G') {
        return [{ prob: 1.0, nextState: s, reward: 0, done: true }];
      }

      const actions = isSlippery ? [(a - 1 + 4) % 4, a, (a + 1) % 4] : [a];
      const prob = isSlippery ? 1.0 / 3.0 : 1.0;

      const results: { prob: number; nextState: number; reward: number; done: boolean }[] = [];

      actions.forEach((act) => {
        let nr = r;
        let nc = c;
        if (act === 0) nc = Math.max(0, c - 1); // Left
        else if (act === 1) nr = Math.min(numRows - 1, r + 1); // Down
        else if (act === 2) nc = Math.min(numCols - 1, c + 1); // Right
        else if (act === 3) nr = Math.max(0, r - 1); // Up

        const nextS = toState(nr, nc);
        const nextCell = grid[nr][nc];
        const reward = nextCell === 'G' ? 1.0 : 0.0;
        const done = nextCell === 'H' || nextCell === 'G';

        results.push({ prob, nextState: nextS, reward, done });
      });

      return results;
    },
    [grid, isSlippery, numCols, numRows]
  );

  // Run Exact Value Iteration
  const runValueIteration = useCallback(() => {
    let V = new Array(numStates).fill(0);
    const pol = new Array(numStates).fill(0);
    const theta = 1e-6;

    // Iterative Bellman Backup
    for (let iter = 0; iter < 1000; iter++) {
      let delta = 0;
      const nextV = [...V];

      for (let s = 0; s < numStates; s++) {
        const { r, c } = toCoord(s);
        const cell = grid[r][c];
        if (cell === 'H' || cell === 'G') continue;

        let maxQ = -Infinity;
        for (let a = 0; a < 4; a++) {
          const transitions = getTransitions(s, a);
          let q = 0;
          for (const trans of transitions) {
            q += trans.prob * (trans.reward + gamma * V[trans.nextState]);
          }
          if (q > maxQ) maxQ = q;
        }

        nextV[s] = maxQ;
        delta = Math.max(delta, Math.abs(V[s] - nextV[s]));
      }

      V = nextV;
      if (delta < theta) break;
    }

    // Extract Policy
    for (let s = 0; s < numStates; s++) {
      const { r, c } = toCoord(s);
      const cell = grid[r][c];
      if (cell === 'H' || cell === 'G') {
        pol[s] = 0;
        continue;
      }

      let bestA = 0;
      let maxQ = -Infinity;
      for (let a = 0; a < 4; a++) {
        const transitions = getTransitions(s, a);
        let q = 0;
        for (const trans of transitions) {
          q += trans.prob * (trans.reward + gamma * V[trans.nextState]);
        }
        if (q > maxQ) {
          maxQ = q;
          bestA = a;
        }
      }
      pol[s] = bestA;
    }

    setVValues(V);
    setPolicy(pol);
  }, [gamma, getTransitions, grid, numStates]);

  // Reset Environment
  const resetEnv = useCallback(() => {
    setAgentPos(0);
    setEpisodeSteps(0);
    setGameStatus('playing');
  }, []);

  // Recalculate on config change
  useEffect(() => {
    runValueIteration();
    resetEnv();
  }, [selectedGridType, gamma, isSlippery, runValueIteration, resetEnv]);

  // Single step in environment
  const stepAgent = useCallback(() => {
    if (gameStatus !== 'playing') {
      resetEnv();
      return;
    }

    const currentAction = policy[agentPos] ?? 0;
    const transitions = getTransitions(agentPos, currentAction);

    // Stochastic choice if slippery
    let selected = transitions[0];
    if (transitions.length > 1) {
      const rand = Math.random();
      let cumulative = 0;
      for (const t of transitions) {
        cumulative += t.prob;
        if (rand <= cumulative) {
          selected = t;
          break;
        }
      }
    }

    const nextS = selected.nextState;
    const { r, c } = toCoord(nextS);
    const cell = grid[r][c];

    setAgentPos(nextS);
    setEpisodeSteps((s) => s + 1);

    if (cell === 'G') {
      setGameStatus('won');
      setEpisodesRun((e) => e + 1);
      setSuccessCount((sc) => sc + 1);
    } else if (cell === 'H') {
      setGameStatus('lost');
      setEpisodesRun((e) => e + 1);
    }
  }, [agentPos, gameStatus, getTransitions, grid, policy, resetEnv]);

  // Autoplay Loop
  useEffect(() => {
    if (isAutoPlaying) {
      timerRef.current = setInterval(() => {
        stepAgent();
      }, playSpeed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoPlaying, playSpeed, stepAgent]);

  const maxV = Math.max(...vValues, 0.001);

  return (
    <div className="p-6 sm:p-8 rounded-2xl cyber-panel border-[#00F0FF]/40 shadow-[0_0_35px_rgba(0,240,255,0.18)] text-white space-y-6">
      {/* Titlebar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#00F0FF] mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] animate-pulse" />
            <span className="font-bold tracking-widest uppercase">
              [ REINFORCEMENT LEARNING // VALUE ITERATION &amp; STOCHASTIC POLICY ]
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-mono font-extrabold text-white">
            FrozenLake MDP Gridworld Sandbox
          </h3>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-[#0A0E1A] border border-slate-700 text-slate-400 hover:text-white font-mono text-xs transition-colors"
          >
            [CLOSE ESC] ✕
          </button>
        )}
      </div>

      {/* Grid Selection & Parameters */}
      <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 text-[11px]">GRID MATRIX:</span>
          {(['4x4', '4x6', '8x8'] as GridType[]).map((gt) => (
            <button
              key={gt}
              onClick={() => {
                setSelectedGridType(gt);
                setIsAutoPlaying(false);
              }}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                selectedGridType === gt
                  ? 'bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF]'
                  : 'bg-[#0A0E1A] border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {gt} Grid
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={isSlippery}
              onChange={(e) => setIsSlippery(e.target.checked)}
              className="accent-[#00FFA3]"
            />
            <span>Stochastic Friction (Slippery Ice)</span>
          </label>
        </div>
      </div>

      {/* Main Gridworld Interactive Canvas */}
      <div className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl bg-[#05060A] border border-slate-800">
        <div
          className="grid gap-2 select-none"
          style={{
            gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((row, r) =>
            row.split('').map((cell, c) => {
              const stateIndex = toState(r, c);
              const isAgentHere = agentPos === stateIndex;
              const cellVal = vValues[stateIndex] ?? 0;
              const cellPol = policy[stateIndex] ?? 0;

              // Heatmap intensity for value function
              const heat = Math.min(1, Math.max(0, cellVal / maxV));

              let bgStyle = 'bg-[#0A0E1A] border-slate-800';
              let badgeText = '';

              if (cell === 'S') {
                bgStyle = 'border-[#00F0FF]/60';
                badgeText = 'START';
              } else if (cell === 'H') {
                bgStyle = 'bg-rose-950/40 border-rose-800/80';
                badgeText = 'HOLE';
              } else if (cell === 'G') {
                bgStyle = 'bg-emerald-950/40 border-emerald-500/80 shadow-[0_0_15px_rgba(0,255,163,0.3)]';
                badgeText = 'GOAL';
              } else {
                bgStyle = `border-slate-800 hover:border-slate-600`;
              }

              return (
                <div
                  key={`${r}-${c}`}
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl border flex flex-col items-center justify-between p-1.5 transition-all ${bgStyle} ${
                    isAgentHere ? 'ring-2 ring-[#00F0FF] shadow-[0_0_20px_#00F0FF]' : ''
                  }`}
                  style={{
                    backgroundColor:
                      cell === 'F' && heat > 0.05
                        ? `rgba(0, 240, 255, ${0.08 + heat * 0.35})`
                        : undefined,
                  }}
                >
                  {/* Top cell label */}
                  <span className="text-[9px] font-mono text-slate-400 self-start">
                    {badgeText || `V:${cellVal.toFixed(2)}`}
                  </span>

                  {/* Cell Center: Agent or Action Arrow */}
                  <div className="flex-1 flex items-center justify-center">
                    {isAgentHere ? (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#00FFA3] flex items-center justify-center text-black font-extrabold text-xs shadow-[0_0_15px_#00F0FF] animate-pulse">
                        🤖
                      </div>
                    ) : cell === 'H' ? (
                      <span className="text-rose-400 font-bold text-sm">🕳️</span>
                    ) : cell === 'G' ? (
                      <span className="text-emerald-400 font-bold text-sm">🎯</span>
                    ) : (
                      <span className="text-slate-500 font-mono text-sm font-bold group-hover:text-[#00F0FF]">
                        {ACTION_ARROWS[cellPol]}
                      </span>
                    )}
                  </div>

                  {/* Bottom cell coordinate */}
                  <span className="text-[8px] font-mono text-slate-600 self-end">
                    ({r},{c})
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Status Transmission Bar */}
        <div className="mt-4 flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">STATUS:</span>
          {gameStatus === 'playing' && (
            <span className="text-[#00F0FF] animate-pulse">TRAVERSING GRID... (Step {episodeSteps})</span>
          )}
          {gameStatus === 'won' && (
            <span className="text-[#00FFA3] font-bold">🎯 GOAL REACHED! REWARD: +1.0</span>
          )}
          {gameStatus === 'lost' && (
            <span className="text-rose-400 font-bold">💀 FELL INTO HOLE (TERMINAL)</span>
          )}
        </div>
      </div>

      {/* Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3 rounded-lg bg-[#05060A] border border-slate-800">
          <span className="block text-slate-500 text-[10px]">EPISODES RUN</span>
          <span className="text-white font-bold text-base">{episodesRun}</span>
        </div>

        <div className="p-3 rounded-lg bg-[#05060A] border border-slate-800">
          <span className="block text-slate-500 text-[10px]">SUCCESS RATE</span>
          <span className="text-[#00FFA3] font-bold text-base">
            {episodesRun > 0 ? ((successCount / episodesRun) * 100).toFixed(1) : '100.0'}%
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[#05060A] border border-slate-800">
          <span className="block text-slate-500 text-[10px]">RECOMMENDED POLICY</span>
          <span className="text-[#00F0FF] font-bold text-base">
            {ACTION_NAMES[policy[agentPos] ?? 0]} ({ACTION_ARROWS[policy[agentPos] ?? 0]})
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[#05060A] border border-slate-800">
          <span className="block text-slate-500 text-[10px]">BELLMAN DISCOUNT γ</span>
          <span className="text-[#C084FC] font-bold text-base">{gamma.toFixed(2)}</span>
        </div>
      </div>

      {/* Control Buttons & Sliders */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 font-mono text-xs">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={`px-5 py-2.5 rounded-xl font-bold tracking-wider uppercase transition-all shadow-lg flex items-center gap-2 ${
            isAutoPlaying
              ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
              : 'bg-gradient-to-r from-[#00F0FF] to-[#38BDF8] hover:brightness-110 text-black shadow-[0_0_20px_rgba(0,240,255,0.4)]'
          }`}
        >
          <span>{isAutoPlaying ? '❚❚ PAUSE SIMULATION' : '▶ AUTO-RUN AGENT'}</span>
        </button>

        <button
          onClick={stepAgent}
          disabled={isAutoPlaying}
          className="px-4 py-2.5 rounded-xl bg-[#0A0E1A] border border-slate-700 text-slate-300 hover:text-white hover:border-[#00FFA3] transition-all disabled:opacity-40"
        >
          ⏭ SINGLE STEP
        </button>

        <button
          onClick={resetEnv}
          className="px-4 py-2.5 rounded-xl bg-[#0A0E1A] border border-slate-700 text-slate-300 hover:text-red-400 hover:border-red-500/50 transition-all"
        >
          ↺ RESET AGENT
        </button>
      </div>

      {/* Sliders for Discount & Speed */}
      <div className="p-4 rounded-xl bg-[#05060A]/80 border border-slate-800 space-y-3 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Discount Factor (γ):</span>
              <span className="text-[#00F0FF] font-bold">{gamma.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={0.99}
              step={0.01}
              value={gamma}
              onChange={(e) => setGamma(Number(e.target.value))}
              className="w-full accent-[#00F0FF]"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Step Interval (ms):</span>
              <span className="text-[#00FFA3] font-bold">{playSpeed} ms</span>
            </div>
            <input
              type="range"
              min={100}
              max={800}
              step={50}
              value={playSpeed}
              onChange={(e) => setPlaySpeed(Number(e.target.value))}
              className="w-full accent-[#00FFA3]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

