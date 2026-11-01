'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Point {
  x: number;
  y: number;
}

interface Polygon {
  vertices: Point[];
  color: [number, number, number, number]; // r, g, b, a (a is 0..1)
}

interface Individual {
  polygons: Polygon[];
  fitness: number;
}

interface EvolverProps {
  onClose?: () => void;
}

const PRESETS = [
  { id: 'mona-lisa', name: 'Mona Lisa (Da Vinci)', url: '/assets/projects/mona-lisa/mona_lisa.jpg' },
  { id: 'cane-office', name: 'Robotics Sim (Office)', url: '/assets/projects/smart-cane/office.png' },
  { id: 'tree-fractal', name: 'L-System Fractal', url: '/assets/projects/evolving-l-systems/tree_fractal.png' },
];

export default function MonaLisaEvolverMiniPlayer({ onClose }: EvolverProps) {
  // Config & Hyperparameters
  const [numPolygons, setNumPolygons] = useState<number>(50);
  const [verticesPerPoly, setVerticesPerPoly] = useState<number>(3);
  const [mutationRate, setMutationRate] = useState<number>(0.2); // prob per poly
  const [mutationStrength, setMutationStrength] = useState<number>(0.12);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(15); // steps per frame
  const [activePreset, setActivePreset] = useState<string>(PRESETS[0].url);

  // Simulation Status
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [generation, setGeneration] = useState<number>(0);
  const [acceptedMutations, setAcceptedMutations] = useState<number>(0);
  const [similarity, setSimilarity] = useState<number>(0);
  const [gensPerSec, setGensPerSec] = useState<number>(0);
  const [fitnessHistory, setFitnessHistory] = useState<number[]>([]);

  // Canvas Refs
  const targetCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const evolveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sparklineCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Engine Internals (stored in refs for zero-overhead animation loops)
  const workingWidth = 120;
  const workingHeight = 160;

  const targetDataRef = useRef<Uint8ClampedArray | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const bestIndRef = useRef<Individual | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isRunningRef = useRef<boolean>(false);
  const lastTimeRef = useRef<number>(performance.now());
  const genCounterRef = useRef<number>(0);
  const acceptedRef = useRef<number>(0);
  const lastGensSampleRef = useRef<number>(0);

  // Helper: Create random polygon
  const createRandomPolygon = useCallback(
    (numVerts: number): Polygon => {
      const vertices: Point[] = [];
      const cx = Math.random();
      const cy = Math.random();
      const radius = 0.05 + Math.random() * 0.25;

      for (let i = 0; i < numVerts; i++) {
        const angle = (i / numVerts) * 2 * Math.PI + (Math.random() - 0.5) * 0.5;
        const r = radius * (0.6 + Math.random() * 0.8);
        const x = Math.min(1, Math.max(0, cx + Math.cos(angle) * r));
        const y = Math.min(1, Math.max(0, cy + Math.sin(angle) * r));
        vertices.push({ x, y });
      }

      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      const a = 0.15 + Math.random() * 0.45; // subtle semi-transparent

      return { vertices, color: [r, g, b, a] };
    },
    []
  );

  // Helper: Create initial individual
  const createRandomIndividual = useCallback(
    (numPolys: number, numVerts: number): Individual => {
      const polygons: Polygon[] = [];
      for (let i = 0; i < numPolys; i++) {
        polygons.push(createRandomPolygon(numVerts));
      }
      return { polygons, fitness: 0 };
    },
    [createRandomPolygon]
  );

  // Helper: Deep clone individual
  const cloneIndividual = (ind: Individual): Individual => {
    return {
      fitness: ind.fitness,
      polygons: ind.polygons.map((p) => ({
        vertices: p.vertices.map((v) => ({ ...v })),
        color: [...p.color] as [number, number, number, number],
      })),
    };
  };

  // Helper: Render individual onto a given 2D context
  const renderIndividual = (ctx: CanvasRenderingContext2D, ind: Individual, w: number, h: number) => {
    // Fill background with black or neutral dark
    ctx.fillStyle = '#05060A';
    ctx.fillRect(0, 0, w, h);

    for (const poly of ind.polygons) {
      if (poly.vertices.length < 3) continue;
      const [r, g, b, a] = poly.color;
      ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
      ctx.beginPath();
      ctx.moveTo(poly.vertices[0].x * w, poly.vertices[0].y * h);
      for (let i = 1; i < poly.vertices.length; i++) {
        ctx.lineTo(poly.vertices[i].x * w, poly.vertices[i].y * h);
      }
      ctx.closePath();
      ctx.fill();
    }
  };

  // Helper: Compute fitness (Similarity %) against target data
  const computeFitness = (candData: Uint8ClampedArray, targetData: Uint8ClampedArray): number => {
    let diffSum = 0;
    const len = candData.length;
    for (let i = 0; i < len; i += 4) {
      const dr = targetData[i] - candData[i];
      const dg = targetData[i + 1] - candData[i + 1];
      const db = targetData[i + 2] - candData[i + 2];
      diffSum += dr * dr + dg * dg + db * db;
    }
    const maxDiff = (len / 4) * 3 * (255 * 255);
    return Math.max(0, (1 - diffSum / maxDiff) * 100);
  };

  // Mutate candidate in-place
  const mutateIndividual = (
    ind: Individual,
    mutRate: number,
    mutStrength: number,
    numVerts: number
  ) => {
    for (let pIdx = 0; pIdx < ind.polygons.length; pIdx++) {
      if (Math.random() < mutRate) {
        const poly = ind.polygons[pIdx];
        const action = Math.random();

        if (action < 0.6) {
          // Mutate one or more vertex coordinates
          const vIdx = Math.floor(Math.random() * poly.vertices.length);
          const dx = (Math.random() * 2 - 1) * mutStrength;
          const dy = (Math.random() * 2 - 1) * mutStrength;
          poly.vertices[vIdx].x = Math.min(1, Math.max(0, poly.vertices[vIdx].x + dx));
          poly.vertices[vIdx].y = Math.min(1, Math.max(0, poly.vertices[vIdx].y + dy));
        } else if (action < 0.85) {
          // Mutate color channels
          const cIdx = Math.floor(Math.random() * 4);
          if (cIdx === 3) {
            // Alpha
            poly.color[3] = Math.min(0.8, Math.max(0.1, poly.color[3] + (Math.random() * 0.2 - 0.1)));
          } else {
            // RGB
            const dc = Math.floor((Math.random() * 2 - 1) * 255 * mutStrength);
            poly.color[cIdx] = Math.min(255, Math.max(0, poly.color[cIdx] + dc));
          }
        } else if (action < 0.95 && ind.polygons.length > 1) {
          // Reorder / Swap layers (Z-index change)
          const otherIdx = Math.floor(Math.random() * ind.polygons.length);
          const temp = ind.polygons[pIdx];
          ind.polygons[pIdx] = ind.polygons[otherIdx];
          ind.polygons[otherIdx] = temp;
        } else {
          // Re-generate polygon entirely
          ind.polygons[pIdx] = createRandomPolygon(numVerts);
        }
      }
    }
  };

  // Draw sparkline fitness graph
  const drawSparkline = (history: number[]) => {
    const canvas = sparklineCanvasRef.current;
    if (!canvas || history.length < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const minF = Math.min(...history);
    const maxF = Math.max(...history, minF + 1);

    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 2;
    ctx.beginPath();

    history.forEach((val, idx) => {
      const x = (idx / (history.length - 1)) * w;
      const y = h - ((val - minF) / (maxF - minF)) * (h - 8) - 4;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Fill gradient below line
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fill();
  };

  // Load Target Image onto canvas and initialize
  const loadTargetImage = useCallback((imgSrc: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const targetCanvas = targetCanvasRef.current;
      if (!targetCanvas) return;
      targetCanvas.width = workingWidth;
      targetCanvas.height = workingHeight;
      const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, workingWidth, workingHeight);
      const imgData = ctx.getImageData(0, 0, workingWidth, workingHeight);
      targetDataRef.current = imgData.data;

      // Reset individual
      const initialInd = createRandomIndividual(numPolygons, verticesPerPoly);

      // Setup offscreen canvas
      if (!offscreenCanvasRef.current) {
        offscreenCanvasRef.current = document.createElement('canvas');
        offscreenCanvasRef.current.width = workingWidth;
        offscreenCanvasRef.current.height = workingHeight;
        offscreenCtxRef.current = offscreenCanvasRef.current.getContext('2d', { willReadFrequently: true });
      }

      if (offscreenCtxRef.current) {
        renderIndividual(offscreenCtxRef.current, initialInd, workingWidth, workingHeight);
        const candData = offscreenCtxRef.current.getImageData(0, 0, workingWidth, workingHeight).data;
        initialInd.fitness = computeFitness(candData, targetDataRef.current);
      }

      bestIndRef.current = initialInd;
      genCounterRef.current = 0;
      acceptedRef.current = 0;
      setGeneration(0);
      setAcceptedMutations(0);
      setSimilarity(initialInd.fitness);
      setFitnessHistory([initialInd.fitness]);

      // Render to visible canvas
      const evolveCanvas = evolveCanvasRef.current;
      if (evolveCanvas) {
        evolveCanvas.width = workingWidth;
        evolveCanvas.height = workingHeight;
        const eCtx = evolveCanvas.getContext('2d');
        if (eCtx) renderIndividual(eCtx, initialInd, workingWidth, workingHeight);
      }
    };
    img.src = imgSrc;
  }, [createRandomIndividual, numPolygons, verticesPerPoly]);

  // Handle preset change
  const handleSelectPreset = (url: string) => {
    setIsRunning(false);
    isRunningRef.current = false;
    setActivePreset(url);
    loadTargetImage(url);
  };

  // Handle custom image upload
  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setIsRunning(false);
          isRunningRef.current = false;
          const dataUrl = event.target.result as string;
          setActivePreset(dataUrl);
          loadTargetImage(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Core Simulation Step Loop
  const stepEvolution = useCallback(() => {
    if (!isRunningRef.current) return;

    const targetData = targetDataRef.current;
    const offscreenCtx = offscreenCtxRef.current;
    let currentBest = bestIndRef.current;

    if (!targetData || !offscreenCtx || !currentBest) {
      animFrameIdRef.current = requestAnimationFrame(stepEvolution);
      return;
    }

    // Run batch of mutation iterations per frame
    for (let i = 0; i < speedMultiplier; i++) {
      genCounterRef.current++;
      const candidate = cloneIndividual(currentBest);

      mutateIndividual(candidate, mutationRate, mutationStrength, verticesPerPoly);

      renderIndividual(offscreenCtx, candidate, workingWidth, workingHeight);
      const candData = offscreenCtx.getImageData(0, 0, workingWidth, workingHeight).data;
      const candFitness = computeFitness(candData, targetData);

      if (candFitness >= currentBest.fitness) {
        candidate.fitness = candFitness;
        currentBest = candidate;
        bestIndRef.current = candidate;
        acceptedRef.current++;
      }
    }

    // Render best to visible evolveCanvas
    const evolveCanvas = evolveCanvasRef.current;
    if (evolveCanvas) {
      const eCtx = evolveCanvas.getContext('2d');
      if (eCtx) renderIndividual(eCtx, currentBest, workingWidth, workingHeight);
    }

    // Telemetry updates every ~100ms
    const now = performance.now();
    if (now - lastTimeRef.current >= 120) {
      const dt = (now - lastTimeRef.current) / 1000;
      const dGens = genCounterRef.current - lastGensSampleRef.current;
      setGensPerSec(Math.round(dGens / dt));
      lastGensSampleRef.current = genCounterRef.current;
      lastTimeRef.current = now;

      setGeneration(genCounterRef.current);
      setAcceptedMutations(acceptedRef.current);
      setSimilarity(currentBest.fitness);

      setFitnessHistory((prev) => {
        const next = [...prev, currentBest!.fitness];
        if (next.length > 60) next.shift();
        drawSparkline(next);
        return next;
      });
    }

    animFrameIdRef.current = requestAnimationFrame(stepEvolution);
  }, [mutationRate, mutationStrength, speedMultiplier, verticesPerPoly]);

  // Start / Pause
  const toggleRunning = () => {
    if (isRunning) {
      setIsRunning(false);
      isRunningRef.current = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    } else {
      setIsRunning(true);
      isRunningRef.current = true;
      lastTimeRef.current = performance.now();
      lastGensSampleRef.current = genCounterRef.current;
      animFrameIdRef.current = requestAnimationFrame(stepEvolution);
    }
  };

  // Reset current run
  const handleReset = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    loadTargetImage(activePreset);
  };

  // Initial load
  useEffect(() => {
    loadTargetImage(activePreset);
    return () => {
      isRunningRef.current = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [loadTargetImage, activePreset]);

  // Single step forward
  const handleSingleStep = () => {
    if (isRunning) return;
    const targetData = targetDataRef.current;
    const offscreenCtx = offscreenCtxRef.current;
    const currentBest = bestIndRef.current;
    if (!targetData || !offscreenCtx || !currentBest) return;

    genCounterRef.current++;
    const candidate = cloneIndividual(currentBest);
    mutateIndividual(candidate, mutationRate, mutationStrength, verticesPerPoly);

    renderIndividual(offscreenCtx, candidate, workingWidth, workingHeight);
    const candData = offscreenCtx.getImageData(0, 0, workingWidth, workingHeight).data;
    const candFitness = computeFitness(candData, targetData);

    if (candFitness >= currentBest.fitness) {
      candidate.fitness = candFitness;
      bestIndRef.current = candidate;
      acceptedRef.current++;
    }

    const evolveCanvas = evolveCanvasRef.current;
    if (evolveCanvas && bestIndRef.current) {
      const eCtx = evolveCanvas.getContext('2d');
      if (eCtx) renderIndividual(eCtx, bestIndRef.current, workingWidth, workingHeight);
    }

    setGeneration(genCounterRef.current);
    setAcceptedMutations(acceptedRef.current);
    if (bestIndRef.current) {
      setSimilarity(bestIndRef.current.fitness);
    }
  };

  // Snapshot download
  const handleDownloadSnapshot = () => {
    const canvas = evolveCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `mona-lisa-gen-${generation}-${similarity.toFixed(1)}pct.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="p-6 sm:p-8 rounded-2xl cyber-panel border-[#00F0FF]/40 shadow-[0_0_35px_rgba(0,240,255,0.18)] text-white space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#00F0FF] mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] animate-pulse shadow-[0_0_8px_#00F0FF]" />
            <span className="font-bold tracking-widest uppercase">
              [ LIVE IN-BROWSER EVOLVER // EVOLUTIONARY IMAGE RECONSTRUCTION ]
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-mono font-extrabold text-white">
            Genetic Polygon Synthesizer
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

      {/* Preset Selector & Custom Upload Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 text-[11px]">TARGET IMAGE:</span>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p.url)}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                activePreset === p.url
                  ? 'bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF]'
                  : 'bg-[#0A0E1A] border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleCustomUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-1.5 rounded-xl bg-[#0A0E1A] border border-[#00FFA3]/40 text-[#00FFA3] hover:bg-[#00FFA3]/10 font-mono text-xs transition-all flex items-center gap-1.5"
          >
            <span>📁 UPLOAD CUSTOM IMAGE</span>
          </button>
        </div>
      </div>

      {/* Dual Screen Display Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-center">
        {/* Screen 1: Target Image */}
        <div className="flex flex-col items-center p-4 rounded-xl bg-[#05060A] border border-slate-800 relative">
          <div className="w-full flex items-center justify-between font-mono text-[11px] text-slate-400 mb-2">
            <span>TARGET REFERENCE</span>
            <span className="text-[#38BDF8]">120 × 160 px</span>
          </div>

          <div className="relative w-[180px] h-[240px] sm:w-[210px] sm:h-[280px] rounded-lg overflow-hidden border border-slate-700 bg-black flex items-center justify-center shadow-inner">
            <canvas
              ref={targetCanvasRef}
              className="w-full h-full object-cover"
              width={workingWidth}
              height={workingHeight}
            />
          </div>
          <span className="mt-2 font-mono text-[10px] text-slate-500">
            Ground Truth Loss Reference
          </span>
        </div>

        {/* Screen 2: Live Evolving Canvas */}
        <div className="flex flex-col items-center p-4 rounded-xl bg-[#05060A] border border-[#00F0FF]/40 relative shadow-[0_0_20px_rgba(0,240,255,0.08)]">
          <div className="w-full flex items-center justify-between font-mono text-[11px] text-[#00F0FF] mb-2">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-[#00FFA3] animate-ping' : 'bg-amber-400'}`} />
              <span>EVOLVING CHROMOSOME</span>
            </span>
            <span className="text-[#00FFA3] font-bold">{similarity.toFixed(2)}% FIT</span>
          </div>

          <div className="relative w-[180px] h-[240px] sm:w-[210px] sm:h-[280px] rounded-lg overflow-hidden border-2 border-[#00F0FF]/60 bg-black flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <canvas
              ref={evolveCanvasRef}
              className="w-full h-full object-cover"
              width={workingWidth}
              height={workingHeight}
            />
            {similarity < 5 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-mono text-xs text-slate-400 p-2 text-center">
                Press START to begin genetic mutations
              </div>
            )}
          </div>

          <span className="mt-2 font-mono text-[10px] text-slate-400">
            {numPolygons} semi-transparent polygons • {verticesPerPoly} vertices each
          </span>
        </div>
      </div>

      {/* Real-Time Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3 rounded-lg bg-[#05060A] border border-slate-800">
          <span className="block text-slate-500 text-[10px]">GENERATION</span>
          <span className="text-white font-bold text-sm sm:text-base">
            {generation.toLocaleString()}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[#05060A] border border-slate-800">
          <span className="block text-slate-500 text-[10px]">SIMILARITY (FITNESS)</span>
          <span className="text-[#00FFA3] font-bold text-sm sm:text-base">
            {similarity.toFixed(2)}%
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[#05060A] border border-slate-800">
          <span className="block text-slate-500 text-[10px]">THROUGHPUT</span>
          <span className="text-[#00F0FF] font-bold text-sm sm:text-base">
            {gensPerSec.toLocaleString()} gen/s
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[#05060A] border border-slate-800">
          <span className="block text-slate-500 text-[10px]">ACCEPTED MUTATIONS</span>
          <span className="text-[#C084FC] font-bold text-sm sm:text-base">
            {acceptedMutations.toLocaleString()}{' '}
            <span className="text-[10px] text-slate-400">
              ({generation > 0 ? ((acceptedMutations / generation) * 100).toFixed(1) : 0}%)
            </span>
          </span>
        </div>
      </div>

      {/* Fitness Convergence Curve Sparkline */}
      <div className="p-3 rounded-xl bg-[#05060A] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="font-mono text-xs">
          <span className="text-[#00F0FF] font-bold block">FITNESS CONVERGENCE TRAJECTORY</span>
          <span className="text-slate-400 text-[10px]">Real-time Mean Squared Error minimizer</span>
        </div>
        <div className="w-full sm:w-64 h-12 bg-black/60 rounded border border-slate-800 overflow-hidden">
          <canvas
            ref={sparklineCanvasRef}
            width={256}
            height={48}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Control Deck (Start, Pause, Reset, Download) */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 font-mono text-xs">
        <button
          onClick={toggleRunning}
          className={`px-6 py-3 rounded-xl font-bold tracking-wider uppercase transition-all shadow-lg flex items-center gap-2 ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
              : 'bg-gradient-to-r from-[#00F0FF] to-[#38BDF8] hover:brightness-110 text-black shadow-[0_0_20px_rgba(0,240,255,0.4)]'
          }`}
        >
          <span>{isRunning ? '❚❚ PAUSE EVOLUTION' : '▶ START GENETIC SYNTHESIS'}</span>
        </button>

        <button
          onClick={handleSingleStep}
          disabled={isRunning}
          className="px-4 py-3 rounded-xl bg-[#0A0E1A] border border-slate-700 text-slate-300 hover:text-white hover:border-[#00FFA3] transition-all disabled:opacity-40"
        >
          ⏭ STEP (+1)
        </button>

        <button
          onClick={handleReset}
          className="px-4 py-3 rounded-xl bg-[#0A0E1A] border border-slate-700 text-slate-300 hover:text-red-400 hover:border-red-500/50 transition-all"
        >
          ↺ RE-SEED
        </button>

        <button
          onClick={handleDownloadSnapshot}
          className="px-4 py-3 rounded-xl bg-[#0A0E1A] border border-slate-700 text-slate-300 hover:text-[#00F0FF] hover:border-[#00F0FF] transition-all flex items-center gap-1.5"
        >
          <span>⬇ EXPORT PNG SNAPSHOT</span>
        </button>
      </div>

      {/* Hyperparameter Tuner HUD */}
      <div className="p-4 rounded-xl bg-[#05060A]/80 border border-slate-800 space-y-4">
        <div className="font-mono text-xs text-slate-400 flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-[#00FFA3] font-bold">[ HYPERPARAMETER CONTROLS ]</span>
          <span>(1 + 1)-ES Dynamic Mutation Engine</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          {/* Polygons Count */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Polygons:</span>
              <span className="text-[#00F0FF] font-bold">{numPolygons}</span>
            </div>
            <input
              type="range"
              min={15}
              max={150}
              step={5}
              value={numPolygons}
              onChange={(e) => {
                const val = Number(e.target.value);
                setNumPolygons(val);
                if (!isRunning) loadTargetImage(activePreset);
              }}
              className="w-full accent-[#00F0FF]"
            />
          </div>

          {/* Vertices Per Polygon */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Geometry:</span>
              <span className="text-[#00F0FF] font-bold">
                {verticesPerPoly === 3 ? '3 (Triangles)' : verticesPerPoly === 4 ? '4 (Quads)' : `${verticesPerPoly}-gon`}
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={6}
              step={1}
              value={verticesPerPoly}
              onChange={(e) => {
                const val = Number(e.target.value);
                setVerticesPerPoly(val);
                if (!isRunning) loadTargetImage(activePreset);
              }}
              className="w-full accent-[#00FFA3]"
            />
          </div>

          {/* Mutation Rate */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Mutation Rate:</span>
              <span className="text-[#C084FC] font-bold">{(mutationRate * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={0.8}
              step={0.05}
              value={mutationRate}
              onChange={(e) => setMutationRate(Number(e.target.value))}
              className="w-full accent-[#A855F7]"
            />
          </div>

          {/* Throughput / Speed */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Speed (Steps/Frame):</span>
              <span className="text-amber-400 font-bold">{speedMultiplier}x</span>
            </div>
            <input
              type="range"
              min={1}
              max={40}
              step={1}
              value={speedMultiplier}
              onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
              className="w-full accent-amber-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
