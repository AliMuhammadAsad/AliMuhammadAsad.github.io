'use client';

import { useState, useMemo } from 'react';
import {
  universalTokenizer,
  TokenChunk,
  TokenizerStats,
  SupportedTokenizerModel,
  TOKENIZER_MODELS,
} from '@/lib/alifTokenizer';

const CHIP_COLORS = [
  {
    bg: 'rgba(0, 240, 255, 0.14)',
    border: '#00F0FF',
    text: '#E0F2FE',
  },
  {
    bg: 'rgba(168, 85, 247, 0.14)',
    border: '#A855F7',
    text: '#F3E8FF',
  },
  {
    bg: 'rgba(0, 255, 163, 0.14)',
    border: '#00FFA3',
    text: '#DCFCE7',
  },
  {
    bg: 'rgba(245, 158, 11, 0.14)',
    border: '#F59E0B',
    text: '#FEF3C7',
  },
  {
    bg: 'rgba(59, 130, 246, 0.14)',
    border: '#3B82F6',
    text: '#DBEAFE',
  },
  {
    bg: 'rgba(244, 63, 94, 0.14)',
    border: '#F43F5E',
    text: '#FFE4E6',
  },
  {
    bg: 'rgba(20, 184, 166, 0.14)',
    border: '#14B8A6',
    text: '#CCFBF1',
  },
  {
    bg: 'rgba(99, 102, 241, 0.14)',
    border: '#6366F1',
    text: '#E0E7FF',
  },
];

const PRESETS = [
  {
    label: '🇵🇰 Pakistan & Culture',
    text: 'پاکستان ایک خوبصورت اور تاریخی ملک ہے۔',
  },
  {
    label: '📚 Literature & Poetry',
    text: 'اردو ادب اور شاعری میں علامہ اقبال اور فیض احمد فیض کا مقام بے حد منفرد ہے۔',
  },
  {
    label: '🤖 AI & Transformers',
    text: 'مصنوعی ذہانت اور لارج لینگویج ماڈلز قدرتی زبان کو سمجھنے میں انقلاب لا رہے ہیں۔',
  },
  {
    label: '⚡ Bilingual Test',
    text: 'Ali Muhammad Asad: ریسرچ اور نیچرل لینگویج پروسیسنگ (ALIF LLM).',
  },
];

export default function UrduTokenizerSandbox() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCompareMode, setIsCompareMode] = useState(true);

  // Models
  const [modelA, setModelA] = useState<SupportedTokenizerModel>('alif-llama-32k');
  const [modelB, setModelB] = useState<SupportedTokenizerModel>('gpt4o-o200k');

  // Input
  const [inputText, setInputText] = useState(PRESETS[0].text);
  const [selectedToken, setSelectedToken] = useState<TokenChunk | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const isUrdu = useMemo(() => /[\u0600-\u06FF]/.test(inputText), [inputText]);

  // Model A tokens & stats
  const tokensA = useMemo(
    () => universalTokenizer.encode(inputText, modelA),
    [inputText, modelA]
  );
  const statsA: TokenizerStats = useMemo(
    () => universalTokenizer.computeStats(inputText, tokensA),
    [inputText, tokensA]
  );

  // Model B tokens & stats (for compare mode)
  const tokensB = useMemo(
    () => universalTokenizer.encode(inputText, modelB),
    [inputText, modelB]
  );
  const statsB: TokenizerStats = useMemo(
    () => universalTokenizer.computeStats(inputText, tokensB),
    [inputText, tokensB]
  );

  const handleCopy = () => {
    const ids = tokensA.map((t) => t.id).join(', ');
    navigator.clipboard.writeText(`[${ids}]`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getModelName = (id: SupportedTokenizerModel) => {
    return TOKENIZER_MODELS.find((m) => m.id === id)?.name || id;
  };

  return (
    <div className="rounded-2xl cyber-panel border border-[#00F0FF]/35 p-4 sm:p-6 shadow-[0_0_35px_rgba(0,240,255,0.08)] font-sans transition-all">
      {/* Title & Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] animate-ping" />
          <h3 className="font-mono text-sm sm:text-base font-bold text-white tracking-wider">
            TOKENIZER PLAYGROUND // <span className="text-[#00F0FF]">ALIF 32K &amp; COMPARISON HUB</span>
          </h3>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          {/* Comparison Mode Toggle */}
          <button
            onClick={() => setIsCompareMode(!isCompareMode)}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              isCompareMode
                ? 'bg-[#9D00FF]/25 border-[#9D00FF] text-[#C084FC] shadow-[0_0_12px_rgba(157,0,255,0.3)]'
                : 'bg-[#0A0E1A] border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isCompareMode ? 'DUAL COMPARE [ON]' : 'COMPARE [OFF]'}
          </button>

          {/* Copy Token IDs */}
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-[#0A0E1A] hover:bg-[#00F0FF]/20 text-slate-300 hover:text-[#00F0FF] rounded-lg border border-slate-700 transition-colors"
          >
            {isCopied ? '✓ COPIED' : 'COPY IDS'}
          </button>

          {/* Minimize / Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="px-3 py-1.5 bg-[#0A0E1A] hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 font-mono font-bold transition-colors"
            title={isCollapsed ? 'Expand Playground' : 'Minimize Playground'}
          >
            {isCollapsed ? '[+] EXPAND' : '[-] MINIMIZE'}
          </button>
        </div>
      </div>

      {/* Collapsible Body */}
      {!isCollapsed && (
        <div className="mt-4 space-y-5 animate-in fade-in duration-200">
          {/* Presets Row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-slate-400">TEST PRESETS:</span>
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(preset.text);
                  setSelectedToken(null);
                }}
                className="px-3 py-1 text-xs rounded-full bg-[#0A0E1A] border border-slate-800 hover:border-[#00F0FF]/50 text-slate-300 hover:text-white transition-all font-mono"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Input Text Area */}
          <div>
            <label className="block font-mono text-[11px] text-slate-400 mb-1">
              INPUT PROMPT STREAM (TYPE URDU OR ENGLISH):
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="یہاں اردو یا انگریزی متن درج کریں..."
              rows={2}
              dir={isUrdu ? 'rtl' : 'ltr'}
              className={`w-full p-3.5 rounded-xl bg-[#05060A] border border-slate-800 focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] text-white outline-none resize-y transition-all ${
                isUrdu ? 'text-lg font-serif' : 'text-sm font-mono'
              }`}
            />
          </div>

          {/* Model Selector Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            {/* Model A Selector */}
            <div className="p-3 rounded-xl bg-[#070A14] border border-[#00F0FF]/30">
              <label className="block text-[#00F0FF] text-[10px] mb-1 font-bold">
                {isCompareMode ? 'MODEL A (BENCHMARK):' : 'ACTIVE TOKENIZER:'}
              </label>
              <select
                value={modelA}
                onChange={(e) =>
                  setModelA(e.target.value as SupportedTokenizerModel)
                }
                className="w-full bg-[#05060A] text-white border border-slate-700 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#00F0FF]"
              >
                {TOKENIZER_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} [{m.badge}]
                  </option>
                ))}
              </select>
            </div>

            {/* Model B Selector (If compare mode active) */}
            {isCompareMode && (
              <div className="p-3 rounded-xl bg-[#070A14] border border-[#9D00FF]/30">
                <label className="block text-[#C084FC] text-[10px] mb-1 font-bold">
                  MODEL B (COMPARISON TARGET):
                </label>
                <select
                  value={modelB}
                  onChange={(e) =>
                    setModelB(e.target.value as SupportedTokenizerModel)
                  }
                  className="w-full bg-[#05060A] text-white border border-slate-700 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#9D00FF]"
                >
                  {TOKENIZER_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} [{m.badge}]
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Comparison Delta Callout */}
          {isCompareMode && (
            <div className="p-3 rounded-xl bg-[#0A0E1A] border border-slate-800 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#00FFA3] font-bold">&gt;&gt; COMPARISON DELTA:</span>
                <span className="text-white">
                  {getModelName(modelA)}: <b className="text-[#00F0FF]">{tokensA.length} tokens</b> vs.{' '}
                  {getModelName(modelB)}: <b className="text-[#C084FC]">{tokensB.length} tokens</b>
                </span>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/30 text-[11px] font-bold">
                {tokensA.length <= tokensB.length
                  ? `${Math.abs(tokensB.length - tokensA.length)} fewer tokens with ${getModelName(modelA)}!`
                  : `${Math.abs(tokensA.length - tokensB.length)} fewer tokens with ${getModelName(modelB)}!`}
              </div>
            </div>
          )}

          {/* Tokens Display Section */}
          <div className={`grid ${isCompareMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-4`}>
            {/* View A */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-[#00F0FF] font-semibold">
                  {getModelName(modelA)} ({tokensA.length} tokens &bull; {statsA.bytesPerToken} B/T)
                </span>
                <span className="text-slate-500 text-[10px]">
                  {statsA.byteCount} Bytes total
                </span>
              </div>

              <div
                dir={isUrdu ? 'rtl' : 'ltr'}
                className="p-3.5 rounded-xl bg-[#05060A] border border-[#00F0FF]/25 min-h-[90px] flex flex-wrap gap-1.5 items-center content-start"
              >
                {tokensA.length === 0 ? (
                  <span className="text-slate-600 font-mono text-xs">Waiting for input...</span>
                ) : (
                  tokensA.map((token, idx) => {
                    const color = CHIP_COLORS[token.colorIndex];
                    const isSelected = selectedToken === token;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedToken(token)}
                        style={{
                          backgroundColor: isSelected ? color.border : color.bg,
                          borderColor: color.border,
                          color: isSelected ? '#000' : color.text,
                        }}
                        className="px-2 py-0.5 rounded-lg border text-sm font-medium transition-all hover:scale-105"
                        title={`ID: #${token.id} | Bytes: ${token.byteLength}`}
                      >
                        {token.text.replace(/ /g, '␣')}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* View B (in Compare Mode) */}
            {isCompareMode && (
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-[#C084FC] font-semibold">
                    {getModelName(modelB)} ({tokensB.length} tokens &bull; {statsB.bytesPerToken} B/T)
                  </span>
                  <span className="text-slate-500 text-[10px]">
                    {statsB.byteCount} Bytes total
                  </span>
                </div>

                <div
                  dir={isUrdu ? 'rtl' : 'ltr'}
                  className="p-3.5 rounded-xl bg-[#05060A] border border-[#9D00FF]/25 min-h-[90px] flex flex-wrap gap-1.5 items-center content-start"
                >
                  {tokensB.length === 0 ? (
                    <span className="text-slate-600 font-mono text-xs">Waiting for input...</span>
                  ) : (
                    tokensB.map((token, idx) => {
                      const color = CHIP_COLORS[token.colorIndex];
                      const isSelected = selectedToken === token;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedToken(token)}
                          style={{
                            backgroundColor: isSelected ? color.border : color.bg,
                            borderColor: color.border,
                            color: isSelected ? '#000' : color.text,
                          }}
                          className="px-2 py-0.5 rounded-lg border text-sm font-medium transition-all hover:scale-105"
                          title={`ID: #${token.id} | Bytes: ${token.byteLength}`}
                        >
                          {token.text.replace(/ /g, '␣')}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Token Details Inspector Bar */}
          {selectedToken && (
            <div className="p-3 rounded-xl bg-[#070A14] border border-[#00F0FF]/40 font-mono text-xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-[10px]">INSPECTED TOKEN:</span>
                <span className="text-base font-bold text-white px-2.5 py-0.5 rounded-md bg-black/60 border border-slate-700">
                  &ldquo;{selectedToken.text}&rdquo;
                </span>
                <span className="text-[#00F0FF]">ID: #{selectedToken.id}</span>
                <span className="text-[#00FFA3]">Size: {selectedToken.byteLength} B</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Bytes: [{selectedToken.bytes.join(', ')}]
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
