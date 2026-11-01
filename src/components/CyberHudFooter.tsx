'use client';

export default function CyberHudFooter() {
  return (
    <footer className="relative z-10 border-t border-slate-900 bg-[#05060A]/90 py-10 px-4 sm:px-6 lg:px-8 font-mono text-xs">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse" />
          <span className="text-slate-400">
            ALI MUHAMMAD ASAD &bull; 2026 // ALL SYSTEMS GREEN
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <a
            href="https://github.com/AliMuhammadAsad"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#00F0FF] transition-colors"
          >
            GITHUB
          </a>
          <span>//</span>
          <a
            href="https://www.linkedin.com/in/ali-muhammad-asad/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#00F0FF] transition-colors"
          >
            LINKEDIN
          </a>
          <span>//</span>
          <a
            href="mailto:alimuhammadasadlm10@gmail.com"
            className="hover:text-[#00FFA3] transition-colors"
          >
            EMAIL
          </a>
        </div>
      </div>
    </footer>
  );
}

