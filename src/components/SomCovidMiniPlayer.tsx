'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface SomProps {
  onClose?: () => void;
}

interface CountryData {
  name: string;
  code: string;
  confirmed: number; // raw
  deaths: number;    // raw
  recovered: number; // raw
  vec: [number, number, number]; // normalized [0..1]
  bmu?: { r: number; c: number };
}

const COUNTRIES: CountryData[] = [
  { name: 'United States', code: 'USA', confirmed: 20639000, deaths: 351580, recovered: 12500000, vec: [1.0, 0.95, 0.7] },
  { name: 'India', code: 'IND', confirmed: 10323965, deaths: 149435, recovered: 9927310, vec: [0.75, 0.55, 0.92] },
  { name: 'Brazil', code: 'BRA', confirmed: 7716405, deaths: 195725, recovered: 6769420, vec: [0.65, 0.72, 0.78] },
  { name: 'United Kingdom', code: 'GBR', confirmed: 2599789, deaths: 74570, recovered: 1800000, vec: [0.38, 0.45, 0.4] },
  { name: 'France', code: 'FRA', confirmed: 2702906, deaths: 64921, recovered: 198000, vec: [0.39, 0.41, 0.2] },
  { name: 'Italy', code: 'ITA', confirmed: 2141201, deaths: 74985, recovered: 1489154, vec: [0.32, 0.46, 0.55] },
  { name: 'Germany', code: 'DEU', confirmed: 1773950, deaths: 34443, recovered: 1398900, vec: [0.28, 0.28, 0.65] },
  { name: 'Pakistan', code: 'PAK', confirmed: 486634, deaths: 10311, recovered: 440660, vec: [0.12, 0.12, 0.85] },
  { name: 'South Africa', code: 'ZAF', confirmed: 1088889, deaths: 29175, recovered: 897704, vec: [0.2, 0.25, 0.72] },
  { name: 'Japan', code: 'JPN', confirmed: 242056, deaths: 3585, recovered: 198000, vec: [0.08, 0.05, 0.7] },
  { name: 'Australia', code: 'AUS', confirmed: 28460, deaths: 909, recovered: 25700, vec: [0.02, 0.02, 0.9] },
  { name: 'Argentina', code: 'ARG', confirmed: 1634834, deaths: 43375, recovered: 1447092, vec: [0.25, 0.32, 0.8] },
  { name: 'Mexico', code: 'MEX', confirmed: 1443544, deaths: 126851, recovered: 1095460, vec: [0.23, 0.65, 0.68] },
  { name: 'Turkey', code: 'TUR', confirmed: 2232035, deaths: 21295, recovered: 2126432, vec: [0.35, 0.2, 0.9] },
  { name: 'Canada', code: 'CAN', confirmed: 597902, deaths: 15814, recovered: 504000, vec: [0.15, 0.18, 0.75] },
];

export default function SomCovidMiniPlayer({ onClose }: SomProps) {
  const gridSize = 14;
  const [learningRate, setLearningRate] = useState<number>(0.3);
  const [sigma, setSigma] = useState<number>(3.5); // Neighborhood radius
  const [epoch, setEpoch] = useState<number>(0);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);

  // Lattice of 3D weight vectors: weights[r][c] = [w_conf, w_mort, w_rec]
  const weightsRef = useRef<number[][][]>([]);
  const countriesRef = useRef<CountryData[]>(COUNTRIES);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize random weights
  const initWeights = useCallback(() => {
    const w: number[][][] = [];
    for (let r = 0; r < gridSize; r++) {
      const row: number[][] = [];
      for (let c = 0; c < gridSize; c++) {
        row.push([Math.random(), Math.random(), Math.random()]);
      }
      w.push(row);
    }
    weightsRef.current = w;
    setEpoch(0);
    updateBMUs();
  }, []);

  // Euclidean distance between 3D vectors
  const euclideanDist = (v1: number[], v2: number[]) => {
    return Math.sqrt(
      Math.pow(v1[0] - v2[0], 2) + Math.pow(v1[1] - v2[1], 2) + Math.pow(v1[2] - v2[2], 2)
    );
  };

  // Find Best Matching Unit (BMU) for input vector
  const findBMU = (vec: [number, number, number]) => {
    let minDist = Infinity;
    let bmu = { r: 0, c: 0 };
    const w = weightsRef.current;

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const d = euclideanDist(vec, w[r][c]);
        if (d < minDist) {
          minDist = d;
          bmu = { r, c };
        }
      }
    }
    return bmu;
  };

  // Update BMU positions for all countries
  const updateBMUs = () => {
    countriesRef.current = countriesRef.current.map((country) => {
      return { ...country, bmu: findBMU(country.vec) };
    });
  };

  // Single Training Epoch
  const trainEpoch = useCallback(() => {
    const w = weightsRef.current;
    if (w.length === 0) return;

    // Decay rate and neighborhood radius over epochs
    const currentEta = learningRate * Math.exp(-epoch / 150);
    const currentSigma = Math.max(0.6, sigma * Math.exp(-epoch / 150));

    // Shuffle countries
    const shuffled = [...countriesRef.current].sort(() => Math.random() - 0.5);

    for (const country of shuffled) {
      const bmu = findBMU(country.vec);

      // Update neighbors within radius
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          const distSq = Math.pow(r - bmu.r, 2) + Math.pow(c - bmu.c, 2);
          const influence = Math.exp(-distSq / (2 * Math.pow(currentSigma, 2)));

          for (let k = 0; k < 3; k++) {
            w[r][c][k] += currentEta * influence * (country.vec[k] - w[r][c][k]);
            w[r][c][k] = Math.min(1, Math.max(0, w[r][c][k]));
          }
        }
      }
    }

    updateBMUs();
    setEpoch((ep) => ep + 1);
  }, [epoch, learningRate, sigma]);

  // Draw Kohonen Feature Map
  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cellW = w / gridSize;
    const cellH = h / gridSize;
    const weights = weightsRef.current;

    if (weights.length === 0) return;

    // 1. Draw Cells (RGB mapped to weights: R=Mortality, G=Recovery, B=Confirmed)
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const [wConf, wMort, wRec] = weights[r][c];
        const red = Math.floor(wMort * 220 + 35);
        const green = Math.floor(wRec * 220 + 35);
        const blue = Math.floor(wConf * 220 + 35);

        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.fillRect(c * cellW, r * cellH, cellW - 1, cellH - 1);
      }
    }

    // 2. Draw Country Projections (BMUs)
    for (const country of countriesRef.current) {
      if (!country.bmu) continue;
      const cx = country.bmu.c * cellW + cellW / 2;
      const cy = country.bmu.r * cellH + cellH / 2;

      const isSelected = selectedCountry?.name === country.name;

      // Outer ring
      ctx.beginPath();
      ctx.arc(cx, cy, isSelected ? 8 : 5, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#00FFA3' : '#00F0FF';
      ctx.shadowColor = isSelected ? '#00FFA3' : '#00F0FF';
      ctx.shadowBlur = isSelected ? 12 : 6;
      ctx.fill();

      // Border
      ctx.strokeStyle = '#05060A';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Country label
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(country.code, cx, cy - 8);
    }
  }, [selectedCountry]);

  // Initial weights & draw
  useEffect(() => {
    initWeights();
  }, [initWeights]);

  useEffect(() => {
    drawMap();
  }, [drawMap, epoch]);

  // Auto-train loop
  useEffect(() => {
    if (isTraining) {
      const timer = setInterval(() => {
        trainEpoch();
      }, 40);
      return () => clearInterval(timer);
    }
  }, [isTraining, trainEpoch]);

  return (
    <div className="p-6 sm:p-8 rounded-2xl cyber-panel border-[#00F0FF]/40 shadow-[0_0_35px_rgba(0,240,255,0.18)] text-white space-y-6">
      {/* Titlebar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#00F0FF] mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] animate-pulse" />
            <span className="font-bold tracking-widest uppercase">
              [ UNSUPERVISED LEARNING // KOHONEN SELF-ORGANIZING MAP ]
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-mono font-extrabold text-white">
            COVID-19 Topological SOM Feature Map
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

      {/* Main Grid & Country Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Canvas Display */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center p-4 rounded-xl bg-[#05060A] border border-slate-800">
          <div className="w-full flex items-center justify-between font-mono text-[11px] text-slate-400 mb-2">
            <span>14 × 14 NEURAL LATTICE</span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> High Fatality
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block ml-2" /> High Recovery
            </span>
          </div>

          <div className="w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] rounded-xl overflow-hidden border border-[#00F0FF]/40 bg-black shadow-[0_0_20px_rgba(0,240,255,0.15)] relative">
            <canvas
              ref={canvasRef}
              width={350}
              height={350}
              className="w-full h-full cursor-pointer"
            />
          </div>
        </div>

        {/* Country Inspector Panel */}
        <div className="p-4 rounded-xl bg-[#05060A] border border-slate-800 space-y-3 font-mono text-xs">
          <div className="text-[#00FFA3] font-bold text-xs border-b border-slate-800 pb-2">
            [ BMU TELEMETRY PROJECTION ]
          </div>

          <div className="space-y-1.5">
            <span className="text-slate-400 text-[10px]">Select Country to Inspect BMU:</span>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setSelectedCountry(c)}
                  className={`px-2 py-1 rounded text-[10px] border transition-all ${
                    selectedCountry?.code === c.code
                      ? 'bg-[#00FFA3]/20 border-[#00FFA3] text-[#00FFA3]'
                      : 'bg-[#0A0E1A] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {c.code}
                </button>
              ))}
            </div>
          </div>

          {selectedCountry ? (
            <div className="p-3 rounded-lg bg-[#0A0E1A] border border-slate-700/80 space-y-1 text-[11px]">
              <div className="text-[#00F0FF] font-bold">{selectedCountry.name}</div>
              <div className="text-slate-300">Confirmed: {selectedCountry.confirmed.toLocaleString()}</div>
              <div className="text-rose-400">Deaths: {selectedCountry.deaths.toLocaleString()}</div>
              <div className="text-[#00FFA3]">Recovered: {selectedCountry.recovered.toLocaleString()}</div>
              <div className="text-purple-400 text-[10px] pt-1">
                BMU Cell: ({selectedCountry.bmu?.r}, {selectedCountry.bmu?.c})
              </div>
            </div>
          ) : (
            <div className="p-3 text-slate-500 text-[11px] italic">
              Click a country tag above to inspect its topological lattice position.
            </div>
          )}
        </div>
      </div>

      {/* Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3 rounded-lg bg-[#05060A] border border-slate-800">
          <span className="block text-slate-500 text-[10px]">TRAINING EPOCH</span>
          <span className="text-white font-bold text-base">{epoch}</span>
        </div>

        <div className="p-3 rounded-lg bg-[#05060A] border border-slate-800">
          <span className="block text-slate-500 text-[10px]">LEARNING RATE (α)</span>
          <span className="text-[#00FFA3] font-bold text-base">{learningRate.toFixed(2)}</span>
        </div>

        <div className="p-3 rounded-lg bg-[#05060A] border border-slate-800">
          <span className="block text-slate-500 text-[10px]">NEIGHBORHOOD RADIUS (σ)</span>
          <span className="text-[#00F0FF] font-bold text-base">{sigma.toFixed(1)}</span>
        </div>

        <div className="p-3 rounded-lg bg-[#05060A] border border-slate-800">
          <span className="block text-slate-500 text-[10px]">GLOBAL NATIONS</span>
          <span className="text-[#C084FC] font-bold text-base">{COUNTRIES.length} Projected</span>
        </div>
      </div>

      {/* Control Deck */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 font-mono text-xs">
        <button
          onClick={() => setIsTraining(!isTraining)}
          className={`px-5 py-2.5 rounded-xl font-bold tracking-wider uppercase transition-all shadow-lg flex items-center gap-2 ${
            isTraining
              ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
              : 'bg-gradient-to-r from-[#00F0FF] to-[#38BDF8] hover:brightness-110 text-black shadow-[0_0_20px_rgba(0,240,255,0.4)]'
          }`}
        >
          <span>{isTraining ? '❚❚ PAUSE TRAINING' : '▶ TRAIN KOHONEN LATTICE'}</span>
        </button>

        <button
          onClick={trainEpoch}
          disabled={isTraining}
          className="px-4 py-2.5 rounded-xl bg-[#0A0E1A] border border-slate-700 text-slate-300 hover:text-white hover:border-[#00FFA3] transition-all disabled:opacity-40"
        >
          ⏭ SINGLE EPOCH
        </button>

        <button
          onClick={initWeights}
          className="px-4 py-2.5 rounded-xl bg-[#0A0E1A] border border-slate-700 text-slate-300 hover:text-red-400 hover:border-red-500/50 transition-all"
        >
          ↺ RE-INITIALIZE LATTICE
        </button>
      </div>

      {/* Sliders for Learning Rate & Sigma */}
      <div className="p-4 rounded-xl bg-[#05060A]/80 border border-slate-800 space-y-3 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Initial Learning Rate (α):</span>
              <span className="text-[#00F0FF] font-bold">{learningRate.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={0.8}
              step={0.05}
              value={learningRate}
              onChange={(e) => setLearningRate(Number(e.target.value))}
              className="w-full accent-[#00F0FF]"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Initial Radius (σ):</span>
              <span className="text-[#00FFA3] font-bold">{sigma.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={1.0}
              max={6.0}
              step={0.5}
              value={sigma}
              onChange={(e) => setSigma(Number(e.target.value))}
              className="w-full accent-[#00FFA3]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

