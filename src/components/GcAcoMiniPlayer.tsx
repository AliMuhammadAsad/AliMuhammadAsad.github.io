'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface GcAcoProps {
  onClose?: () => void;
}

interface Node {
  id: number;
  x: number;
  y: number;
  color: number; // 0..K-1
}

interface Edge {
  u: number;
  v: number;
}

const PALETTE = [
  '#00F0FF', // Cyan
  '#00FFA3', // Neon Emerald
  '#C084FC', // Quantum Purple
  '#F59E0B', // Amber
  '#F43F5E', // Rose
  '#38BDF8', // Sky Blue
  '#E879F9', // Magenta
  '#FDE047', // Yellow
];

export default function GcAcoMiniPlayer({ onClose }: GcAcoProps) {
  const [numAnts, setNumAnts] = useState<number>(8);
  const [evaporationRate, setEvaporationRate] = useState<number>(0.2);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [iteration, setIteration] = useState<number>(0);
  const [bestColorsCount, setBestColorsCount] = useState<number>(6);
  const [conflictsCount, setConflictsCount] = useState<number>(0);
  const [presetGraph, setPresetGraph] = useState<'petersen' | 'planar' | 'random'>('planar');

  // Graph Structure
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const pheromonesRef = useRef<number[][]>([]); // [node][color]
  const bestColoringRef = useRef<number[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize Graph Structure
  const initGraph = useCallback((type: 'petersen' | 'planar' | 'random') => {
    let n = 12;
    const edges: Edge[] = [];
    const nodes: Node[] = [];

    if (type === 'petersen') {
      n = 10;
      // 5 outer, 5 inner
      const rOuter = 130;
      const rInner = 65;
      const cx = 250;
      const cy = 180;

      for (let i = 0; i < 5; i++) {
        const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        nodes.push({ id: i, x: cx + rOuter * Math.cos(a), y: cy + rOuter * Math.sin(a), color: 0 });
      }
      for (let i = 0; i < 5; i++) {
        const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        nodes.push({ id: i + 5, x: cx + rInner * Math.cos(a), y: cy + rInner * Math.sin(a), color: 0 });
      }
      // Outer ring
      for (let i = 0; i < 5; i++) edges.push({ u: i, v: (i + 1) % 5 });
      // Inner star
      for (let i = 0; i < 5; i++) edges.push({ u: i + 5, v: ((i + 2) % 5) + 5 });
      // Spokes
      for (let i = 0; i < 5; i++) edges.push({ u: i, v: i + 5 });
    } else if (type === 'planar') {
      n = 14;
      const cx = 250;
      const cy = 180;
      const r = 135;
      for (let i = 0; i < n; i++) {
        const a = (i * 2 * Math.PI) / n;
        nodes.push({ id: i, x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), color: 0 });
      }
      // Perimeter
      for (let i = 0; i < n; i++) edges.push({ u: i, v: (i + 1) % n });
      // Cross chords
      edges.push({ u: 0, v: 4 });
      edges.push({ u: 2, v: 7 });
      edges.push({ u: 4, v: 9 });
      edges.push({ u: 6, v: 11 });
      edges.push({ u: 8, v: 13 });
      edges.push({ u: 1, v: 8 });
      edges.push({ u: 3, v: 10 });
    } else {
      // Random planar cluster
      n = 16;
      const cx = 250;
      const cy = 180;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * 2 * Math.PI;
        const dist = 30 + Math.random() * 120;
        nodes.push({ id: i, x: cx + dist * Math.cos(a), y: cy + dist * Math.sin(a), color: 0 });
      }
      // Connect close nodes
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 95) {
            edges.push({ u: i, v: j });
          }
        }
      }
    }

    // Initialize Pheromones (nodes x max_colors)
    const maxColors = PALETTE.length;
    const phero: number[][] = [];
    for (let i = 0; i < n; i++) {
      phero.push(new Array(maxColors).fill(1.0));
    }

    nodesRef.current = nodes;
    edgesRef.current = edges;
    pheromonesRef.current = phero;
    bestColoringRef.current = new Array(n).fill(0);

    setIteration(0);
    setBestColorsCount(maxColors);
    setConflictsCount(0);
  }, []);

  // Compute number of color conflicts in graph
  const countConflicts = (coloring: number[]): number => {
    let conf = 0;
    const edges = edgesRef.current;
    for (const e of edges) {
      if (coloring[e.u] === coloring[e.v]) conf++;
    }
    return conf;
  };

  // Draw graph onto canvas
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const nodes = nodesRef.current;
    const edges = edgesRef.current;
    const coloring = bestColoringRef.current;

    // 1. Draw Edges
    for (const e of edges) {
      const u = nodes[e.u];
      const v = nodes[e.v];
      const isConflict = coloring[e.u] === coloring[e.v];

      ctx.beginPath();
      ctx.moveTo(u.x, u.y);
      ctx.lineTo(v.x, v.y);

      if (isConflict) {
        ctx.strokeStyle = '#F43F5E';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#F43F5E';
        ctx.shadowBlur = 8;
      } else {
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
        ctx.lineWidth = 1.2;
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
    }

    // 2. Draw Nodes
    for (const node of nodes) {
      const colorHex = PALETTE[coloring[node.id] % PALETTE.length] || '#00F0FF';

      ctx.shadowBlur = 10;
      ctx.shadowColor = colorHex;

      // Outer glow circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#05060A';
      ctx.fill();
      ctx.strokeStyle = colorHex;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Inner color pill
      ctx.beginPath();
      ctx.arc(node.x, node.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = colorHex;
      ctx.fill();

      // Node ID
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`v${node.id}`, node.x, node.y - 18);
    }
  }, []);

  // Run One ACO Generation / Iteration
  const stepACO = useCallback(() => {
    const nodes = nodesRef.current;
    const edges = edgesRef.current;
    const phero = pheromonesRef.current;
    const n = nodes.length;
    const maxColors = PALETTE.length;

    let bestAntColoring: number[] = [];
    let bestAntFitness = Infinity; // Lower is better
    let bestAntConflicts = Infinity;

    // Simulate each ant constructing a coloring
    for (let a = 0; a < numAnts; a++) {
      const coloring = new Array(n).fill(-1);

      // Traversal order (DSatur heuristic or degree heuristic)
      const uncolored = Array.from({ length: n }, (_, i) => i);
      uncolored.sort((i, j) => {
        const degI = edges.filter((e) => e.u === i || e.v === i).length;
        const degJ = edges.filter((e) => e.u === j || e.v === j).length;
        return degJ - degI; // Highest degree first
      });

      for (const u of uncolored) {
        // Collect neighbor colors
        const neighborColors = new Set<number>();
        for (const e of edges) {
          if (e.u === u && coloring[e.v] !== -1) neighborColors.add(coloring[e.v]);
          if (e.v === u && coloring[e.u] !== -1) neighborColors.add(coloring[e.u]);
        }

        // Calculate probability distribution over colors based on pheromones
        const probs: number[] = [];
        let sumProbs = 0;

        for (let c = 0; c < maxColors; c++) {
          const isClash = neighborColors.has(c);
          const heuristic = isClash ? 0.05 : 2.5;
          const tau = phero[u][c] || 1.0;
          const prob = Math.pow(tau, 1.2) * Math.pow(heuristic, 2.0);
          probs.push(prob);
          sumProbs += prob;
        }

        // Roulette wheel selection
        const rand = Math.random() * sumProbs;
        let cumulative = 0;
        let chosenColor = 0;
        for (let c = 0; c < maxColors; c++) {
          cumulative += probs[c];
          if (rand <= cumulative) {
            chosenColor = c;
            break;
          }
        }
        coloring[u] = chosenColor;
      }

      const conf = countConflicts(coloring);
      const usedColors = new Set(coloring).size;
      const fitness = usedColors + conf * 10;

      if (fitness < bestAntFitness) {
        bestAntFitness = fitness;
        bestAntColoring = coloring;
        bestAntConflicts = conf;
      }
    }

    // Pheromone Evaporation & Reinforcement
    for (let i = 0; i < n; i++) {
      for (let c = 0; c < maxColors; c++) {
        phero[i][c] = (1 - evaporationRate) * phero[i][c];
      }
    }

    // Deposit Pheromone from best ant
    const deltaTau = 5.0 / (bestAntFitness + 1);
    for (let i = 0; i < n; i++) {
      const c = bestAntColoring[i];
      phero[i][c] += deltaTau;
    }

    bestColoringRef.current = bestAntColoring;
    setIteration((it) => it + 1);
    setBestColorsCount(new Set(bestAntColoring).size);
    setConflictsCount(bestAntConflicts);

    drawGraph();
  }, [drawGraph, evaporationRate, numAnts]);

  // Simulation Loop
  useEffect(() => {
    initGraph(presetGraph);
  }, [initGraph, presetGraph]);

  useEffect(() => {
    drawGraph();
  }, [drawGraph]);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        stepACO();
      }, 150);
      return () => clearInterval(interval);
    }
  }, [isRunning, stepACO]);

  return (
    <div className="p-6 sm:p-8 rounded-2xl cyber-panel border-[#9D00FF]/40 shadow-[0_0_35px_rgba(157,0,255,0.18)] text-white space-y-6">
      {/* Titlebar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#C084FC] mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9D00FF] animate-pulse" />
            <span className="font-bold tracking-widest uppercase">
              [ SWARM INTELLIGENCE // ANT COLONY OPTIMIZATION &amp; GRAPH COLORING ]
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-mono font-extrabold text-white">
            GC-ACO Swarm Optimization Playground
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

      {/* Preset Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 text-[11px]">TOPOLOGY BENCHMARK:</span>
          {(['planar', 'petersen', 'random'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setIsRunning(false);
                setPresetGraph(t);
              }}
              className={`px-3 py-1.5 rounded-xl border uppercase transition-all ${
                presetGraph === t
                  ? 'bg-[#9D00FF]/20 border-[#9D00FF] text-[#C084FC]'
                  : 'bg-[#0A0E1A] border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {t} Graph
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setIsRunning(false);
            initGraph(presetGraph);
          }}
          className="px-3.5 py-1.5 rounded-xl bg-[#0A0E1A] border border-slate-700 text-slate-300 hover:text-white font-mono text-xs transition-all flex items-center gap-1.5"
        >
          <span>↺ RE-SEED SWARM</span>
        </button>
      </div>

      {/* Main Graph Visualization Canvas */}
      <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#05060A] border border-slate-800 relative">
        <div className="w-full flex items-center justify-between font-mono text-[11px] text-slate-400 mb-2">
          <span className="text-[#C084FC]">DYNAMIC CONSTRAINT TOPOLOGY</span>
          <span className="flex items-center gap-3">
            <span className={conflictsCount === 0 ? 'text-[#00FFA3] font-bold' : 'text-rose-400 font-bold'}>
              {conflictsCount === 0 ? '✓ ZERO CONFLICTS' : `⚠️ ${conflictsCount} CONFLICTS`}
            </span>
          </span>
        </div>

        <div className="w-full h-[360px] sm:h-[400px] rounded-xl overflow-hidden border border-[#9D00FF]/30 bg-black flex items-center justify-center relative shadow-inner">
          <canvas
            ref={canvasRef}
            width={500}
            height={360}
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3 rounded-lg bg-[#05060A] border border-slate-800">
          <span className="block text-slate-500 text-[10px]">ACO ITERATION</span>
          <span className="text-white font-bold text-base">{iteration}</span>
        </div>

        <div className="p-3 rounded-lg bg-[#05060A] border border-slate-800">
          <span className="block text-slate-500 text-[10px]">CHROMATIC NUMBER k</span>
          <span className="text-[#00FFA3] font-bold text-base">{bestColorsCount} Colors</span>
        </div>

        <div className="p-3 rounded-lg bg-[#05060A] border border-slate-800">
          <span className="block text-slate-500 text-[10px]">SWARM COLONY SIZE</span>
          <span className="text-[#00F0FF] font-bold text-base">{numAnts} Ants</span>
        </div>

        <div className="p-3 rounded-lg bg-[#05060A] border border-slate-800">
          <span className="block text-slate-500 text-[10px]">PHEROMONE EVAP γ</span>
          <span className="text-[#C084FC] font-bold text-base">{(evaporationRate * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Control Buttons & Sliders */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 font-mono text-xs">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-5 py-2.5 rounded-xl font-bold tracking-wider uppercase transition-all shadow-lg flex items-center gap-2 ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
              : 'bg-gradient-to-r from-[#9D00FF] to-[#00F0FF] hover:brightness-110 text-white shadow-[0_0_20px_rgba(157,0,255,0.4)]'
          }`}
        >
          <span>{isRunning ? '❚❚ PAUSE SWARM' : '▶ LAUNCH ANT COLONY'}</span>
        </button>

        <button
          onClick={stepACO}
          disabled={isRunning}
          className="px-4 py-2.5 rounded-xl bg-[#0A0E1A] border border-slate-700 text-slate-300 hover:text-white hover:border-[#00FFA3] transition-all disabled:opacity-40"
        >
          ⏭ SINGLE ITERATION
        </button>
      </div>

      {/* Sliders for Ants & Evaporation */}
      <div className="p-4 rounded-xl bg-[#05060A]/80 border border-slate-800 space-y-3 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Number of Ants:</span>
              <span className="text-[#00F0FF] font-bold">{numAnts}</span>
            </div>
            <input
              type="range"
              min={3}
              max={25}
              step={1}
              value={numAnts}
              onChange={(e) => setNumAnts(Number(e.target.value))}
              className="w-full accent-[#00F0FF]"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Evaporation Rate (γ):</span>
              <span className="text-[#C084FC] font-bold">{evaporationRate.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={0.5}
              step={0.05}
              value={evaporationRate}
              onChange={(e) => setEvaporationRate(Number(e.target.value))}
              className="w-full accent-[#A855F7]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

