import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Layers, X, ShieldCheck, Zap, ArrowRight, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { getAllProjects, type ProjectData } from "../lib/content";
import { fadeInUp, fadeScale, staggerContainer } from "../lib/motion";

const projects = getAllProjects();

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
            <div className="neo-icon h-10 w-10">
              <Layers size={19} />
            </div>
            <div>
              <h2 className="section-title">Featured work</h2>
              <p className="section-kicker">
                Discovery • Demo • Proof of Value
              </p>
            </div>
          </div>
        </div>

        <motion.div
          className="flex flex-col gap-10"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} onOpen={setSelectedProject} />
          ))}
        </motion.div>
      </div>

      {/* FULL VIEW PROJECT DETAIL */}
      <AnimatePresence>
        {selectedProject && <ProjectFullView project={selectedProject} onClose={() => setSelectedProject(null)} />}
      </AnimatePresence>
    </section>
  );
}

function ProjectFullView({ project, onClose }: { project: ProjectData; onClose: () => void }) {
  return (
    <motion.div
      variants={fadeScale}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="app-shell fixed inset-0 z-[100] overflow-y-auto"
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 border-b border-[#d5dde5] bg-[#edf1f5]/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="section-kicker">Case study</p>
            <h2 className="mt-1 truncate font-[Manrope] text-base font-bold text-[#2d3b4c] sm:text-xl md:text-2xl">{project.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="neo-card shrink-0 rounded-full p-3 text-[#617388] transition hover:text-[#2d3b4c]"
            aria-label="Close project brief"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Hero Summary */}
      <div className="border-b border-[#d5dde5]">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-8">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="neo-pressed inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#496b86]">
                <Zap size={12} />
                {project.category}
              </span>
              <span className="neo-pressed rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#718194]">
                {project.status}
              </span>
            </div>

            <h1 className="max-w-4xl font-[Manrope] text-3xl font-extrabold leading-tight tracking-[-0.05em] text-[#2d3b4c] sm:text-4xl md:text-5xl">
              {project.title}
            </h1>
            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-[#617388] sm:text-base">{project.description}</p>
          </div>

          <aside className="lg:col-span-4">
            <div className="neo-card rounded-2xl p-5">
              <p className="section-kicker mb-4">My role</p>
              <div className="flex items-start gap-3">
                <div className="neo-pressed rounded-full p-2 text-[#496b86]">
                  <ShieldCheck size={16} />
                </div>
                <p className="text-sm leading-relaxed text-[#52657a]">{project.role}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Full Content */}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-12 lg:px-8">
        <main className="lg:col-span-8">
          <div className="prose max-w-none prose-slate">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="mb-8 mt-0 border-b border-[#d5dde5] pb-4 font-[Manrope] text-3xl font-bold text-[#2d3b4c]">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="mb-4 mt-10 font-[Manrope] text-2xl font-bold text-[#2d3b4c]">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mb-4 mt-10 flex items-center gap-2 font-[Manrope] text-xl font-bold text-[#496b86]">
                    <ArrowRight size={18} /> {children}
                  </h3>
                ),
                p: ({ children }) => <p className="mb-6 text-base leading-relaxed text-[#52657a]">{children}</p>,
                ul: ({ children }) => <ul className="mb-8 space-y-4 text-[#52657a]">{children}</ul>,
                li: ({ children }) => (
                  <li className="flex items-start gap-3">
                    <span className="mt-1 text-[#496b86]">•</span>
                    <span>{children}</span>
                  </li>
                ),
                strong: ({ children }) => (
                  <span className="rounded bg-[#dbe5ed] px-1 font-bold text-[#496b86]">{children}</span>
                ),
                blockquote: ({ children }) => (
                  <div className="neo-pressed my-8 rounded-r-xl border-l-4 border-[#7492aa] p-6 italic text-[#52657a]">
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
            <div className="neo-card rounded-2xl p-6">
              <h4 className="section-kicker border-b border-[#d5dde5] pb-3">
                Project details
              </h4>
              <div className="mt-6 space-y-5">
                {project.stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="mb-1 text-[10px] font-semibold uppercase text-[#718194]">{stat.label}</p>
                    <p className="font-[Manrope] text-xl font-bold text-[#2d3b4c]">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="neo-card rounded-2xl p-6">
              <h4 className="section-kicker mb-4">Tools used</h4>
              <div className="flex flex-wrap gap-2">
                {project.tools.map((tool) => (
                  <span
                    key={tool}
                    className="neo-pressed rounded-md px-2 py-1 text-[9px] font-medium text-[#52657a]"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={onClose}
              className="neo-card-interactive w-full rounded-xl px-6 py-3 text-xs font-bold tracking-wide text-[#52657a]"
            >
              Back to portfolio
            </button>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}

function ProjectCard({ project, onOpen }: { project: ProjectData; onOpen: (p: ProjectData) => void }) {
  return (
    <motion.button
      variants={fadeInUp}
      onClick={() => onOpen(project)}
      className="neo-card-interactive group relative w-full overflow-hidden rounded-3xl text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#496b86]"
    >
      <div className="p-6 md:p-8 relative z-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#496b86]">
                {project.category}
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-[#b5c3cf] sm:block" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[#718194]">{project.status}</span>
            </div>

            <div>
              <h3 className="font-[Manrope] text-2xl font-bold text-[#2d3b4c] sm:text-3xl">
                {project.title}
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#617388]">
                {project.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {project.workflow.slice(0, 3).map((step) => (
                <span
                  key={step}
                  className="neo-pressed rounded-full px-3 py-1.5 text-[9px] font-medium text-[#52657a]"
                >
                  {step}
                </span>
              ))}
            </div>
          </div>

          <div className="w-full md:w-auto md:min-w-[180px]">
            <div className="neo-pressed rounded-2xl p-4">
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-[#8090a0]">View case study</p>
                <ExternalLink
                  size={14}
                  className="text-[#496b86] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
              <p className="text-xs leading-relaxed text-[#617388]">
                View the complete solution brief, metrics, and implementation notes.
              </p>
              <Link
                to={`/projects/${project.slug}`}
                onClick={(event) => event.stopPropagation()}
                className="mt-3 inline-flex text-xs font-bold text-[#496b86] underline underline-offset-4"
              >
                Open indexable case study
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
