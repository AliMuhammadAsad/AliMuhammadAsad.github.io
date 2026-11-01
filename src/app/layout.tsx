import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ali Muhammad Asad // AI & LLM Engineer',
  description:
    'Personal portal of Ali Muhammad Asad: AI & LLM Engineer, Agentic Systems Architect, and CS Graduate from Habib University. Explore ALIF Urdu LLM, IEEE research, and robotics projects.',
  keywords: [
    'Ali Muhammad Asad',
    'AI Engineer',
    'LLM Engineer',
    'Urdu NLP',
    'ALIF LLM',
    'Habib University',
    'Agentic RAG',
    'Machine Learning',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-[#05060A] text-slate-100 min-h-screen selection:bg-[#00F0FF] selection:text-black antialiased">
        {children}
      </body>
    </html>
  );
}

