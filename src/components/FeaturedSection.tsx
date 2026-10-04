import { BookMarked, ExternalLink, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getAllProjects, type ProjectData } from "../lib/content";
import { fadeInUp, staggerContainer } from "../lib/motion";

const projects = getAllProjects();

export default function FeaturedSection() {
  return (
    <section className="relative flex w-full justify-center px-4 py-12">
      <div className="w-full max-w-5xl">
        <div className="github-section-heading">
          <div className="github-section-icon"><BookMarked size={18} /></div>
          <div>
            <h2>Featured projects</h2>
            <p>Pinboard of systems I researched, mapped, validated, and built.</p>
          </div>
        </div>
        <motion.div className="grid grid-cols-1 gap-4 md:grid-cols-2" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
          {projects.map((project) => <ProjectCard key={project.slug} project={project} />)}
        </motion.div>
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: ProjectData }) {
  return (
    <motion.div variants={fadeInUp}>
      <Link to={`/projects/${project.slug}`} className="github-repo-card group relative block h-full p-5 text-left outline-none">
        <div className="flex h-full flex-col">
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="github-repo-name">⌘ {project.title}</span>
              <span className="github-badge">{project.status}</span>
            </div>
            <p className="text-sm leading-relaxed github-muted">{project.description}</p>
            <div className="flex flex-wrap gap-2">
              {project.workflow.slice(0, 3).map((step) => <span key={step} className="github-topic">{step}</span>)}
            </div>
          </div>
          <div className="mt-6 flex items-center gap-4 text-xs github-muted">
            <span className="flex items-center gap-1"><span className="github-language-dot" /> {project.category}</span>
            <span className="flex items-center gap-1"><Star size={13} /> case study</span>
            <span className="ml-auto flex items-center gap-1 github-link">Open <ExternalLink size={13} /></span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
