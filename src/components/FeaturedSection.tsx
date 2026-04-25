import { useState } from "react";
import { Layers, X, ShieldCheck, Zap, ArrowRight, ExternalLink } from "lucide-react";
import useMarkdownProject, { type ProjectData } from "./MarkdownEngine";
import ReactMarkdown from "react-markdown";

const PROJECT_SLUGS = ["featured-quickease"];

export default function FeaturedSection() {
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);

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
              <h2 className="text-2xl font-bold tracking-tight uppercase font-mono text-white/90">Featured_Works</h2>
              <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">
                Verified Documentation Engine
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

      {/* OVERLAY / MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-gray-950/95 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
            onClick={() => setSelectedProject(null)}
          />

          <div className="relative w-full max-w-4xl max-h-[90vh] bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)] flex flex-col animate-in zoom-in-95 duration-300">
            {/* PROGRESS SCAN LINE */}
            {/* <div className="absolute top-0 left-0 w-full h-[1px] bg-emerald-500/50 shadow-[0_0_15px_#10b981] animate-[scan_4s_linear_infinite]" /> */}

            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono uppercase text-emerald-500 tracking-[0.4em] mb-1">
                    Live_Dossier
                  </span>
                  <h3 className="text-xl font-bold text-white font-mono">{selectedProject.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all text-white/40 border border-white/5"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-8 md:p-12 scrollbar-thin scrollbar-thumb-emerald-500/20 scrollbar-track-transparent">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-8">
                  <div className="flex items-center gap-3">
                    <Zap size={16} className="text-emerald-500" />
                    <span className="text-xs font-mono text-emerald-500/80 uppercase tracking-widest font-bold">
                      {selectedProject.category}
                    </span>
                  </div>

                  <div className="prose prose-invert prose-emerald max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-3xl font-bold text-white mb-8 mt-3 border-b border-white/10 pb-4 font-mono">
                            {children}
                          </h1>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-xl font-bold text-emerald-400/90 mt-10 mb-4 flex items-center gap-2">
                            <ArrowRight size={18} /> {children}
                          </h3>
                        ),
                        p: ({ children }) => <p className="text-white/60 leading-relaxed text-base mb-6">{children}</p>,
                        ul: ({ children }) => <ul className="space-y-4 mb-8 text-white/60">{children}</ul>,
                        li: ({ children }) => (
                          <li className="flex gap-3 items-start">
                            <span className="text-emerald-500 mt-1">▹</span>
                            <span>{children}</span>
                          </li>
                        ),
                        strong: ({ children }) => (
                          <span className="text-emerald-400 font-bold px-1 bg-emerald-500/5 rounded">{children}</span>
                        ),
                        blockquote: ({ children }) => (
                          <div className="border-l-2 border-emerald-500 bg-emerald-500/5 p-6 my-8 rounded-r-xl italic text-emerald-100/80 shadow-inner">
                            {children}
                          </div>
                        ),
                      }}
                    >
                      {selectedProject.content}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Sidebar Stats Area */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="sticky top-0 space-y-6">
                    <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-6">
                      <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 border-b border-white/5 pb-2">
                        Verification_Metrics
                      </h4>
                      {selectedProject.stats.map((stat) => (
                        <div key={stat.label} className="group/stat">
                          <p className="text-[10px] font-mono text-white/40 uppercase mb-1 group-hover/stat:text-emerald-500/60 transition-colors">
                            {stat.label}
                          </p>
                          <p className="text-xl font-bold text-white group-hover/stat:scale-105 transition-transform origin-left">
                            {stat.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-4">
                      <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-500/60">
                        Tech_Stack
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.tools.map((tool) => (
                          <span
                            key={tool}
                            className="text-[9px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20 uppercase"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-full">
                  <ShieldCheck size={16} className="text-emerald-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-white/20 uppercase">Assigned Architect</span>
                  <span className="text-xs font-mono text-white/60">{selectedProject.role}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="w-full sm:w-auto px-8 py-3 bg-emerald-500 text-black text-xs font-bold font-mono rounded-xl hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all uppercase tracking-widest"
              >
                Terminate_View
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function ProjectCard({ slug, onOpen }: { slug: string; onOpen: (p: ProjectData) => void }) {
  const project = useMarkdownProject(slug);

  if (!project)
    return <div className="h-64 bg-white/[0.01] animate-pulse rounded-2xl border border-white/5 shadow-inner" />;

  return (
    <button
      onClick={() => onOpen(project)}
      className="text-left w-full group relative bg-white/[0.01] border border-white/5 rounded-3xl overflow-hidden hover:border-emerald-500/40 hover:bg-emerald-500/[0.02] transition-all duration-700 outline-none"
    >
      {/* GLOW EFFECT */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-all duration-700" />

      <div className="p-8 md:p-10 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          <div className="flex-1 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.4em] font-bold">
                  {project.category}
                </p>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-white group-hover:text-emerald-400 transition-colors duration-500">
                {project.title}
              </h3>
            </div>

            <p className="text-base text-white/30 leading-relaxed max-w-xl group-hover:text-white/50 transition-colors duration-500 italic">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {project.workflow.slice(0, 3).map((step) => (
                <span
                  key={step}
                  className="text-[9px] font-mono text-white/40 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 group-hover:border-emerald-500/20 group-hover:text-white/60 transition-all"
                >
                  {step}
                </span>
              ))}
              {project.workflow.length > 3 && (
                <span className="text-[9px] font-mono text-white/20 px-2 py-1.5">
                  +{project.workflow.length - 3} MORE
                </span>
              )}
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col gap-4">
            <div className="p-6 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-4 min-w-[200px] group-hover:border-emerald-500/30 transition-all duration-500">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-mono text-white/20 uppercase">System Status</p>
                <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] text-emerald-500 font-bold uppercase tracking-tighter">
                  Verified
                </div>
              </div>
              <p className="text-lg font-mono font-medium text-emerald-500/90">{project.status}</p>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-white/40">
                <span className="text-[9px] font-mono uppercase">Full Report</span>
                <ExternalLink
                  size={14}
                  className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
