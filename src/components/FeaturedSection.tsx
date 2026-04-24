import { GitBranch, Terminal, Layers } from "lucide-react";
import { featuredWorks } from "../data/featuredWork";

export default function FeaturedSection() {
  return (
    <section className="w-full flex justify-center py-10 px-4">
      <div className="w-full max-w-4xl">
        <div className="flex items-center gap-3 mb-10">
          <Layers className="text-emerald-500" size={20} />
          <h2 className="text-2xl font-bold tracking-tight uppercase font-mono text-white/90">Featured</h2>
        </div>

        {/* Dynamic List Render */}
        <div className="flex flex-col gap-12">
          {featuredWorks.slice(0, 3).map((project) => (
            <div
              key={project.id}
              className="group relative bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all duration-500"
            >
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full group-hover:bg-emerald-500/10 transition-colors" />

              <div className="p-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  {/* Left Side: Content */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.3em] mb-1">
                        {project.category}
                      </p>
                      <h3 className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {project.title}
                      </h3>
                    </div>

                    <p className="text-sm text-white/60 leading-relaxed max-w-xl">{project.description}</p>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {project.workflow.map((step) => (
                        <span
                          key={step}
                          className="text-[10px] font-mono text-white/40 bg-white/5 px-2 py-1 rounded border border-white/5"
                        >
                          {step}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right Side: Role & Stats */}
                  <div className="w-full md:w-64 space-y-3">
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                      <div>
                        <p className="text-[10px] font-mono text-white/30 uppercase">Primary Role</p>
                        <p className="text-sm font-medium text-emerald-500/90">{project.role}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                        {project.stats.map((stat) => (
                          <div key={stat.label}>
                            <p className="text-[9px] font-mono text-white/30 uppercase">{stat.label}</p>
                            <p className="text-[11px] text-white/80">{stat.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 px-2">
                      <GitBranch size={14} className="text-white/20" />
                      <p className="text-[10px] font-mono text-white/40">{project.tools.join(" • ")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="px-8 py-4 bg-white/[0.03] border-t border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2 text-white/20">
                  <Terminal size={14} />
                  <span className="text-[10px] font-mono tracking-widest uppercase">
                    Ref.ID_{project.id.toUpperCase()}
                  </span>
                </div>
                {/* <button className="flex items-center gap-2 text-xs font-medium text-white/60 hover:text-emerald-400 transition-colors group/link">
                  View_Docs{" "}
                  <ExternalLink
                    size={12}
                    className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform"
                  />
                </button> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
