'use client';

import { useState } from 'react';

type TimelineCategory = 'all' | 'industry' | 'academia' | 'honors';

interface Milestone {
  id: string;
  category: TimelineCategory;
  period: string;
  role: string;
  organization: string;
  badge: string;
  badgeColor: string;
  accentColor: string;
  summary: string;
  impacts: string[];
  skills: string[];
  pdfDoc?: string;
  extraWidget?: 'ta-ledger';
}

interface CareerTimelineProps {
  onOpenMedia: (type: 'pdf' | 'image', url: string, title: string) => void;
}

export default function CareerTimelineSection({ onOpenMedia }: CareerTimelineProps) {
  const [activeCategory, setActiveCategory] = useState<TimelineCategory>('all');
  const [expandedId, setExpandedId] = useState<string>('habib-coo');
  const [showInlineResume, setShowInlineResume] = useState<boolean>(false);
  const [selectedTaCourse, setSelectedTaCourse] = useState<string | null>(null);

  const taCourses = [
    { code: 'CS 351', name: 'Algorithms: Design & Analysis', focus: 'Divide-and-conquer, greedy, dynamic programming, NP-completeness' },
    { code: 'CS 201', name: 'Data Structures I', focus: 'Arrays, linked lists, stacks, queues, hash tables, asymptotic analysis' },
    { code: 'CS 202', name: 'Data Structures II', focus: 'Self-balancing trees (AVL, Red-Black), heaps, B-trees, disjoint sets' },
    { code: 'CS 110', name: 'Algorithmic Problem Solving', focus: 'Foundational algorithmic reasoning, recursion, invariant analysis' },
    { code: 'CS 342', name: 'Nature of Computation (Automata)', focus: 'DFAs, NFAs, regular expressions, CFGs, pushdown automata, Turing machines' },
    { code: 'MATH 202', name: 'Discrete Mathematics (Term 1)', focus: 'Propositional & predicate logic, proof techniques, set theory, relations' },
    { code: 'MATH 202', name: 'Discrete Mathematics (Term 2)', focus: 'Combinatorics, generating functions, recurrence relations, graph theory' },
    { code: 'MATH 202', name: 'Discrete Mathematics (Term 3)', focus: 'Graph coloring, Eulerian/Hamiltonian paths, trees, Boolean algebra' },
    { code: 'CS 224', name: 'Object-Oriented Programming (OOP)', focus: 'Polymorphism, inheritance, design patterns, clean architecture in C++/Java' },
    { code: 'CS 412', name: 'Graph Data Science', focus: 'NetworkX, Cypher, graph centrality metrics, PageRank, community detection' },
    { code: 'CS 490', name: 'Competitive Programming', focus: 'Co-authored curriculum, syllabus, and problem sets (now officially taught)' },
    { code: 'MATH 102', name: 'Calculus II', focus: 'Techniques of integration, infinite series, Taylor polynomials, parametric curves' },
  ];

  const milestones: Milestone[] = [
    {
      id: 'habib-coo',
      category: 'industry',
      period: 'FEB 2026 – PRESENT',
      role: 'Data Associate // Institutional Intelligence',
      organization: 'Habib University – Office of the Chief Operating Officer (COO)',
      badge: 'CURRENT ROLE',
      badgeColor: '#00F0FF',
      accentColor: '#00F0FF',
      summary:
        'Architecting university-wide data infrastructure, automated financial endowment matching engines, and AI governance policies for leadership.',
      impacts: [
        'Centralized Institutional Data Platform: Migrated university-wide institutional databases (2018–present, 2,400+ students & alumni) from SQL Server to PostgreSQL; developed 15–20 interactive dashboards and internal portals in Next.js and React across 40–50 relational views, centralizing cross-departmental reporting for university leadership.',
        'Advancement Allocation Engine: Partnered with University Advancement on gift operations tracking ~2,800 international donors and ~5,000 gift records (PK, US, CA, UK); architected an algorithmic allocation engine matching 600–700 financial aid recipients annually to multi-criteria endowments (academic merit, financial need, degree programs), compressing allocation cycles from weeks to 1 day.',
        'Institutional Governance & Accreditation: Co-authored 2 university-wide AI governance policies regulating generative AI usage across coursework and administration; conducted Course and Program Learning Outcome (CLO-PLO) curriculum mappings for NCEAC accreditation.',
      ],
      skills: ['PostgreSQL', 'Next.js', 'React', 'Algorithmic Allocation', 'Database Migration', 'AI Governance', 'NCEAC Accreditation'],
    },
    {
      id: 'alkaram',
      category: 'industry',
      period: '2025',
      role: 'Assistant Manager // Process Automations',
      organization: 'Alkaram Studio',
      badge: 'INDUSTRY LEADERSHIP',
      badgeColor: '#00FFA3',
      accentColor: '#00FFA3',
      summary:
        'Spearheading enterprise process automation, operational pipeline engineering, and bottleneck optimization across industrial workflows.',
      impacts: [
        'Cross-Functional Automation Pipelines: Designed and deployed automated data and operational pipelines eliminating manual handoffs across supply chain and inventory synchronization.',
        'Business Intelligence & Reporting: Engineered telemetry dashboards providing leadership real-time visibility into high-volume retail metrics and operational throughput.',
        'System Integration: Bridged enterprise ERP endpoints with specialized internal tools to minimize operational friction and latency.',
      ],
      skills: ['Process Automation', 'ETL Pipelines', 'ERP Integration', 'Operational Telemetry', 'Workflow Engineering'],
    },
    {
      id: 'habib-oir',
      category: 'industry',
      period: 'JUL 2025 – JAN 2026',
      role: 'Management Trainee // AI & Agentic Analytics',
      organization: 'Habib University – Office of Institutional Research (OIR)',
      badge: 'AGENTIC RAG',
      badgeColor: '#A855F7',
      accentColor: '#A855F7',
      summary:
        'Architected production multi-agent conversational analytics platform powered by LangGraph, Gemini, and MongoDB Atlas Vector Search.',
      impacts: [
        'Production Multi-Agent RAG Platform: Architected conversational analytics platform in Python, FastAPI, LangGraph, and Gemini with MongoDB Atlas Vector Search and Redis caching (< 3s response latency), secured via role-based access control (RBAC); compressed institutional analysis cycles for Deans and Program Directors from days to under 1 hour via natural language queries.',
        'Full-Stack Deployment & Automation: Built and deployed containerized microservices using Docker, AWS, and Next.js/React frontends; automated institutional ETL pipelines for course evaluations, faculty teaching loads, and historical student performance metrics.',
      ],
      skills: ['LangGraph', 'Gemini', 'Multi-Agent RAG', 'FastAPI', 'MongoDB Atlas', 'Redis', 'Docker', 'AWS', 'ETL Pipelines'],
    },
    {
      id: 'stanford-ihp',
      category: 'honors',
      period: 'JUN 2024 – AUG 2024',
      role: 'Stanford IHP Scholar // Global Cohort',
      organization: 'Stanford University (International Honors Program 2024)',
      badge: '50% MERIT GRANT',
      badgeColor: '#F59E0B',
      accentColor: '#F59E0B',
      summary:
        'Awarded competitive 50% merit grant to attend the prestigious Stanford International Honors Program in Silicon Valley.',
      impacts: [
        'Selected among top applicants across international universities for competitive merit-based scholarship.',
        'Completed advanced computational and mathematical coursework, collaborating with world-class faculty and global cohorts.',
        'Immersed in Silicon Valley tech ecosystem, focusing on modern artificial intelligence paradigms and empirical methodologies.',
      ],
      skills: ['Stanford University', 'Merit Grantee', 'Advanced Computing', 'Global Scholarly Collaboration'],
    },
    {
      id: 'ta-wall',
      category: 'academia',
      period: 'JAN 2022 – MAY 2025',
      role: 'Teaching Assistant (12 Appointments)',
      organization: 'Habib University – Department of Computer Science',
      badge: '12x TA LEDGER',
      badgeColor: '#38BDF8',
      accentColor: '#38BDF8',
      summary:
        'Served across 12 distinct computer science and mathematics courses, mentoring 200+ students and co-authoring the official Competitive Programming curriculum.',
      impacts: [
        '12 Course Appointments: Served as TA across 12 CS and Math courses: Algorithms: Design & Analysis, Data Structures I & II, Algorithmic Problem Solving, Nature of Computation (Theory of Automata), Discrete Math (3 terms), OOP, Graph Data Science, Competitive Programming, and Calculus II.',
        'Mentored 200+ students through weekly laboratory recitations, algorithmic coding walk-throughs, and 1-on-1 conceptual tutoring.',
        'Curriculum Authoring (Summer Research Program): Collaborated with CS faculty to author the curriculum, syllabus, and algorithmic problem sets for a new university course in Competitive Programming (now actively taught in the official CS curriculum).',
      ],
      skills: ['Algorithms', 'Data Structures', 'Automata Theory', 'Graph Data Science', 'Competitive Programming', 'Pedagogy'],
      extraWidget: 'ta-ledger',
    },
    {
      id: 'icpc-national',
      category: 'honors',
      period: '2023',
      role: 'Top 10 Regional Qualifier & National Finalist',
      organization: 'International Collegiate Programming Contest (ICPC)',
      badge: 'TOP 10 REGIONAL',
      badgeColor: '#EC4899',
      accentColor: '#EC4899',
      summary:
        'Achieved Top 10 regional ranking and qualified for the ICPC Pakistan National Finals, competing under extreme algorithmic time constraints.',
      impacts: [
        'Qualified for the prestigious ICPC Pakistan National Finals by ranking in the Top 10 in the intense regional qualification round.',
        'Solved high-difficulty algorithmic challenges spanning dynamic programming, graph theory, geometry, and number theory under strict 5-hour contest limits.',
      ],
      skills: ['ICPC', 'Competitive Programming', 'Graph Theory', 'Dynamic Programming', 'C++', 'Algorithmic Speed'],
    },
    {
      id: 'habib-degree',
      category: 'academia',
      period: 'AUG 2021 – JUN 2025',
      role: 'B.Sc. in Computer Science (CGPA: 3.71 / 4.00)',
      organization: 'Habib University – Dhanani School of Science and Engineering',
      badge: '80% MERIT SCHOLARSHIP',
      badgeColor: '#00F0FF',
      accentColor: '#00F0FF',
      summary:
        'Graduated with high honors; 80% 4-year academic merit scholarship recipient; Graduate School Curation Program (GSCP) Fellow.',
      impacts: [
        'Maintained high academic standing with a 3.71 / 4.00 CGPA while holding continuous teaching assistantships and research appointments.',
        'Honors: Graduate School Curation Program (GSCP) Fellow; Stanford IHP Merit Scholar; Top 10 ICPC Regional Finalist.',
        'Relevant Coursework: Deep Learning, Large Language Models, Computational Intelligence, Reinforcement Learning, Probabilistic Graphical Models, Statistical Inference, Algorithms, Nature of Computation, Computer Architecture, OS, Database Systems.',
      ],
      skills: ['Computer Science', 'CGPA 3.71/4.00', 'GSCP Fellow', 'Deep Learning', 'Systems Architecture'],
    },
  ];

  const filtered =
    activeCategory === 'all'
      ? milestones
      : milestones.filter((m) => m.category === activeCategory);

  return (
    <section id="career" className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Heading */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent flex-1" />
            <span className="font-mono text-xs text-[#00F0FF] tracking-widest uppercase">
              [ TELEMETRY // CAREER TRAJECTORY &amp; EXPERTISE MATRIX ]
            </span>
            <div className="h-px bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent flex-1" />
          </div>

          <div className="text-center">
            <h2 className="text-3xl sm:text-5xl font-extrabold font-mono text-white">
              HOLOGRAPHIC CAREER TIMELINE
            </h2>
            <p className="mt-2 text-slate-400 font-sans max-w-2xl mx-auto text-sm sm:text-base">
              From competitive algorithmics and Stanford Honors to orchestrating enterprise Multi-Agent RAG platforms and university-wide data infrastructure.
            </p>

            {/* Quick Resume HUD Action Pill */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 font-mono text-xs">
              <button
                onClick={() =>
                  onOpenMedia(
                    'pdf',
                    '/assets/pdf/Resume_AliMuhammadAsad.pdf',
                    'Ali Muhammad Asad – Official Curriculum Vitae / Resume'
                  )
                }
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#38BDF8] text-black font-bold hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center gap-2"
              >
                <span>📄 VIEW FULL RESUME [IN-PAGE MODAL]</span> &rarr;
              </button>

              <button
                onClick={() => setShowInlineResume(!showInlineResume)}
                className="px-4 py-2.5 rounded-xl bg-[#0A0E1A] border border-[#00FFA3]/50 text-[#00FFA3] hover:bg-[#00FFA3]/10 transition-all flex items-center gap-2"
              >
                <span>{showInlineResume ? '▲ HIDE INLINE VIEWER' : '▼ TOGGLE INLINE HUD VIEWER'}</span>
              </button>

              <a
                href="/assets/pdf/Resume_AliMuhammadAsad.pdf"
                download="Resume_AliMuhammadAsad.pdf"
                className="px-4 py-2.5 rounded-xl bg-[#0A0E1A] border border-slate-700 text-slate-300 hover:text-white hover:border-[#A855F7] transition-all flex items-center gap-2"
              >
                <span>⬇ DOWNLOAD PDF</span>
              </a>
            </div>
          </div>
        </div>

        {/* Collapsible Inline Resume HUD Drawer */}
        {showInlineResume && (
          <div className="p-6 rounded-2xl cyber-panel border-[#00F0FF]/40 shadow-[0_0_30px_rgba(0,240,255,0.15)] animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 font-mono text-xs">
              <div className="flex items-center gap-2 text-[#00F0FF]">
                <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
                <span className="font-bold">INLINE HUD VIEWER // RESUME_ALIMUHAMMADASAD.PDF</span>
              </div>
              <button
                onClick={() =>
                  onOpenMedia(
                    'pdf',
                    '/assets/pdf/Resume_AliMuhammadAsad.pdf',
                    'Ali Muhammad Asad – Full Curriculum Vitae'
                  )
                }
                className="text-xs text-[#00FFA3] hover:underline"
              >
                [OPEN FULLSCREEN] ↗
              </button>
            </div>
            <div className="mt-4 w-full h-[650px] rounded-xl overflow-hidden border border-slate-800 bg-[#05060A]">
              <iframe
                src="/assets/pdf/Resume_AliMuhammadAsad.pdf#toolbar=1"
                className="w-full h-full"
                title="Ali Muhammad Asad Resume Viewer"
              />
            </div>
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-xs">
          {[
            { id: 'all', label: 'ALL MILESTONES' },
            { id: 'industry', label: 'INDUSTRY & LEADERSHIP' },
            { id: 'academia', label: 'ACADEMICS & TEACHING' },
            { id: 'honors', label: 'HONORS & AWARDS' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as TimelineCategory)}
              className={`px-4 py-2 rounded-xl border transition-all duration-200 tracking-wider ${activeCategory === cat.id
                ? 'bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                : 'bg-[#0A0E1A]/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Holographic Timeline Rail */}
        <div className="relative border-l-2 border-slate-800 ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-8">
          {filtered.map((item) => {
            const isExpanded = expandedId === item.id;

            return (
              <div key={item.id} className="relative group">
                {/* Glowing Node Dot on Timeline Rail */}
                <div
                  className="absolute -left-[31px] sm:-left-[47px] top-6 w-4 h-4 rounded-full border-2 transition-all duration-300"
                  style={{
                    borderColor: item.accentColor,
                    backgroundColor: isExpanded ? item.accentColor : '#05060A',
                    boxShadow: isExpanded ? `0 0 12px ${item.accentColor}` : 'none',
                  }}
                />

                {/* Milestone Panel */}
                <div
                  className={`p-6 sm:p-7 rounded-2xl cyber-panel transition-all duration-300 border ${isExpanded
                    ? 'border-[#00F0FF]/50 shadow-[0_0_25px_rgba(0,240,255,0.12)] bg-[#070B16]'
                    : 'border-slate-800/80 hover:border-slate-700 bg-[#0A0E1A]/60'
                    }`}
                >
                  {/* Top Bar: Period & Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 font-mono text-xs">
                    <span
                      className="px-3 py-1 rounded-full text-[11px] font-semibold border"
                      style={{
                        borderColor: `${item.accentColor}40`,
                        color: item.accentColor,
                        backgroundColor: `${item.accentColor}15`,
                      }}
                    >
                      {item.badge}
                    </span>
                    <span className="text-slate-400 tracking-wider">
                      {item.period}
                    </span>
                  </div>

                  {/* Header Titles */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? '' : item.id)}
                    className="cursor-pointer group/title"
                  >
                    <h3 className="text-xl sm:text-2xl font-mono font-bold text-white group-hover/title:text-[#00F0FF] transition-colors">
                      {item.role}
                    </h3>
                    <h4 className="text-sm sm:text-base font-sans text-slate-300 mt-1">
                      {item.organization}
                    </h4>
                    <p className="mt-3 text-xs sm:text-sm text-slate-400 font-sans leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  {/* Expand / Collapse Toggle Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {item.skills.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-0.5 rounded-full bg-[#05060A] border border-slate-800 font-mono text-[10px] text-slate-400"
                        >
                          {skill}
                        </span>
                      ))}
                      {item.skills.length > 4 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#05060A] border border-slate-800 font-mono text-[10px] text-slate-500">
                          +{item.skills.length - 4} more
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setExpandedId(isExpanded ? '' : item.id)}
                      className="font-mono text-xs text-[#00F0FF] hover:underline flex items-center gap-1 shrink-0 ml-2"
                    >
                      <span>{isExpanded ? 'LESS [-]' : 'DETAILS [+]'}</span>
                    </button>
                  </div>

                  {/* Detailed Expanded Drawer */}
                  {isExpanded && (
                    <div className="mt-5 pt-5 border-t border-slate-800 space-y-4 animate-in fade-in duration-200">
                      <div>
                        <h5 className="font-mono text-xs uppercase tracking-wider text-[#00FFA3] mb-3">
                          Key Impact &amp; Engineering Deliverables:
                        </h5>
                        <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                          {item.impacts.map((bullet, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <span
                                className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: item.accentColor }}
                              />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Complete Skills Badges */}
                      <div className="pt-3">
                        <span className="block font-mono text-[11px] text-slate-400 mb-2">
                          Core Frameworks &amp; Methodologies:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {item.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-3 py-1 rounded-xl bg-[#05060A] border border-slate-700 font-mono text-xs text-[#38BDF8]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Special Embedded Widget: 12x TA Wall of Honor */}
                      {item.extraWidget === 'ta-ledger' && (
                        <div className="mt-6 p-5 rounded-xl bg-[#05060A] border border-[#38BDF8]/30 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-mono text-xs text-[#38BDF8]">
                              <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
                              <span className="font-bold">
                                12x TEACHING ASSISTANTSHIP WALL OF HONOR
                              </span>
                            </div>
                            <span className="font-mono text-[10px] text-slate-500">
                              2022 – 2025 • 200+ Students Mentored
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 font-sans leading-relaxed">
                            Click any course to inspect covered theoretical frameworks, tutorial domains, and authoring notes:
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
                            {taCourses.map((c) => {
                              const isSelected = selectedTaCourse === c.name;

                              return (
                                <div
                                  key={c.name}
                                  onClick={() =>
                                    setSelectedTaCourse(isSelected ? null : c.name)
                                  }
                                  className={`p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                                    ? 'bg-[#38BDF8]/15 border-[#38BDF8] shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                                    : 'bg-[#0A0E1A] border-slate-800 hover:border-slate-700'
                                    }`}
                                >
                                  <div className="flex items-center justify-between font-mono text-[10px] text-[#38BDF8]">
                                    <span>{c.code}</span>
                                    <span>{isSelected ? '▲' : '▼'}</span>
                                  </div>
                                  <div className="font-mono text-xs font-semibold text-white mt-1">
                                    {c.name}
                                  </div>
                                  {isSelected && (
                                    <div className="mt-2 pt-2 border-t border-slate-800 font-sans text-[11px] text-slate-300 leading-snug">
                                      {c.focus}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

