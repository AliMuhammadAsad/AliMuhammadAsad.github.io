'use client';

import { useState } from 'react';
import CyberBackground3D from '@/components/CyberBackground3D';
import CyberHudNavbar from '@/components/CyberHudNavbar';
import HeroSection from '@/components/HeroSection';
import AlifSpotlightSection from '@/components/AlifSpotlightSection';
import ResearchSection from '@/components/ResearchSection';
import ProjectsVaultSection from '@/components/ProjectsVaultSection';
import TerminalSection from '@/components/TerminalSection';
import CyberHudFooter from '@/components/CyberHudFooter';
import InPageMediaModal from '@/components/InPageMediaModal';

export default function Home() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'pdf' | 'image' | null;
    url: string | null;
    title: string | null;
  }>({
    isOpen: false,
    type: null,
    url: null,
    title: null,
  });

  const handleOpenMedia = (
    type: 'pdf' | 'image',
    url: string,
    title: string
  ) => {
    setModalState({
      isOpen: true,
      type,
      url,
      title,
    });
  };

  const handleCloseModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <main className="relative min-h-screen bg-[#05060A] text-slate-100 overflow-x-hidden">
      {/* 3D WebGL Double Helix & Particle Matrix */}
      <CyberBackground3D />

      {/* Top Cyberpunk HUD Navigation */}
      <CyberHudNavbar />

      {/* Content Decks */}
      <div className="relative z-10 flex flex-col gap-12">
        <HeroSection />
        <AlifSpotlightSection onOpenMedia={handleOpenMedia} />
        <ResearchSection />
        <ProjectsVaultSection onOpenMedia={handleOpenMedia} />
        <TerminalSection />
      </div>

      {/* Cyber Tactical Footer */}
      <CyberHudFooter />

      {/* Universal In-Page Media Modal (PDFs & High-Res Diagrams) */}
      <InPageMediaModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        url={modalState.url}
        title={modalState.title}
        onClose={handleCloseModal}
      />
    </main>
  );
}
