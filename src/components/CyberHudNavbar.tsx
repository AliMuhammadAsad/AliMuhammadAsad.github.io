'use client';

import { useState, useEffect } from 'react';

export default function CyberHudNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: '01 // HERO', href: '#hero' },
    { label: '02 // ALIF_LLM', href: '#alif' },
    { label: '03 // RESEARCH', href: '#research' },
    { label: '04 // PROJECTS', href: '#projects' },
    { label: '05 // TERMINAL', href: '#terminal' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#05060A]/90 backdrop-blur-md border-b border-[#00F0FF]/20 shadow-[0_4px_25px_rgba(0,240,255,0.08)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Callout */}
        <a
          href="#hero"
          className="flex items-center gap-3 group text-decoration-none"
        >
          <div className="w-3 h-3 rounded-full bg-[#00FFA3] animate-pulse shadow-[0_0_8px_#00FFA3]" />
          <div className="flex flex-col">
            <span className="font-mono text-xs text-[#00F0FF] tracking-widest font-bold group-hover:text-white transition-colors">
              ALI_MUHAMMAD_ASAD // HUD
            </span>
            <span className="font-mono text-[9px] text-slate-400 tracking-wider">
              SYS.VER: 16.4.3 • LOC: 24.86° N, 67.00° E
            </span>
          </div>
        </a>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 font-mono text-xs">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 text-slate-300 hover:text-[#00F0FF] hover:bg-[#00F0FF]/10 rounded border border-transparent hover:border-[#00F0FF]/30 transition-all duration-200 tracking-wider"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right HUD Telemetry Pill */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#0A0E1A]/80 border border-[#9D00FF]/40 rounded-full font-mono text-[11px] text-[#C084FC]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9D00FF] animate-ping" />
            <span>AGENTIC_MODE: ACTIVE</span>
          </div>

          <a
            href="https://github.com/AliMuhammadAsad"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 font-mono text-xs font-semibold text-black bg-[#00F0FF] hover:bg-white rounded transition-all duration-200 shadow-[0_0_12px_rgba(0,240,255,0.4)]"
          >
            GITHUB &rarr;
          </a>
        </div>
      </div>
    </header>
  );
}

