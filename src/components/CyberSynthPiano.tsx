'use client';

import { useState, useEffect, useRef } from 'react';

interface KeyDef {
  note: string;
  freq: number;
  isBlack: boolean;
  hotkey: string;
}

const KEYS: KeyDef[] = [
  { note: 'C4', freq: 261.63, isBlack: false, hotkey: 'A' },
  { note: 'C#4', freq: 277.18, isBlack: true, hotkey: 'W' },
  { note: 'D4', freq: 293.66, isBlack: false, hotkey: 'S' },
  { note: 'D#4', freq: 311.13, isBlack: true, hotkey: 'E' },
  { note: 'E4', freq: 329.63, isBlack: false, hotkey: 'D' },
  { note: 'F4', freq: 349.23, isBlack: false, hotkey: 'F' },
  { note: 'F#4', freq: 369.99, isBlack: true, hotkey: 'T' },
  { note: 'G4', freq: 392.0, isBlack: false, hotkey: 'G' },
  { note: 'G#4', freq: 415.3, isBlack: true, hotkey: 'Y' },
  { note: 'A4', freq: 440.0, isBlack: false, hotkey: 'H' },
  { note: 'A#4', freq: 466.16, isBlack: true, hotkey: 'U' },
  { note: 'B4', freq: 493.88, isBlack: false, hotkey: 'J' },
  { note: 'C5', freq: 523.25, isBlack: false, hotkey: 'K' },
];

type SoundInstrument = 'piano' | 'synth' | 'violin';

export default function CyberSynthPiano() {
  const [instrument, setInstrument] = useState<SoundInstrument>('piano');
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [volume, setVolume] = useState<number>(0.75);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Initialize Web Audio Context on first user gesture
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.8;
      analyser.connect(ctx.destination);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      startVisualizer();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playNote = (freq: number, noteName: string, durationSec = 1.2) => {
    initAudio();
    const ctx = audioCtxRef.current;
    const analyser = analyserRef.current;
    if (!ctx || !analyser) return;

    setActiveNotes((prev) => new Set(prev).add(noteName));
    setTimeout(() => {
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.delete(noteName);
        return next;
      });
    }, 280);

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.45, now);
    masterGain.connect(analyser);

    if (instrument === 'piano') {
      // Acoustic Grand Piano Simulation: Fundamental + Harmonics
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, now); // Second harmonic

      oscGain.gain.setValueAtTime(0.01, now);
      oscGain.gain.linearRampToValueAtTime(1.0, now + 0.015);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

      osc1.connect(oscGain);
      osc2.connect(oscGain);
      oscGain.connect(masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + durationSec);
      osc2.stop(now + durationSec);
    } else if (instrument === 'synth') {
      // Cyber Neon Lead: Sawtooth + Resonant Filter
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const env = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.frequency.exponentialRampToValueAtTime(400, now + durationSec);
      filter.Q.setValueAtTime(6.0, now);

      env.gain.setValueAtTime(0.01, now);
      env.gain.linearRampToValueAtTime(0.9, now + 0.02);
      env.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

      osc.connect(filter);
      filter.connect(env);
      env.connect(masterGain);

      osc.start(now);
      osc.stop(now + durationSec);
    } else if (instrument === 'violin') {
      // Acoustic Violin String: Sawtooth with Vibrato & Bowing envelope
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const env = ctx.createGain();

      // Vibrato (5.5 Hz pitch modulation)
      lfo.frequency.setValueAtTime(5.5, now);
      lfoGain.gain.setValueAtTime(freq * 0.015, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.5, now);
      filter.Q.setValueAtTime(3.0, now);

      // Smooth bowing envelope
      env.gain.setValueAtTime(0.001, now);
      env.gain.linearRampToValueAtTime(0.8, now + 0.08);
      env.gain.exponentialRampToValueAtTime(0.0001, now + durationSec * 1.3);

      osc.connect(filter);
      filter.connect(env);
      env.connect(masterGain);

      lfo.start(now);
      osc.start(now);
      lfo.stop(now + durationSec * 1.3);
      osc.stop(now + durationSec * 1.3);
    }
  };

  // Keyboard hotkey listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const keyChar = e.key.toUpperCase();
      const matched = KEYS.find((k) => k.hotkey === keyChar);
      if (matched && !e.repeat) {
        playNote(matched.freq, matched.note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [instrument, volume]);

  // Real-time Oscilloscope Canvas
  const startVisualizer = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animFrameIdRef.current = requestAnimationFrame(render);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = '#05060A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#00F0FF';
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 8;
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    render();
  };

  useEffect(() => {
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // Preset Melodies
  const playPresetMelody = (melody: { note: string; delay: number }[]) => {
    initAudio();
    melody.forEach((item) => {
      setTimeout(() => {
        const k = KEYS.find((x) => x.note === item.note);
        if (k) playNote(k.freq, k.note);
      }, item.delay);
    });
  };

  const playCyberRiff = () => {
    const riff = [
      { note: 'C4', delay: 0 },
      { note: 'E4', delay: 180 },
      { note: 'G4', delay: 360 },
      { note: 'B4', delay: 540 },
      { note: 'C5', delay: 720 },
      { note: 'B4', delay: 900 },
      { note: 'G4', delay: 1080 },
      { note: 'C4', delay: 1260 },
    ];
    playPresetMelody(riff);
  };

  const playInterstellarArp = () => {
    const arp = [
      { note: 'A4', delay: 0 },
      { note: 'E4', delay: 240 },
      { note: 'A4', delay: 480 },
      { note: 'C5', delay: 720 },
      { note: 'B4', delay: 960 },
      { note: 'E4', delay: 1200 },
      { note: 'G4', delay: 1440 },
      { note: 'A4', delay: 1680 },
    ];
    playPresetMelody(arp);
  };

  return (
    <div className="rounded-2xl cyber-panel border border-[#00F0FF]/35 p-5 sm:p-7 shadow-[0_0_35px_rgba(0,240,255,0.09)]">
      {/* Title & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00FFA3] animate-pulse" />
          <h3 className="font-mono text-sm sm:text-base font-bold text-white tracking-wider">
            ACOUSTIC LAB // <span className="text-[#00F0FF]">WEB AUDIO SYNTHESIZER &amp; PIANO</span>
          </h3>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={playCyberRiff}
            className="px-3 py-1.5 rounded-xl bg-[#0A0E1A] hover:bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30 transition-all"
          >
            ▶ CYBER ARPEGGIO
          </button>
          <button
            onClick={playInterstellarArp}
            className="px-3 py-1.5 rounded-xl bg-[#0A0E1A] hover:bg-[#A855F7]/20 text-[#C084FC] border border-[#A855F7]/30 transition-all"
          >
            ▶ INTERSTELLAR THEME
          </button>
        </div>
      </div>

      {/* Controls & Instrument Selector */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center font-mono text-xs">
        {/* Instrument Selector */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-[#070A14] border border-slate-800">
          <span className="text-slate-400 text-[10px] pl-1 font-bold">INSTRUMENT:</span>
          {(['piano', 'synth', 'violin'] as SoundInstrument[]).map((inst) => (
            <button
              key={inst}
              onClick={() => setInstrument(inst)}
              className={`flex-1 py-1 rounded-lg uppercase tracking-wider text-[11px] font-bold transition-all ${
                instrument === inst
                  ? 'bg-[#00F0FF] text-black shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {inst === 'piano' ? '🎹 PIANO' : inst === 'synth' ? '⚡ SYNTH' : '🎻 VIOLIN'}
            </button>
          ))}
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#070A14] border border-slate-800">
          <span className="text-slate-400 text-[10px] font-bold">GAIN:</span>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full accent-[#00F0FF] cursor-pointer"
          />
          <span className="text-[#00F0FF] text-[11px] font-bold w-9">
            {Math.round(volume * 100)}%
          </span>
        </div>

        {/* Hotkey Helper Notice */}
        <div className="p-2.5 rounded-xl bg-[#070A14] border border-slate-800 text-slate-400 text-[11px] text-center">
          <span className="text-[#00FFA3] font-bold">Tip:</span> Play notes using your computer keys{' '}
          <span className="text-white font-mono font-bold">[A, S, D, F, G, H, J, K]</span>
        </div>
      </div>

      {/* Real-Time Waveform Oscilloscope Display */}
      <div className="mt-5 rounded-xl overflow-hidden border border-[#00F0FF]/25 bg-[#05060A] relative h-20 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
        <canvas
          ref={canvasRef}
          width={680}
          height={80}
          className="w-full h-full block"
        />
        <div className="absolute top-2 left-3 font-mono text-[9px] text-[#00F0FF]/70 tracking-widest pointer-events-none">
          OSCILLOSCOPE // REAL-TIME FREQUENCY TRACE
        </div>
      </div>

      {/* Piano Keyboard */}
      <div className="mt-6 flex justify-center items-end select-none overflow-x-auto pb-2">
        <div className="relative flex h-48 bg-[#05060A] p-2 rounded-2xl border border-slate-800 shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
          {KEYS.filter((k) => !k.isBlack).map((whiteKey) => {
            const isPlaying = activeNotes.has(whiteKey.note);
            return (
              <button
                key={whiteKey.note}
                onClick={() => playNote(whiteKey.freq, whiteKey.note)}
                className={`relative w-12 sm:w-14 h-44 rounded-b-xl border border-slate-400 transition-all duration-75 flex flex-col justify-end items-center pb-3 ${
                  isPlaying
                    ? 'bg-gradient-to-t from-[#00F0FF] to-white shadow-[0_0_25px_#00F0FF] translate-y-1'
                    : 'bg-gradient-to-b from-white to-slate-200 hover:from-white hover:to-slate-100'
                }`}
              >
                <span className="font-mono font-bold text-xs text-black">
                  {whiteKey.note}
                </span>
                <span className="font-mono text-[10px] text-slate-500 font-semibold">
                  [{whiteKey.hotkey}]
                </span>
              </button>
            );
          })}

          {/* Black Keys Positioned Absolutely */}
          <div className="absolute top-2 left-2 flex pointer-events-none">
            {/* White key width is approx 48px or 56px */}
            {/* Positions of black keys relative to white keys:
                C#4 (between C4 and D4): index 0
                D#4 (between D4 and E4): index 1
                F#4 (between F4 and G4): index 3
                G#4 (between G4 and A4): index 4
                A#4 (between A4 and B4): index 5
            */}
            {[
              { note: 'C#4', left: 'w-12 sm:w-14', offset: 34, hotkey: 'W' },
              { note: 'D#4', left: 'w-12 sm:w-14', offset: 88, hotkey: 'E' },
              { note: 'F#4', left: 'w-12 sm:w-14', offset: 198, hotkey: 'T' },
              { note: 'G#4', left: 'w-12 sm:w-14', offset: 252, hotkey: 'Y' },
              { note: 'A#4', left: 'w-12 sm:w-14', offset: 308, hotkey: 'U' },
            ].map((blackKey) => {
              const matched = KEYS.find((k) => k.note === blackKey.note)!;
              const isPlaying = activeNotes.has(blackKey.note);

              return (
                <button
                  key={blackKey.note}
                  onClick={() => playNote(matched.freq, matched.note)}
                  style={{ left: `${blackKey.offset}px` }}
                  className={`absolute pointer-events-auto top-0 w-7 sm:w-8 h-28 rounded-b-lg border border-slate-700 transition-all duration-75 flex flex-col justify-end items-center pb-2 z-20 ${
                    isPlaying
                      ? 'bg-gradient-to-t from-[#9D00FF] to-[#00F0FF] shadow-[0_0_20px_#9D00FF] translate-y-1'
                      : 'bg-gradient-to-b from-[#1E293B] to-[#0A0C16] hover:from-[#334155] hover:to-[#0A0C16]'
                  }`}
                >
                  <span className="font-mono text-[9px] text-[#00F0FF] font-bold">
                    {blackKey.note}
                  </span>
                  <span className="font-mono text-[8px] text-slate-400">
                    [{blackKey.hotkey}]
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

