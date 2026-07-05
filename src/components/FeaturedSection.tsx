import { useEffect, useState } from "react";
import { Layers, X, ShieldCheck, Zap, ArrowRight, ExternalLink } from "lucide-react";
import useMarkdownProject, { type ProjectData } from "../hooks/MarkdownEngine";
import ReactMarkdown from "react-markdown";

const PROJECT_SLUGS = ["featured-quickease"];

export default function FeaturedSection() {
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);

  useEffect(() => {
    if (!selectedProject) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedProject(null);
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [selectedProject]);

  return (
    <section className="w-full flex justify-center py-12 px-4 relative">
      <div className="w-full max-w-4xl">
        {/* SECTION HEADER */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <Layers className="text-emerald-500" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight uppercase font-mono text-white/90">Featured</h2>
              <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">
                Discovery • Demo • Proof of Value
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-10">
          {PROJECT_SLUGS.map((slug) => (
            <ProjectCard key={slug} slug={slug} onOpen={setSelectedProject} />
          ))}
        </div>
      </div>

      {/* FULL VIEW PROJECT DETAIL */}
      {selectedProject && <ProjectFullView project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </section>
  );
}

function ProjectFullView({ project, onClose }: { project: ProjectData; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] bg-gray-950 text-white overflow-y-auto selection:bg-emerald-500/20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-gray-950/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-emerald-500/70">Solution_Brief</p>
            <h2 className="mt-1 truncate text-base font-bold text-white sm:text-xl md:text-2xl">{project.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] p-3 text-white/50 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
            aria-label="Close project brief"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Hero Summary */}
      <div className="border-b border-white/5 bg-white/[0.015]">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-8">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-400">
                <Zap size={12} />
                {project.category}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
                {project.status}
              </span>
            </div>

            <h1 className="max-w-4xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
              {project.title}
            </h1>
            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-white/55 sm:text-base">{project.description}</p>
          </div>

          <aside className="lg:col-span-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">Solution Role</p>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-400">
                  <ShieldCheck size={16} />
                </div>
                <p className="text-sm leading-relaxed text-white/70">{project.role}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Full Content */}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-12 lg:px-8">
        <main className="lg:col-span-8">
          <div className="prose prose-invert prose-emerald max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="mb-8 mt-0 border-b border-white/10 pb-4 font-mono text-3xl font-bold text-white">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="mb-4 mt-10 font-mono text-2xl font-bold text-white/90">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mb-4 mt-10 flex items-center gap-2 text-xl font-bold text-emerald-400/90">
                    <ArrowRight size={18} /> {children}
                  </h3>
                ),
                p: ({ children }) => <p className="mb-6 text-base leading-relaxed text-white/60">{children}</p>,
                ul: ({ children }) => <ul className="mb-8 space-y-4 text-white/60">{children}</ul>,
                li: ({ children }) => (
                  <li className="flex items-start gap-3">
                    <span className="mt-1 text-emerald-500">▹</span>
                    <span>{children}</span>
                  </li>
                ),
                strong: ({ children }) => (
                  <span className="rounded bg-emerald-500/5 px-1 font-bold text-emerald-400">{children}</span>
                ),
                blockquote: ({ children }) => (
                  <div className="my-8 rounded-r-xl border-l-2 border-emerald-500 bg-emerald-500/5 p-6 italic text-emerald-100/80">
                    {children}
                  </div>
                ),
              }}
            >
              {project.content}
            </ReactMarkdown>
          </div>
        </main>

        {/* Right Summary Column */}
        <aside className="lg:col-span-4">
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <h4 className="border-b border-white/5 pb-3 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
                Solution_Metrics
              </h4>
              <div className="mt-6 space-y-5">
                {project.stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="mb-1 text-[10px] font-mono uppercase text-white/35">{stat.label}</p>
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-6">
              <h4 className="mb-4 text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-500/60">Tech_Stack</h4>
              <div className="flex flex-wrap gap-2">
                {project.tools.map((tool) => (
                  <span
                    key={tool}
                    className="rounded border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[9px] font-mono uppercase text-emerald-300"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white/60 transition hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300"
            >
              Back_To_Portfolio
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ProjectCard({ slug, onOpen }: { slug: string; onOpen: (p: ProjectData) => void }) {
  const project = useMarkdownProject(slug);

  if (!project)
    return <div className="h-64 bg-white/[0.01] animate-pulse rounded-2xl border border-white/5 shadow-inner" />;

  return (
    <button
      onClick={() => onOpen(project)}
      className="text-left w-full group relative bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/35 hover:bg-emerald-500/[0.03] transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
    >
      <div className="p-6 md:p-8 relative z-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.25em] font-bold">
                {project.category}
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-white/20 sm:block" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">{project.status}</span>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white transition-colors duration-300 group-hover:text-emerald-400 sm:text-3xl">
                {project.title}
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/45 transition-colors duration-300 group-hover:text-white/60">
                {project.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {project.workflow.slice(0, 3).map((step) => (
                <span
                  key={step}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[9px] font-mono text-white/45"
                >
                  {step}
                </span>
              ))}
            </div>
          </div>

          <div className="w-full md:w-auto md:min-w-[180px]">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className="text-[9px] font-mono uppercase text-white/25">Open Full View</p>
                <ExternalLink
                  size={14}
                  className="text-emerald-500/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
              <p className="text-xs leading-relaxed text-white/45">
                View the complete solution brief, metrics, and implementation notes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
