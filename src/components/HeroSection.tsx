'use client';

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-5xl mx-auto w-full relative z-10">
        {/* Tactical HUD Outer Frame */}
        <div className="relative p-6 sm:p-10 rounded-xl cyber-panel">
          {/* Corner Tech Reticles */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#00F0FF]" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#9D00FF]" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#9D00FF]" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#00F0FF]" />

          {/* Sub Header / Transmission Readout */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-6 border-b border-slate-800 font-mono text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse" />
              <span className="text-[#00FFA3] font-bold">[TRANSMISSION: SECURE]</span>
              <span>// DEPT: AI & LLM ENGINEERING</span>
            </div>
            <div className="text-[#38BDF8]">
              HABIB_CS &bull; STANFORD_IHP_24 &bull; IEEE_AUTHOR
            </div>
          </div>

          {/* Hero Titles */}
          <div className="mt-8 space-y-4">
            <div className="inline-block px-3.5 py-1 bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded-full font-mono text-xs text-[#00F0FF] tracking-widest uppercase">
              Autonomous Systems &bull; Urdu NLP &bull; Process Automation
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-mono text-white">
              ALI MUHAMMAD <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#A855F7] to-[#00FFA3] text-glow-cyan">
                ASAD
              </span>
            </h1>

            <p className="max-w-2xl text-base sm:text-lg text-slate-300 font-sans leading-relaxed">
              AI Engineer &amp; Full Stack Developer specializing in{' '}
              <span className="text-[#00F0FF] font-mono font-medium">Agentic RAG</span>,{' '}
              <span className="text-[#C084FC] font-mono font-medium">Large Language Model Architectures</span>, and{' '}
              <span className="text-[#00FFA3] font-mono font-medium">Enterprise Process Automation</span>. 
              Computer Science Graduate from Habib University.
            </p>
          </div>

          {/* Action Hub */}
          <div className="mt-8 flex flex-wrap items-center gap-4 pt-6 border-t border-slate-800/80">
            <a
              href="#alif"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#38BDF8] text-black font-mono font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)]"
            >
              Explore ALIF LLM &rarr;
            </a>

            <a
              href="#projects"
              className="px-6 py-3 rounded-xl bg-[#0A0E1A] border border-[#9D00FF]/50 text-[#C084FC] font-mono font-bold text-xs uppercase tracking-widest hover:bg-[#9D00FF]/15 hover:border-[#9D00FF] transition-all"
            >
              View Projects Vault &rarr;
            </a>

            <a
              href="#career"
              className="px-5 py-3 rounded-xl bg-[#0A0E1A] border border-[#00FFA3]/50 text-[#00FFA3] font-mono font-bold text-xs uppercase tracking-widest hover:bg-[#00FFA3]/15 hover:border-[#00FFA3] transition-all"
            >
              Career &amp; Resume &rarr;
            </a>

            <a
              href="#terminal"
              className="px-5 py-3 rounded-xl bg-[#0A0E1A] border border-slate-700 text-slate-300 font-mono text-xs hover:border-[#00FFA3] hover:text-[#00FFA3] transition-all"
            >
              &gt; Launch CLI Terminal
            </a>
          </div>

          {/* Real-time Telemetry Bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 bg-[#05060A]/80 border border-slate-800 rounded">
              <span className="block text-slate-500 text-[10px]">PRETRAIN CORPUS</span>
              <span className="text-white font-bold text-sm">33 GB URDU</span>
            </div>
            <div className="p-3 bg-[#05060A]/80 border border-slate-800 rounded">
              <span className="block text-slate-500 text-[10px]">PUBLICATIONS</span>
              <span className="text-[#38BDF8] font-bold text-sm">IEEE Xplore</span>
            </div>
            <div className="p-3 bg-[#05060A]/80 border border-slate-800 rounded">
              <span className="block text-slate-500 text-[10px]">TEACHING ASSISTANT</span>
              <span className="text-[#A855F7] font-bold text-sm">12x Courses</span>
            </div>
            <div className="p-3 bg-[#05060A]/80 border border-slate-800 rounded">
              <span className="block text-slate-500 text-[10px]">STANFORD HONORS</span>
              <span className="text-[#00FFA3] font-bold text-sm">IHP &apos;24 Cohort</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

