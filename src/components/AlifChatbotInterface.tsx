'use client';

import { useState } from 'react';

interface ChatMessage {
  sender: 'user' | 'alif' | 'system';
  text: string;
}

export default function AlifChatbotInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'system',
      text: 'NOTICE: ALIF-1B weights are currently offline due to serverless browser runtime resource constraints (~2.1 GB FP16 weights). Models were trained on DGX & Habib HPC clusters.',
    },
    {
      sender: 'alif',
      text: 'السلام علیکم! میں الف (ALIF) ہوں۔ میں اردو زبان کے لیے تیار کیا گیا لارج لینگویج ماڈل ہوں۔ آپ مجھ سے ماڈل کے آرکیٹیکچر، 33GB ڈیٹاسیٹ یا ٹوکنائزر کے بارے میں پوچھ سکتے ہیں۔',
    },
  ]);
  const [inputVal, setInputVal] = useState('');

  const quickPrompts = [
    'What is ALIF architecture?',
    'Explain the 33GB Urdu corpus',
    'Why SentencePiece 32k vocab?',
  ];

  const handleSend = (userText: string) => {
    if (!userText.trim()) return;

    const newMsgs: ChatMessage[] = [
      ...messages,
      { sender: 'user', text: userText },
    ];

    let botReply = '';
    const lower = userText.toLowerCase();

    if (lower.includes('architecture') || lower.includes('model')) {
      botReply =
        'ALIF is built on a GPT-style decoder-only transformer architecture with multi-head self-attention. We trained two variants: a 100M parameter model and a 1B parameter model, optimized specifically for Urdu syntactic and morphological structures.';
    } else if (lower.includes('corpus') || lower.includes('data')) {
      botReply =
        'The ALIF pre-training dataset consists of 33GB of cleaned, deduplicated textual Urdu data curated across Urdu Wikipedia, news portals, poetry archives, and literature repositories using custom distributed scrapers.';
    } else if (lower.includes('tokenizer') || lower.includes('vocab')) {
      botReply =
        'ALIF uses a 32,000 vocabulary SentencePiece BPE tokenizer (llama_newsplit_32kvoc_32000) that merges Urdu prefixes and common roots, reducing token bloat by over 70% compared to legacy multilingual tokenizers.';
    } else {
      botReply =
        'While our 1B model weights are currently offline due to browser memory limits, our evaluations proved higher BLEU/ROUGE scores on Urdu QA, Sentiment Analysis, and Grammar Error Correction (GEC) compared to larger base models.';
    }

    newMsgs.push({ sender: 'alif', text: botReply });
    setMessages(newMsgs);
    setInputVal('');
  };

  return (
    <div className="rounded-xl cyber-panel border border-[#9D00FF]/40 p-4 sm:p-5 flex flex-col justify-between h-full bg-[#05060A]/90">
      {/* Chat Titlebar */}
      <div className="pb-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-mono text-xs text-white font-bold tracking-wider">
            ALIF-1B // INFERENCE CONSOLE
          </span>
        </div>

        <div className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 font-mono text-[10px] text-amber-300">
          WEIGHTS OFFLINE (RESOURCE CONSTRAINTS)
        </div>
      </div>

      {/* Messages Stream */}
      <div className="my-3 space-y-2.5 max-h-60 overflow-y-auto pr-1 text-xs font-sans">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`p-2.5 rounded-lg leading-relaxed ${
              m.sender === 'user'
                ? 'bg-[#00F0FF]/15 text-[#E0F2FE] ml-6 border border-[#00F0FF]/30 text-right'
                : m.sender === 'alif'
                ? 'bg-[#9D00FF]/15 text-[#F3E8FF] mr-6 border border-[#9D00FF]/30'
                : 'bg-amber-950/30 text-amber-300 text-[11px] font-mono border border-amber-900/50'
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-2 py-0.5 rounded-full bg-[#0A0E1A] border border-slate-800 text-[10px] font-mono text-slate-400 hover:text-[#00F0FF] hover:border-[#00F0FF]/40 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputVal);
        }}
        className="flex items-center gap-2 pt-2 border-t border-slate-800"
      >
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ask about ALIF architecture or dataset..."
          className="flex-1 bg-[#05060A] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#9D00FF] font-mono placeholder-slate-600"
        />
        <button
          type="submit"
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#9D00FF] to-[#7000FF] text-white font-mono text-xs font-bold hover:brightness-110 transition-all shadow-[0_0_12px_rgba(157,0,255,0.4)]"
        >
          SEND
        </button>
      </form>
    </div>
  );
}

