'use client';

import { useEffect } from 'react';
import Image from 'next/image';

export interface MediaModalProps {
  isOpen: boolean;
  type: 'pdf' | 'image' | null;
  url: string | null;
  title: string | null;
  onClose: () => void;
}

export default function InPageMediaModal({
  isOpen,
  type,
  url,
  title,
  onClose,
}: MediaModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !url) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 transition-all duration-300 animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl h-[90vh] bg-[#0A0C16] border border-[#00F0FF]/40 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.2)] flex flex-col overflow-hidden transform transition-all duration-300 scale-100"
      >
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-[#05060A] border-b border-slate-800 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-3 truncate">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00FFA3] animate-pulse" />
            <span className="text-[#00F0FF] font-bold tracking-wider truncate">
              {type === 'pdf' ? '[ DOCUMENT_VIEWER // PDF ]' : '[ DIAGRAM_VIEWER // IMAGE ]'}
            </span>
            <span className="text-slate-400 truncate hidden sm:inline">
              &bull; {title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={url}
              download
              className="px-3 py-1.5 rounded-lg bg-[#0A0E1A] border border-slate-700 text-slate-300 hover:text-[#00FFA3] hover:border-[#00FFA3] transition-colors"
            >
              DOWNLOAD &darr;
            </a>

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white transition-all font-bold"
            >
              CLOSE &times;
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 w-full h-full relative bg-[#05060A]/95 overflow-hidden flex items-center justify-center">
          {type === 'pdf' ? (
            <iframe
              src={`${url}#toolbar=1&navpanes=0`}
              className="w-full h-full border-none rounded-b-2xl"
              title={title || 'Embedded PDF Document'}
            />
          ) : (
            <div className="relative w-full h-full p-4 flex items-center justify-center">
              <Image
                src={url}
                alt={title || 'Enlarged Diagram'}
                fill
                className="object-contain p-2"
                unoptimized
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

