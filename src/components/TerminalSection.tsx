'use client';

import { useState, useRef, useEffect } from 'react';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'system';
  text: string;
}

export default function TerminalSection() {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<TerminalLine[]>([
    {
      type: 'system',
      text: 'ALI_OS v3.8.4 [SECURITY CLEARANCE: PUBLIC_VISITOR]',
    },
    {
      type: 'system',
      text: 'Type "help" to display available terminal operations.',
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim().toLowerCase();
    if (!cmd) return;

    const newHistory: TerminalLine[] = [...history, { type: 'input', text: `$ ${inputVal}` }];

    switch (cmd) {
      case 'help':
        newHistory.push({
          type: 'output',
          text: `AVAILABLE COMMANDS:
  help              - List all available commands
  about             - Operative background dossier
  cat fyp           - Inspect ALIF Urdu Large Language Model details
  cat publications  - View IEEE published paper summary
  cat honors        - List Stanford IHP, ICPC, and Academic honors
  clear             - Clear terminal screen
  contact           - Display secure communication frequencies`,
        });
        break;

      case 'about':
        newHistory.push({
          type: 'output',
          text: `OPERATIVE: Ali Muhammad Asad
ROLE: AI & LLM Engineer | Full Stack Developer
ALMA MATER: Habib University (B.Sc. Computer Science, CGPA 3.71)
CURRENT: Data Associate @ Habib University (COO's Office)
FORMER: Asst. Manager Automations @ Alkaram Studio, MT @ Habib OIR`,
        });
        break;

      case 'cat fyp':
        newHistory.push({
          type: 'output',
          text: `PROJECT ALIF (الف):
- 33GB curated textual Urdu pre-training corpus
- Custom GPT-4 regex Byte Pair Encoding (BPE) tokenizer
- 100M and 1B parameter decoder models outperforming larger base models in Urdu downstream tasks`,
        });
        break;

      case 'cat publications':
        newHistory.push({
          type: 'output',
          text: `PUBLICATION: "Pashto Poetry Attribution using Deep Learning Techniques"
VENUE: IEEE Xplore (Doc ID: 11318475)
DATASET: 35,000+ couplets across 35 poets (First ever Pashto poetry dataset)
TOP ACCURACY: 85.25% (Random Forest) closely followed by Bi-LSTM`,
        });
        break;

      case 'cat honors':
        newHistory.push({
          type: 'output',
          text: `HONORS & RECOGNITION:
- Stanford International Honors Program 2024 (50% Merit Grant)
- ICPC Regional Qualifier Top 10 (GIKI Finals)
- 12x Teaching Assistantships across core CS courses at Habib University
- NSTC Mathematics Olympiad National Training Camp Selection`,
        });
        break;

      case 'contact':
        newHistory.push({
          type: 'output',
          text: `COMMUNICATION CHANNELS:
  Email    : alimuhammadasadlm10@gmail.com
  LinkedIn : https://www.linkedin.com/in/ali-muhammad-asad/
  Discord  : nightwing6973
  GitHub   : https://github.com/AliMuhammadAsad`,
        });
        break;

      case 'clear':
        setHistory([]);
        setInputVal('');
        return;

      default:
        newHistory.push({
          type: 'error',
          text: `Command not recognized: "${cmd}". Type "help" for a list of valid commands.`,
        });
    }

    setHistory(newHistory);
    setInputVal('');
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  return (
    <section id="terminal" className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-4xl mx-auto">
        {/* Section Heading */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent flex-1" />
          <span className="font-mono text-xs text-[#00F0FF] tracking-widest uppercase">
            [ INTERACTIVE // CLI TERMINAL DOCK ]
          </span>
          <div className="h-px bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent flex-1" />
        </div>

        {/* Terminal Window */}
        <div className="rounded-xl overflow-hidden border border-[#00F0FF]/30 bg-[#05060A]/95 shadow-[0_0_30px_rgba(0,240,255,0.15)] font-mono text-xs">
          {/* Terminal Titlebar */}
          <div className="px-4 py-2.5 bg-[#0A0E1A] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
              <span className="ml-2 text-slate-400 text-[11px]">ali@neural-deck: ~</span>
            </div>
            <span className="text-slate-500 text-[10px]">BASH // UTF-8</span>
          </div>

          {/* Terminal Body */}
          <div className="p-4 sm:p-6 min-h-[300px] max-h-[420px] overflow-y-auto space-y-2">
            {history.map((line, idx) => (
              <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                {line.type === 'input' && (
                  <span className="text-[#00F0FF] font-semibold">{line.text}</span>
                )}
                {line.type === 'output' && (
                  <span className="text-slate-300">{line.text}</span>
                )}
                {line.type === 'error' && (
                  <span className="text-red-400">{line.text}</span>
                )}
                {line.type === 'system' && (
                  <span className="text-slate-500 italic">{line.text}</span>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Terminal Input Form */}
          <form
            onSubmit={handleCommand}
            className="flex items-center px-4 py-2.5 bg-[#070913] border-t border-slate-800"
          >
            <span className="text-[#00FFA3] mr-2 font-bold">&gt;</span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="type help or cat fyp..."
              className="flex-1 bg-transparent text-white outline-none placeholder-slate-600 text-xs font-mono"
              autoFocus={false}
            />
            <button
              type="submit"
              className="text-slate-400 hover:text-[#00F0FF] text-[11px] ml-2 font-mono uppercase"
            >
              EXEC &crarr;
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

