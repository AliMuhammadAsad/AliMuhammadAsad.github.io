'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface LSystemProps {
  onClose?: () => void;
}

interface LSystemPreset {
  id: string;
  name: string;
  axiom: string;
  rules: Record<string, string>;
  angle: number;
  depth: number;
}

const PRESETS: LSystemPreset[] = [
  {
    id: 'tree',
    name: 'Cyber Botanical Tree',
    axiom: 'F',
    rules: { F: 'FF+[+F-F-F]-[-F+F+F]' },
    angle: 22.5,
    depth: 4,
  },
  {
    id: 'fern',
    name: 'Barnsley Fractal Fern',
    axiom: 'X',
    rules: { X: 'F+[[X]-X]-F[-FX]+X', F: 'FF' },
    angle: 25.0,
    depth: 5,
  },
  {
    id: 'bush',
    name: 'Branching Coral Bush',
    axiom: 'F',
    rules: { F: 'F[+F]F[-F][F]' },
    angle: 25.7,
    depth: 4,
  },
  {
    id: 'crystal',
    name: 'Geometric Crystal Matrix',
    axiom: 'F-F-F-F',
    rules: { F: 'FF-F-F-F-FF' },
    angle: 90.0,
    depth: 3,
  },
];

export default function LSystemFractalMiniPlayer({ onClose }: LSystemProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('tree');
  const [axiom, setAxiom] = useState<string>(PRESETS[0].axiom);
  const [ruleInput, setRuleInput] = useState<string>('F -> FF+[+F-F-F]-[-F+F+F]');
  const [angle, setAngle] = useState<number>(22.5);
  const [depth, setDepth] = useState<number>(4);
  const [colorTheme, setColorTheme] = useState<'cyan' | 'emerald' | 'purple' | 'amber'>('cyan');
  const [windSway, setWindSway] = useState<boolean>(true);

  // Stats
  const [stringLength, setStringLength] = useState<number>(0);
  const [branchCount, setBranchCount] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  // Generate expanded L-System string from axiom and rules
  const expandLSystem = useCallback(
    (currentAxiom: string, rulesMap: Record<string, string>, currentDepth: number): string => {
      let current = currentAxiom;
      for (let d = 0; d < currentDepth; d++) {
        let next = '';
        for (let i = 0; i < current.length; i++) {
          const ch = current[i];
          next += rulesMap[ch] !== undefined ? rulesMap[ch] : ch;
        }
        current = next;
        // Cap max length to prevent freezing on crazy deep recursion
        if (current.length > 30000) break;
      }
      return current;
    },
    []
  );

  // Parse rule string into map
  const parseRules = (input: string): Record<string, string> => {
    const map: Record<string, string> = {};
    const lines = input.split(';');
    lines.forEach((line) => {
      const parts = line.split('->');
      if (parts.length === 2) {
        const key = parts[0].trim();
        const val = parts[1].trim();
        if (key && val) map[key] = val;
      }
    });
    return map;
  };

  // Render Turtle Graphics on Canvas
  const renderLSystem = useCallback(
    (lString: string, baseAngle: number, swayOffset: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Color pallete
      let strokeColor = '#00F0FF';
      let leafColor = '#00FFA3';
      if (colorTheme === 'emerald') {
        strokeColor = '#00FFA3';
        leafColor = '#A3E635';
      } else if (colorTheme === 'purple') {
        strokeColor = '#C084FC';
        leafColor = '#F43F5E';
      } else if (colorTheme === 'amber') {
        strokeColor = '#F59E0B';
        leafColor = '#FB7185';
      }

      // Step 1: Pre-calculate bounds
      const effectiveAngle = (baseAngle + swayOffset) * (Math.PI / 180);
      let x = 0;
      let y = 0;
      let curA = -Math.PI / 2; // Facing UP
      let minX = 0, maxX = 0, minY = 0, maxY = 0;

      const stack: { x: number; y: number; a: number }[] = [];
      const step = 10;

      for (let i = 0; i < lString.length; i++) {
        const cmd = lString[i];
        if (cmd === 'F') {
          x += step * Math.cos(curA);
          y += step * Math.sin(curA);
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        } else if (cmd === '+') {
          curA += effectiveAngle;
        } else if (cmd === '-') {
          curA -= effectiveAngle;
        } else if (cmd === '[') {
          stack.push({ x, y, a: curA });
        } else if (cmd === ']') {
          if (stack.length > 0) {
            const popped = stack.pop()!;
            x = popped.x;
            y = popped.y;
            curA = popped.a;
          }
        }
      }

      // Step 2: Auto-scale and center inside canvas
      const margin = 35;
      const spanX = maxX - minX || 1;
      const spanY = maxY - minY || 1;
      const scaleX = (w - margin * 2) / spanX;
      const scaleY = (h - margin * 2) / spanY;
      const scale = Math.min(scaleX, scaleY);

      const offsetX = w / 2 - ((minX + maxX) / 2) * scale;
      const offsetY = h - margin - maxY * scale;

      // Step 3: Draw segments with glow
      ctx.lineWidth = Math.max(1, Math.min(3, 14 / (depth + 1)));
      ctx.strokeStyle = strokeColor;
      ctx.shadowBlur = 8;
      ctx.shadowColor = strokeColor;

      x = 0;
      y = 0;
      curA = -Math.PI / 2;
      stack.length = 0;

      ctx.beginPath();
      for (let i = 0; i < lString.length; i++) {
        const cmd = lString[i];
        if (cmd === 'F') {
          const nx = x + step * Math.cos(curA);
          const ny = y + step * Math.sin(curA);

          const screenX1 = x * scale + offsetX;
          const screenY1 = y * scale + offsetY;
          const screenX2 = nx * scale + offsetX;
          const screenY2 = ny * scale + offsetY;

          ctx.moveTo(screenX1, screenY1);
          ctx.lineTo(screenX2, screenY2);

          x = nx;
          y = ny;
        } else if (cmd === '+') {
          curA += effectiveAngle;
        } else if (cmd === '-') {
          curA -= effectiveAngle;
        } else if (cmd === '[') {
          stack.push({ x, y, a: curA });
        } else if (cmd === ']') {
          if (stack.length > 0) {
            // Draw small bioluminescent leaf tip at branch end
            const tipX = x * scale + offsetX;
            const tipY = y * scale + offsetY;
            ctx.fillStyle = leafColor;
            ctx.fillRect(tipX - 1.5, tipY - 1.5, 3, 3);

            const popped = stack.pop()!;
            x = popped.x;
            y = popped.y;
            curA = popped.a;
          }
        }
      }
      ctx.stroke();
    },
    [colorTheme, depth]
  );

  // Preset Selection
  const handleSelectPreset = (pId: string) => {
    const p = PRESETS.find((pr) => pr.id === pId);
    if (!p) return;
    setSelectedPresetId(pId);
    setAxiom(p.axiom);
    const ruleStr = Object.entries(p.rules)
      .map(([k, v]) => `${k} -> ${v}`)
      .join('; ');
    setRuleInput(ruleStr);
    setAngle(p.angle);
    setDepth(p.depth);
  };

  // Evolve / Mutate Genome
  const handleEvolve = () => {
    const symbols = ['F', '+', '-', '[', ']'];
    // Generate fresh genetic rule
    let newRule = 'F';
    const numTokens = 12 + Math.floor(Math.random() * 12);
    let openCount = 0;

    for (let i = 0; i < numTokens; i++) {
      const sym = symbols[Math.floor(Math.random() * symbols.length)];
      if (sym === '[') {
        if (openCount < 3) {
          newRule += '[';
          openCount++;
        }
      } else if (sym === ']') {
        if (openCount > 0) {
          newRule += ']';
          openCount--;
        }
      } else {
        newRule += sym;
      }
    }
    // Close remaining brackets
    while (openCount > 0) {
      newRule += ']';
      openCount--;
    }

    setAxiom('F');
    setRuleInput(`F -> ${newRule}`);
    setAngle(15 + Math.floor(Math.random() * 30));
    setDepth(3 + Math.floor(Math.random() * 2));
    setSelectedPresetId('custom');
  };

  // Continuous Wind Animation Loop
  useEffect(() => {
    const rules = parseRules(ruleInput);
    const lString = expandLSystem(axiom, rules, depth);
    setStringLength(lString.length);

    let branches = 0;
    for (let i = 0; i < lString.length; i++) {
      if (lString[i] === '[') branches++;
    }
    setBranchCount(branches);

    const animate = () => {
      timeRef.current += 0.035;
      const sway = windSway ? Math.sin(timeRef.current) * 1.8 : 0;
      renderLSystem(lString, angle, sway);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [axiom, ruleInput, depth, angle, windSway, expandLSystem, renderLSystem]);

  return (
    <div className="p-6 sm:p-8 rounded-2xl cyber-panel border-[#00FFA3]/40 shadow-[0_0_35px_rgba(0,255,163,0.18)] text-white space-y-6">
      {/* Titlebar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#00FFA3] mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00FFA3] animate-pulse" />
            <span className="font-bold tracking-widest uppercase">
              [ BIO-INSPIRED COMPUTING // L-SYSTEM GRAMMAR &amp; EVOLUTIONARY FRACTALS ]
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-mono font-extrabold text-white">
            Evolving Lindenmayer Botanical Synthesizer
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
          <span className="text-slate-400 text-[11px]">SPECIES PRESETS:</span>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p.id)}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                selectedPresetId === p.id
                  ? 'bg-[#00FFA3]/20 border-[#00FFA3] text-[#00FFA3]'
                  : 'bg-[#0A0E1A] border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        <button
          onClick={handleEvolve}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00FFA3] to-[#00F0FF] text-black font-bold font-mono text-xs hover:brightness-110 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,163,0.3)]"
        >
          <span>🧬 EVOLVE RANDOM GENOME</span>
        </button>
      </div>

      {/* Canvas Display */}
      <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#05060A] border border-slate-800 relative">
        <div className="w-full flex items-center justify-between font-mono text-[11px] text-slate-400 mb-2">
          <span className="text-[#00FFA3]">TURTLE GRAPHICS RENDERER</span>
          <span className="flex items-center gap-3">
            <span className="text-[#38BDF8]">{stringLength.toLocaleString()} instructions</span>
            <span className="text-purple-400">{branchCount} branches</span>
          </span>
        </div>

        <div className="w-full h-[360px] sm:h-[420px] rounded-xl overflow-hidden border border-[#00FFA3]/30 bg-black flex items-center justify-center relative shadow-inner">
          <canvas
            ref={canvasRef}
            width={700}
            height={500}
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Real-time Telemetry & Grammar Spec */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-[#05060A] border border-slate-800 space-y-2">
          <span className="text-slate-500 text-[10px] block uppercase">PRODUCTION GRAMMAR RULES:</span>
          <input
            type="text"
            value={ruleInput}
            onChange={(e) => {
              setRuleInput(e.target.value);
              setSelectedPresetId('custom');
            }}
            placeholder="F -> FF+[+F-F-F]-[-F+F+F]"
            className="w-full bg-[#070913] border border-slate-700 px-3 py-1.5 rounded text-[#00FFA3] font-mono text-xs outline-none focus:border-[#00FFA3]"
          />
          <span className="text-[10px] text-slate-500">
            F: Forward Line • +: Turn Right • -: Turn Left • [: Push • ]: Pop
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#05060A] border border-slate-800 space-y-2">
          <span className="text-slate-500 text-[10px] block uppercase">BIOLUMINESCENCE &amp; DYNAMICS:</span>
          <div className="flex flex-wrap items-center gap-2">
            {(['cyan', 'emerald', 'purple', 'amber'] as const).map((thm) => (
              <button
                key={thm}
                onClick={() => setColorTheme(thm)}
                className={`px-3 py-1 rounded-lg border uppercase text-[10px] transition-all ${
                  colorTheme === thm
                    ? 'border-[#00FFA3] bg-[#00FFA3]/20 text-[#00FFA3]'
                    : 'border-slate-800 text-slate-400'
                }`}
              >
                {thm}
              </button>
            ))}

            <button
              onClick={() => setWindSway(!windSway)}
              className={`px-3 py-1 rounded-lg border text-[10px] transition-all ${
                windSway
                  ? 'border-[#00F0FF] bg-[#00F0FF]/20 text-[#00F0FF]'
                  : 'border-slate-800 text-slate-400'
              }`}
            >
              🍃 Wind Sway: {windSway ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Sliders for Angle & Recursion Depth */}
      <div className="p-4 rounded-xl bg-[#05060A]/80 border border-slate-800 space-y-3 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Branching Angle (θ):</span>
              <span className="text-[#00FFA3] font-bold">{angle.toFixed(1)}°</span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              step={0.5}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-full accent-[#00FFA3]"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Recursion Depth:</span>
              <span className="text-[#00F0FF] font-bold">{depth}</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
              className="w-full accent-[#00F0FF]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

