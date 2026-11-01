'use client';

import UrduTokenizerSandbox from './UrduTokenizerSandbox';
import AlifChatbotInterface from './AlifChatbotInterface';

interface AlifSpotlightProps {
  onOpenMedia: (type: 'pdf' | 'image', url: string, title: string) => void;
}

export default function AlifSpotlightSection({ onOpenMedia }: AlifSpotlightProps) {
  return (
    <section id="alif" className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-6xl mx-auto">
        {/* Section Heading */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent flex-1" />
          <span className="font-mono text-xs text-[#00F0FF] tracking-widest uppercase">
            [ FLAGSHIP FYP // NATURAL LANGUAGE PROCESSING ]
          </span>
          <div className="h-px bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent flex-1" />
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold font-mono text-white">
            ALIF LLM <span className="text-[#00F0FF]">الف</span>
          </h2>
          <p className="mt-2 text-slate-400 font-sans max-w-2xl mx-auto text-sm sm:text-base">
            Urdu Generative Pre-Trained Large Language Model &bull; Flagship 32k SentencePiece Tokenizer &bull; 33GB Pretraining Corpus
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 font-mono text-xs">
            <a
              href="https://orature-ai.github.io/ALIF-LLM/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF] text-[#00F0FF] hover:bg-[#00F0FF] hover:text-black transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]"
            >
              ALIF ORATURE HUB &rarr;
            </a>

            <button
              onClick={() =>
                onOpenMedia(
                  'pdf',
                  '/docs/alif-kaavish-poster.pdf',
                  'ALIF Large Language Model - Kaavish FYP Research Poster'
                )
              }
              className="px-4 py-2 rounded-xl bg-[#0A0E1A] border border-slate-700 text-slate-300 hover:text-white hover:border-[#A855F7] transition-all flex items-center gap-2"
            >
              <span>📄 VIEW FYP POSTER [PDF]</span>
            </button>
          </div>
        </div>

        {/* Bento Grid for ALIF Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Corpus */}
          <div className="p-6 rounded-2xl cyber-panel flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between font-mono text-xs text-[#00FFA3] mb-2">
                <span>[01 // DATA_PIPELINE]</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#00FFA3]" />
              </div>
              <h3 className="text-xl font-mono font-bold text-white">
                33 GB Pre-training Corpus
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mt-2">
                Curated the largest dedicated textual Urdu pre-training dataset from multi-source web scrapers and high-throughput cleaning pipelines.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-2">
              <button
                onClick={() =>
                  onOpenMedia(
                    'image',
                    '/projects/alif/data_pipeline.png',
                    'ALIF 33GB Urdu Data Ingestion & Preprocessing Pipeline'
                  )
                }
                className="font-mono text-xs text-[#00FFA3] hover:underline flex items-center gap-1.5"
              >
                <span>🔍 Data Pipeline Diagram</span> &rarr;
              </button>
              <button
                onClick={() =>
                  onOpenMedia(
                    'image',
                    '/projects/alif/data_distribution.png',
                    'ALIF Dataset Distribution Across Literature & Web'
                  )
                }
                className="font-mono text-xs text-slate-400 hover:text-slate-200 hover:underline flex items-center gap-1.5"
              >
                <span>📊 Distribution Plot</span> &rarr;
              </button>
            </div>
          </div>

          {/* Card 2: Tokenizer */}
          <div className="p-6 rounded-2xl cyber-panel flex flex-col justify-between space-y-4 border-[#00F0FF]/40 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
            <div>
              <div className="flex items-center justify-between font-mono text-xs text-[#00F0FF] mb-2">
                <span>[02 // TOKENIZER]</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF]" />
              </div>
              <h3 className="text-xl font-mono font-bold text-white">
                Llama 32K Tokenizer
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mt-2">
                ALIF&apos;s flagship SentencePiece BPE model (32,000 vocab). Tailored for Urdu prefixes, roots, and compounds to eliminate token fragmentation.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={() =>
                  onOpenMedia(
                    'image',
                    '/projects/alif/tokenizer_comparison.png',
                    'Tokenizer Comparison: Average Token Counts & Compression'
                  )
                }
                className="font-mono text-xs text-[#00F0FF] hover:underline flex items-center gap-1.5"
              >
                <span>📊 Tokenizer Benchmark Bar Plot</span> &rarr;
              </button>
            </div>
          </div>

          {/* Card 3: Interactive Chatbot Console */}
          <div className="h-full">
            <AlifChatbotInterface />
          </div>
        </div>

        {/* Live Interactive Urdu Tokenizer Sandbox */}
        <UrduTokenizerSandbox />
      </div>
    </section>
  );
}
