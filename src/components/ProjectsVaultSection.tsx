'use client';

import { useState } from 'react';
import Image from 'next/image';
import MonaLisaEvolverMiniPlayer from './MonaLisaEvolverMiniPlayer';
import FrozenLakeRLMiniPlayer from './FrozenLakeRLMiniPlayer';
import LSystemFractalMiniPlayer from './LSystemFractalMiniPlayer';
import GcAcoMiniPlayer from './GcAcoMiniPlayer';
import SomCovidMiniPlayer from './SomCovidMiniPlayer';

type ProjectCategory = 'all' | 'ai-ml' | 'systems' | 'robotics' | 'evolutionary';
type ActiveSimulator = 'none' | 'mona-lisa' | 'frozen-lake' | 'l-systems' | 'gc-aco' | 'som';

interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  categoryLabel: string;
  description: string;
  tags: string[];
  image?: string;
  pdfReport?: string;
  githubUrl?: string;
  metrics?: string;
}

interface ProjectsVaultProps {
  onOpenMedia: (type: 'pdf' | 'image', url: string, title: string) => void;
}

export default function ProjectsVaultSection({ onOpenMedia }: ProjectsVaultProps) {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>('all');
  const [activeSimulator, setActiveSimulator] = useState<ActiveSimulator>('none');

  const projectSimulators: Record<string, ActiveSimulator> = {
    'mona-lisa-ga': 'mona-lisa',
    'frozen-lake-rl': 'frozen-lake',
    'evolving-l-systems': 'l-systems',
    'gc-aco': 'gc-aco',
    'som-covid': 'som',
  };

  const projects: Project[] = [
    {
      id: 'smart-cane',
      title: 'Smart Walking Cane for Indoor Navigation',
      category: 'robotics',
      categoryLabel: 'Robotics & Simulation',
      description:
        'Indoor navigation cane for the visually impaired using ROS Middleware, Gazebo Simulator, and MATLAB/Simulink with LiDAR and A* path planning.',
      tags: ['ROS', 'Gazebo', 'MATLAB', 'LiDAR', 'A* Algorithm'],
      image: '/assets/projects/smart-cane/office.png',
      pdfReport: '/assets/docs/smart-walking-cane-paper.pdf',
      githubUrl:
        'https://github.com/AliMuhammadAsad/Smart-Walking-Cane-for-Indoor-Navigation-for-the-Visually-Impaired',
      metrics: 'Simulated in Gazebo with real-time obstacle avoidance',
    },
    {
      id: 'evolving-l-systems',
      title: 'Evolving Lindenmayer Systems',
      category: 'evolutionary',
      categoryLabel: 'Bio-Inspired Computing',
      description:
        'Evolutionary Algorithm framework evolving grammar production rules for L-Systems to synthesize complex fractal botanical patterns.',
      tags: ['Genetic Algorithms', 'L-Systems', 'Fractals', 'Python'],
      image: '/assets/projects/evolving-l-systems/tree_fractal.png',
      pdfReport: '/assets/docs/evolving-l-systems-paper.pdf',
      githubUrl: 'https://github.com/AliMuhammadAsad/Evolving-L-Systems',
      metrics: 'Multi-objective fitness: symmetry, branch factor & height',
    },
    {
      id: 'mona-lisa-ga',
      title: 'Mona Lisa Polygon Evolutionary Synthesis',
      category: 'evolutionary',
      categoryLabel: 'Genetic Optimization',
      description:
        'Evolutionary Algorithm reconstructing the Mona Lisa using semi-transparent polygons, interactive hyperparameter tuning, and vectorized MSE loss.',
      tags: ['Evolutionary Algorithms', 'Polygons', 'Tkinter GUI', 'NumPy', 'Python'],
      image: '/assets/projects/mona-lisa/mona_lisa_evolved.png',
      githubUrl:
        'https://github.com/AliMuhammadAsad/AliMuhammadAsad.github.io/tree/main/projects/Evol-Algs-Mona-Lisa',
      metrics: 'Vectorized MSE loss with interactive GUI & CLI modes',
    },
    {
      id: 'crispr-net',
      title: 'CRISPR-Cas13 Guide Efficiency Bayesian Networks',
      category: 'ai-ml',
      categoryLabel: 'Computational Biology',
      description:
        'Directed Acyclic Graph (DAG) learning using the Hill Climbing algorithm in pgmpy to model gRNA efficiency and off-target cleavage dependencies.',
      tags: ['Bayesian Networks', 'pgmpy', 'Hill Climbing', 'DAGs'],
      image: '/assets/projects/crispr/dag_network.png',
      pdfReport: '/assets/docs/crispr-bayesian-networks.pdf',
      githubUrl: 'https://github.com/AliMuhammadAsad/CRISPR_NET',
      metrics: 'Learned causal structure from high-dosage cleavage datasets',
    },
    {
      id: 'som-covid',
      title: 'Self-Organizing Map on COVID-19 Telemetry',
      category: 'ai-ml',
      categoryLabel: 'Unsupervised Learning',
      description:
        'Neural Kohonen Self-Organizing Map clustering country infection, recovery, and mortality metrics into 2D topological feature maps.',
      tags: ['SOM', 'Kohonen Map', 'Unsupervised ML', 'NumPy'],
      image: '/assets/projects/som/som_clusters.png',
      githubUrl: 'https://github.com/AliMuhammadAsad/Self-Organizing-Map',
      metrics: '50x50 lattice trained across 10,000 global epochs',
    },
    {
      id: 'gc-aco',
      title: 'Ant Colony Optimization for Graph Coloring',
      category: 'evolutionary',
      categoryLabel: 'Swarm Intelligence',
      description:
        'Swarm intelligence algorithm (ACO) applied to NP-hard Graph Coloring problem, optimizing pheromone trails across constraint networks.',
      tags: ['Ant Colony Optimization', 'Graph Theory', 'Heuristics', 'Python'],
      image: '/assets/projects/gc-aco/graph_coloring.png',
      pdfReport: '/assets/docs/ant-colony-optimization-report.pdf',
      githubUrl: 'https://github.com/AliMuhammadAsad/GC-ACO',
      metrics: 'Minimized chromatic number across DIMACS benchmark graphs',
    },
    {
      id: 'unix-file-system',
      title: 'A Simple UNIX File System',
      category: 'systems',
      categoryLabel: 'Operating Systems',
      description:
        'Interactive shell mimicking a UNIX-based file system in C, managing in-memory inodes, superblock allocation, and hierarchical paths.',
      tags: ['C Language', 'UNIX Architecture', 'Inodes', 'CLI'],
      pdfReport: '/assets/docs/unix-file-system-report.pdf',
      githubUrl: 'https://github.com/AliMuhammadAsad/A-Simple-File-System',
      metrics: 'Custom virtual disk block allocator & inode table in C',
    },
    {
      id: 'stack-heap-manager',
      title: 'Stack & Heap Memory Management',
      category: 'systems',
      categoryLabel: 'Systems Programming',
      description:
        'Low-level C simulation of memory layout, stack frames, pointer dereferencing, heap allocation headers, and boundary tags.',
      tags: ['C', 'Memory Virtualization', 'Pointers', 'UNIX'],
      image: '/assets/projects/stack-heap/memory_layout.png',
      pdfReport: '/assets/docs/stack-heap-memory-report.pdf',
      githubUrl:
        'https://github.com/AliMuhammadAsad/Stack-and-Heap-Memory-Management',
      metrics: 'Virtual address space partitioning & fragmentation tracking',
    },
    {
      id: 'multi-threading',
      title: 'POSIX Multi-Threaded File Processor',
      category: 'systems',
      categoryLabel: 'Concurrency',
      description:
        'High-throughput multi-threaded data processor built using POSIX threads (pthread), evaluating mutex synchronization and worker thread pools.',
      tags: ['POSIX Threads', 'Concurrency', 'Mutex', 'C'],
      image: '/assets/projects/multi-threading/threading_bench.png',
      pdfReport: '/assets/docs/multi-threading-posix-report.pdf',
      githubUrl: 'https://github.com/AliMuhammadAsad/Multi-Threading',
      metrics: 'Evaluated CPU core scaling vs single-threaded bottleneck',
    },
    {
      id: 'frozen-lake-rl',
      title: 'FrozenLake Navigation with Reinforcement Learning',
      category: 'ai-ml',
      categoryLabel: 'Reinforcement Learning',
      description:
        'Markov Decision Process (MDP) solver implementing Value Iteration and Q-learning in stochastic OpenAI Gym/Gymnasium environments.',
      tags: ['Reinforcement Learning', 'Value Iteration', 'MDP', 'Gymnasium'],
      image: '/assets/projects/frozen-lake/frozen_grid.png',
      githubUrl: 'https://github.com/AliMuhammadAsad/Grad-Chronicles',
      metrics: 'Optimal policy convergence over stochastic transitions',
    },
    {
      id: 'churn-flask',
      title: 'Customer Churn Machine Learning Service',
      category: 'ai-ml',
      categoryLabel: 'Applied Data Science',
      description:
        'End-to-end churn classification pipeline with PostgreSQL feature storage, Scikit-learn model inference, and Flask REST API endpoints.',
      tags: ['Scikit-Learn', 'Flask', 'PostgreSQL', 'Feature Engineering'],
      githubUrl:
        'https://github.com/AliMuhammadAsad/10Pearls-Data-Science-Internship-Project',
      metrics: 'Deployed churn prediction REST API with PostgreSQL integration',
    },
  ];

  const filtered =
    activeCategory === 'all'
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px bg-gradient-to-r from-transparent via-[#00FFA3] to-transparent flex-1" />
          <span className="font-mono text-xs text-[#00FFA3] tracking-widest uppercase">
            [ PROJECTS VAULT // ENGINEERING ARCHIVES ]
          </span>
          <div className="h-px bg-gradient-to-r from-transparent via-[#00FFA3] to-transparent flex-1" />
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold font-mono text-white">
            PROJECTS VAULT
          </h2>
          <p className="mt-2 text-slate-400 font-sans max-w-2xl mx-auto text-sm sm:text-base">
            Autonomous robotics, OS kernel simulations, swarm intelligence, and machine learning models with diagrams and research papers.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 font-mono text-xs">
          {[
            { id: 'all', label: 'ALL_SYSTEMS' },
            { id: 'ai-ml', label: 'AI & MACHINE LEARNING' },
            { id: 'systems', label: 'SYSTEMS & OS' },
            { id: 'robotics', label: 'ROBOTICS & SIMULATION' },
            { id: 'evolutionary', label: 'BIO-INSPIRED / GA' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as ProjectCategory)}
              className={`px-4 py-2 rounded-xl border transition-all duration-200 tracking-wider ${
                activeCategory === cat.id
                  ? 'bg-[#00FFA3]/20 border-[#00FFA3] text-[#00FFA3] shadow-[0_0_15px_rgba(0,255,163,0.3)]'
                  : 'bg-[#0A0E1A]/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Interactive Simulation Suite Banner & Container */}
        <div id="interactive-deck" className="mb-8">
          {activeSimulator === 'none' ? (
            <div className="flex flex-col lg:flex-row items-center justify-between p-5 rounded-2xl bg-[#0A0E1A]/80 border border-[#00F0FF]/30 shadow-[0_0_20px_rgba(0,240,255,0.08)] gap-4">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#00FFA3] animate-pulse shrink-0" />
                <div>
                  <h4 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                    INTERACTIVE CLIENT-SIDE SIMULATION SUITE (5 ENGINES LOADED)
                  </h4>
                  <p className="font-sans text-xs text-slate-400 mt-0.5">
                    Launch live Genetic Synthesis, RL Value Iteration, L-Systems, Swarm Graph Coloring, or Kohonen SOMs.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                <button
                  onClick={() => setActiveSimulator('mona-lisa')}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#38BDF8] text-black font-bold uppercase hover:brightness-110 transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                >
                  🧬 Mona Lisa
                </button>
                <button
                  onClick={() => setActiveSimulator('frozen-lake')}
                  className="px-3.5 py-2 rounded-xl bg-[#0A0E1A] border border-[#00F0FF]/50 text-[#00F0FF] font-bold uppercase hover:bg-[#00F0FF]/15 transition-all"
                >
                  ❄️ FrozenLake
                </button>
                <button
                  onClick={() => setActiveSimulator('l-systems')}
                  className="px-3.5 py-2 rounded-xl bg-[#0A0E1A] border border-[#00FFA3]/50 text-[#00FFA3] font-bold uppercase hover:bg-[#00FFA3]/15 transition-all"
                >
                  🌿 L-Systems
                </button>
                <button
                  onClick={() => setActiveSimulator('gc-aco')}
                  className="px-3.5 py-2 rounded-xl bg-[#0A0E1A] border border-[#C084FC]/50 text-[#C084FC] font-bold uppercase hover:bg-[#C084FC]/15 transition-all"
                >
                  🐜 GC-ACO
                </button>
                <button
                  onClick={() => setActiveSimulator('som')}
                  className="px-3.5 py-2 rounded-xl bg-[#0A0E1A] border border-[#F59E0B]/50 text-[#F59E0B] font-bold uppercase hover:bg-[#F59E0B]/15 transition-all"
                >
                  🧠 SOM
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Simulator Switcher Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#0A0E1A] border border-slate-800 font-mono text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-slate-400 text-[11px] px-2">ACTIVE ENGINE:</span>
                  {[
                    { id: 'mona-lisa', label: '🧬 Mona Lisa' },
                    { id: 'frozen-lake', label: '❄️ FrozenLake RL' },
                    { id: 'l-systems', label: '🌿 L-Systems' },
                    { id: 'gc-aco', label: '🐜 Swarm GC-ACO' },
                    { id: 'som', label: '🧠 Covid SOM' },
                  ].map((sim) => (
                    <button
                      key={sim.id}
                      onClick={() => setActiveSimulator(sim.id as ActiveSimulator)}
                      className={`px-3 py-1.5 rounded-lg border transition-all text-xs ${
                        activeSimulator === sim.id
                          ? 'bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF] font-bold shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                          : 'bg-[#05060A] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {sim.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setActiveSimulator('none')}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-300 hover:bg-rose-900/60 transition-all text-xs"
                >
                  ✕ HIDE SIMULATOR
                </button>
              </div>

              {/* Active Player */}
              {activeSimulator === 'mona-lisa' && (
                <MonaLisaEvolverMiniPlayer onClose={() => setActiveSimulator('none')} />
              )}
              {activeSimulator === 'frozen-lake' && (
                <FrozenLakeRLMiniPlayer onClose={() => setActiveSimulator('none')} />
              )}
              {activeSimulator === 'l-systems' && (
                <LSystemFractalMiniPlayer onClose={() => setActiveSimulator('none')} />
              )}
              {activeSimulator === 'gc-aco' && (
                <GcAcoMiniPlayer onClose={() => setActiveSimulator('none')} />
              )}
              {activeSimulator === 'som' && (
                <SomCovidMiniPlayer onClose={() => setActiveSimulator('none')} />
              )}
            </div>
          )}
        </div>

        {/* Projects Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <div
              key={project.id}
              className="p-5 rounded-2xl cyber-panel flex flex-col justify-between group transition-all duration-300"
            >
              <div>
                {/* Media Preview Box */}
                {project.image && (
                  <div
                    onClick={() =>
                      onOpenMedia('image', project.image!, project.title)
                    }
                    className="relative w-full h-44 mb-4 rounded-xl overflow-hidden border border-slate-800 group-hover:border-[#00F0FF]/40 cursor-pointer bg-[#05060A]"
                  >
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                      unoptimized
                    />
                    <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur font-mono text-[9px] text-[#00F0FF] border border-[#00F0FF]/30">
                      INSPECT 🔍
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 mb-2">
                  <span className="text-[#38BDF8] uppercase tracking-wider font-semibold">
                    {project.categoryLabel}
                  </span>
                  {project.metrics && (
                    <span className="text-[#00FFA3] truncate max-w-[170px]">
                      {project.metrics}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-mono font-bold text-white group-hover:text-[#00F0FF] transition-colors leading-snug">
                  {project.title}
                </h3>

                <p className="mt-2.5 text-xs text-slate-300 leading-relaxed font-sans">
                  {project.description}
                </p>
              </div>

              {/* Tags & Action Links */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-full bg-[#05060A] border border-slate-800 font-mono text-[10px] text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
                  {projectSimulators[project.id] && (
                    <button
                      onClick={() => {
                        setActiveSimulator(projectSimulators[project.id]);
                        const el = document.getElementById('interactive-deck');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#38BDF8] text-black font-mono font-bold hover:brightness-110 transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                    >
                      <span>▶ LIVE DEMO</span>
                    </button>
                  )}

                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#0A0E1A] hover:bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30 transition-colors flex items-center gap-1.5"
                    >
                      <span>GITHUB</span> &rarr;
                    </a>
                  )}

                  {project.pdfReport && (
                    <button
                      onClick={() =>
                        onOpenMedia(
                          'pdf',
                          project.pdfReport!,
                          `${project.title} - Research Report`
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-[#0A0E1A] hover:bg-[#A855F7]/20 text-[#C084FC] border border-[#A855F7]/30 transition-colors flex items-center gap-1.5"
                    >
                      <span>REPORT [PDF]</span> &rarr;
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
