'use client';

import { useState } from 'react';

export default function ResearchSection() {
  const [activeTab, setActiveTab] = useState<'pashto' | 'pan' | 'crispr' | 'graph'>('pashto');

  const tabs = [
    { id: 'pashto', label: '01 // IEEE PASHTO POETRY' },
    { id: 'pan', label: '02 // PAN 2025 STYLE DETECTION' },
    { id: 'crispr', label: '03 // CRISPR-CAS13 BAYESIAN NETS' },
    { id: 'graph', label: '04 // GRAPH DB BENCHMARKS' },
  ] as const;

  return (
    <section id="research" className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-6xl mx-auto">
        {/* Section Heading */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px bg-gradient-to-r from-transparent via-[#9D00FF] to-transparent flex-1" />
          <span className="font-mono text-xs text-[#C084FC] tracking-widest uppercase">
            [ RESEARCH LAB // PUBLICATIONS &amp; EMPIRICAL STUDIES ]
          </span>
          <div className="h-px bg-gradient-to-r from-transparent via-[#9D00FF] to-transparent flex-1" />
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold font-mono text-white">
            RESEARCH &amp; PAPERS
          </h2>
          <p className="mt-2 text-slate-400 font-sans max-w-2xl mx-auto text-sm sm:text-base">
            From low-resource NLP to probabilistic biological modeling and database benchmarking.
          </p>
        </div>

        {/* Tab Selection Row */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 font-mono text-xs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-lg border transition-all duration-200 tracking-wider ${
                activeTab === tab.id
                  ? 'bg-[#9D00FF]/20 border-[#9D00FF] text-white shadow-[0_0_15px_rgba(157,0,255,0.3)]'
                  : 'bg-[#0A0E1A]/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        <div className="p-6 sm:p-8 rounded-2xl cyber-panel border border-[#9D00FF]/30">
          {activeTab === 'pashto' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-[#00F0FF]">
                <span>IEEE XPLORE PUBLICATION // DIGITAL OBJECT IDENTIFIER: 11318475</span>
                <a
                  href="https://ieeexplore.ieee.org/document/11318475"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00FFA3] hover:underline"
                >
                  View on IEEE Xplore &rarr;
                </a>
              </div>
              <h3 className="text-2xl font-mono font-bold text-white">
                Pashto Poetry Attribution using Deep Learning Techniques
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Curated the first-ever dataset on Pashto poetry containing 35,000+ couplets across 35 poets. 
                Engineered a custom data augmentation strategy (random deletion and swap) tailored for low-resource NLP. 
                Evaluated ML, Bi-LSTM, and Transformer models, with Random Forest achieving 85.25% accuracy.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 bg-[#05060A] border border-slate-800 rounded-full font-mono text-[11px] text-slate-300">
                  35,000+ Couplets
                </span>
                <span className="px-3 py-1 bg-[#05060A] border border-slate-800 rounded-full font-mono text-[11px] text-[#00FFA3]">
                  85.25% Accuracy
                </span>
                <span className="px-3 py-1 bg-[#05060A] border border-slate-800 rounded-full font-mono text-[11px] text-[#38BDF8]">
                  IEEE Xplore
                </span>
              </div>
            </div>
          )}

          {activeTab === 'pan' && (
            <div className="space-y-4">
              <div className="font-mono text-xs text-[#A855F7]">
                PAN 2025 // MULTI-AUTHOR STYLE DETECTION TASK
              </div>
              <h3 className="text-2xl font-mono font-bold text-white">
                Multi-Author Style Detection Analysis using Foundation LLMs
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Fine-tuned transformer models including BERT, RoBERTa, DeBERTa, Llama, and Gemma on multi-author text corpora. 
                Achieved ~90% accuracy in detecting boundary transitions between distinct authors in collaborative texts.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 bg-[#05060A] border border-slate-800 rounded-full font-mono text-[11px] text-slate-300">
                  DeBERTa &bull; RoBERTa &bull; Llama
                </span>
                <span className="px-3 py-1 bg-[#05060A] border border-slate-800 rounded-full font-mono text-[11px] text-[#00FFA3]">
                  ~90% Accuracy
                </span>
              </div>
            </div>
          )}

          {activeTab === 'crispr' && (
            <div className="space-y-4">
              <div className="font-mono text-xs text-[#00FFA3]">
                PROBABILISTIC GRAPHICAL MODELS // COMPUTATIONAL BIOLOGY
              </div>
              <h3 className="text-2xl font-mono font-bold text-white">
                Structured Learning on Bayesian Networks for CRISPR-Cas13 Systems
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Modeled guide RNA efficiency for CRISPR-Cas13 systems using Directed Acyclic Graphs (DAGs). 
                Implemented the Hill Climbing algorithm in Python (pgmpy) for structured learning from experimental cleavage data.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 bg-[#05060A] border border-slate-800 rounded-full font-mono text-[11px] text-slate-300">
                  Bayesian Networks
                </span>
                <span className="px-3 py-1 bg-[#05060A] border border-slate-800 rounded-full font-mono text-[11px] text-[#00F0FF]">
                  Hill Climbing Algorithm
                </span>
                <span className="px-3 py-1 bg-[#05060A] border border-slate-800 rounded-full font-mono text-[11px] text-[#C084FC]">
                  pgmpy
                </span>
              </div>
            </div>
          )}

          {activeTab === 'graph' && (
            <div className="space-y-4">
              <div className="font-mono text-xs text-[#38BDF8]">
                UNDERGRADUATE RESEARCH // DATABASE SYSTEMS BENCHMARK
              </div>
              <h3 className="text-2xl font-mono font-bold text-white">
                Empirical Performance Study of Graph Database Engines
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Conducted an independent empirical benchmarking study comparing Neo4j, MemGraph, RedisGraph, and ApacheHugeGraph. 
                Utilized the LDBC Social Network Benchmark (SNB) suite to assess latency, throughput, and query optimization under multi-hop traversal workloads.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 bg-[#05060A] border border-slate-800 rounded-full font-mono text-[11px] text-slate-300">
                  LDBC SNB
                </span>
                <span className="px-3 py-1 bg-[#05060A] border border-slate-800 rounded-full font-mono text-[11px] text-[#38BDF8]">
                  Neo4j vs. MemGraph vs. RedisGraph
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

