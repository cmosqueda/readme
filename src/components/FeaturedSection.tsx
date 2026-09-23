import { motion } from "framer-motion";
import { Layers, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { getAllProjects, type ProjectData } from "../lib/content";
import { fadeInUp, staggerContainer } from "../lib/motion";

const projects = getAllProjects();

export default function FeaturedSection() {
  return (
    <section className="relative flex w-full justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="mb-12 flex items-center gap-4">
          <div className="neo-icon h-10 w-10"><Layers size={19} /></div>
          <div>
            <h2 className="section-title">Featured work</h2>
            <p className="section-kicker">Discovery • Demo • Proof of Value</p>
          </div>
        </div>
        <motion.div className="flex flex-col gap-10" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
          {projects.map((project) => <ProjectCard key={project.slug} project={project} />)}
        </motion.div>
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: ProjectData }) {
  return (
    <motion.div variants={fadeInUp}>
      <Link
        to={`/projects/${project.slug}`}
        className="neo-card-interactive group relative block w-full overflow-hidden rounded-3xl text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#496b86]"
      >
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#496b86]">{project.category}</span>
                <span className="hidden h-1 w-1 rounded-full bg-[#b5c3cf] sm:block" />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-[#718194]">{project.status}</span>
              </div>
              <div>
                <h3 className="font-[Manrope] text-2xl font-bold text-[#2d3b4c] sm:text-3xl">{project.title}</h3>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#617388]">{project.description}</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {project.workflow.slice(0, 3).map((step) => <span key={step} className="neo-pressed rounded-full px-3 py-1.5 text-[9px] font-medium text-[#52657a]">{step}</span>)}
              </div>
            </div>
            <div className="w-full lg:w-auto lg:min-w-[180px]">
              <div className="neo-pressed rounded-2xl p-4">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-[#8090a0]">View case study</p>
                  <ExternalLink size={14} className="text-[#496b86] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <p className="text-xs leading-relaxed text-[#617388]">Open the complete solution brief, metrics, and implementation notes.</p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
