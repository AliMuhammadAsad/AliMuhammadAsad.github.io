'use client';

import Image from 'next/image';
import CyberSynthPiano from './CyberSynthPiano';

interface GamingTitle {
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  tags: string[];
  icon?: string;
}

export default function OfflineAliSection() {
  const games: GamingTitle[] = [
    {
      title: 'Minecraft',
      badge: 'SANDBOX ARCHITECT',
      badgeColor: '#00FFA3',
      description:
        'Redstone logical circuits, automated resource farms, megastructures, and late-game procedural survival engineering.',
      tags: ['Redstone Logic', 'Automation', 'Megastructures', 'Survival'],
      icon: '/assets/hobbies/minecraft-1-logo-png-transparent.png',
    },
    {
      title: 'Rocket League',
      badge: 'SUPERSONIC ACROBAT',
      badgeColor: '#00F0FF',
      description:
        'Fast-aerial physics, directional air-roll control, flip resets, speed-flips, and tactical field rotations.',
      tags: ['Aerial Mechanics', 'Field Rotation', 'Speed-Flips', 'Physics'],
      icon: '/assets/hobbies/rocketleague.png',
    },
    {
      title: 'Hollow Knight & Silksong',
      badge: 'HALLOWNEST VESSEL',
      badgeColor: '#C084FC',
      description:
        'Metroidvania mastery: high-reflex nail pogoing, soul management, pantheon boss rushes, and eager anticipation for Pharloom.',
      tags: ['Nail Pogo', 'Pantheon Boss Rush', 'Metroidvania', 'Silksong'],
    },
    {
      title: "No Man's Sky",
      badge: 'INTERSTELLAR EXPLORER',
      badgeColor: '#38BDF8',
      description:
        'Procedural planetary discovery, starship fleet administration, deep warp traversal, and orbital base architecture.',
      tags: ['Procedural Cosmos', 'Fleet Command', 'Orbital Bases', 'Warp Drive'],
    },
    {
      title: 'Valorant',
      badge: 'TACTICAL INITIATOR',
      badgeColor: '#F43F5E',
      description:
        'Strategic agent utility deployment, disciplined crosshair placement, trade fragging, and clutch site retakes.',
      tags: ['Crosshair Discipline', 'Site Retakes', 'Utility Sync', 'FPS'],
    },
    {
      title: 'Table Tennis',
      badge: 'ACOUSTIC ATHLETE',
      badgeColor: '#F59E0B',
      description:
        'Fast reflex counter-drives, heavy topspin third-ball loops, backhand flicks, and spin variation.',
      tags: ['Topspin Loops', 'Backhand Flicks', 'Reflex Rallies', 'Sports'],
      icon: '/assets/hobbies/ping-pong.png',
    },
  ];

  return (
    <section id="offline" className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Heading */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px bg-gradient-to-r from-transparent via-[#9D00FF] to-transparent flex-1" />
            <span className="font-mono text-xs text-[#C084FC] tracking-widest uppercase">
              [ SUBROUTINE // THE OFFLINE ALI MATRIX ]
            </span>
            <div className="h-px bg-gradient-to-r from-transparent via-[#9D00FF] to-transparent flex-1" />
          </div>

          <div className="text-center">
            <h2 className="text-3xl sm:text-5xl font-extrabold font-mono text-white">
              ACOUSTICS &amp; RECREATION
            </h2>
            <p className="mt-2 text-slate-400 font-sans max-w-2xl mx-auto text-sm sm:text-base">
              When models finish training and the terminal compiles: piano harmonies, violin bowing, procedural universes &amp; competitive mechanics.
            </p>
          </div>
        </div>

        {/* 1. Interactive Web Audio Synthesizer & Piano */}
        <CyberSynthPiano />

        {/* 2. Cyber Gaming Holographic Reel */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] animate-pulse" />
              <h3 className="font-mono text-sm sm:text-base font-bold text-white tracking-wider">
                GAMING DECK // <span className="text-[#00F0FF]">COGNITIVE MECHANICS &amp; EXPLORATION</span>
              </h3>
            </div>
            <span className="font-mono text-xs text-slate-500 hidden sm:inline">
              SELECT TITLE TO VIEW ATTRIBUTES
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {games.map((g, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl cyber-panel flex flex-col justify-between group hover:border-[#00F0FF]/50 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      style={{
                        color: g.badgeColor,
                        borderColor: `${g.badgeColor}40`,
                        backgroundColor: `${g.badgeColor}12`,
                      }}
                      className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border"
                    >
                      {g.badge}
                    </span>

                    {g.icon && (
                      <div className="relative w-6 h-6 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Image
                          src={g.icon}
                          alt={g.title}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    )}
                  </div>

                  <h4 className="text-lg font-mono font-bold text-white group-hover:text-[#00F0FF] transition-colors">
                    {g.title}
                  </h4>

                  <p className="mt-2.5 text-xs text-slate-300 leading-relaxed font-sans">
                    {g.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                  {g.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full bg-[#05060A] border border-slate-800 font-mono text-[9px] text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

