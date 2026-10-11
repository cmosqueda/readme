import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, ArrowUp, BookOpen, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getProjectBySlug, getProjectPosition } from "../lib/content";
import { fadeInUp } from "../lib/motion";
import { setPageSeo } from "../lib/seo";

export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const project = getProjectBySlug(slug);
  const { previousSlug, nextSlug } = useMemo(() => getProjectPosition(slug), [slug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    setShowBackToTop(false);
    setReadingProgress(0);
  }, [slug]);

  useEffect(() => {
    if (project) setPageSeo({ title: `${project.title} Case Study | Christine Mosqueda`, description: project.description, path: `/projects/${project.slug}`, type: "article" });
  }, [project]);

  useEffect(() => {
    const updateReadingProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollableHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / scrollableHeight) * 100)) : 0;
      setReadingProgress(progress);
      setShowBackToTop(scrollTop > 240);
    };
    updateReadingProgress();
    window.addEventListener("scroll", updateReadingProgress, { passive: true });
    window.addEventListener("resize", updateReadingProgress);
    return () => {
      window.removeEventListener("scroll", updateReadingProgress);
      window.removeEventListener("resize", updateReadingProgress);
    };
  }, []);

  if (!project) return <main className="app-shell flex min-h-screen items-center justify-center p-8"><Link to="/" className="github-link">Return to portfolio</Link></main>;

  return <main className="app-shell github-detail relative min-h-screen px-4 py-8 md:py-12">
    <div className="fixed left-0 right-0 top-0 z-[80] h-1 bg-[color:var(--gh-subtle)]" role="progressbar" aria-label="Reading progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(readingProgress)}><div className="h-full bg-[color:var(--gh-link)] transition-[width] duration-150 ease-out" style={{ width: `${readingProgress}%` }} /></div>
    <motion.div key={slug} variants={fadeInUp} initial="hidden" animate="visible" className="mx-auto w-full max-w-6xl">
      <Link to="/#projects" className="github-detail-back mb-6 inline-flex items-center gap-2 text-sm"><ArrowLeft size={15} /> Back to projects</Link>
      <div className="github-repository-header">
        <div className="github-file-bar"><BookOpen size={16} /><span>cmosqueda / {project.slug}</span><span className="github-badge">{project.status}</span></div>
        <h1 className="github-detail-title mt-5">{project.title}</h1>
        <p className="github-detail-description">{project.description}</p>
        <p className="github-muted mt-3 text-xs">Case study by Christine Mosqueda · {project.role}</p>
        <div className="mt-5 flex flex-wrap gap-2">{project.tools.map((tool) => <span className="github-topic" key={tool}>{tool}</span>)}</div>
      </div>
      {project.coverImage && <img src={project.coverImage} alt="" className="mt-6 aspect-[2/1] w-full rounded-xl border border-[color:var(--md-outline-variant)] object-cover" />}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <article className="github-markdown github-file-content">
          <div className="github-file-bar"><span>▤</span><span>CASE_STUDY.md</span></div>
          <div className="p-5 md:p-8"><ReactMarkdown components={markdownComponents}>{project.content}</ReactMarkdown></div>
        </article>
        <aside className="space-y-4">
          <div className="github-detail-aside"><h2>About this project</h2><p className="github-muted mt-3 text-sm leading-relaxed">{project.role}</p><div className="mt-4 flex items-center gap-2 text-sm github-link"><ShieldCheck size={16} /> Product role</div></div>
          <div className="github-detail-aside"><h2>Project details</h2><dl className="mt-4 space-y-4">{project.stats.map((stat) => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}</dl></div>
        </aside>
      </div>
      <ProjectPagination previousSlug={previousSlug} nextSlug={nextSlug} />
    </motion.div>
    <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top" className={`github-back-to-top fixed bottom-6 right-6 z-[70] flex items-center gap-2 px-3 py-2 text-xs font-medium transition-all duration-300 ${showBackToTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}><ArrowUp size={14} /><span className="hidden sm:inline">Back to top</span></button>
  </main>;
}

const markdownComponents = {
  h1: ({ children }: { children?: ReactNode }) => <h1>{children}</h1>,
  h2: ({ children }: { children?: ReactNode }) => <h2>{children}</h2>,
  h3: ({ children }: { children?: ReactNode }) => <h3>{children}</h3>,
  p: ({ children }: { children?: ReactNode }) => <p>{children}</p>,
  ul: ({ children }: { children?: ReactNode }) => <ul className="list-disc pl-6">{children}</ul>,
  ol: ({ children }: { children?: ReactNode }) => <ol className="list-decimal pl-6">{children}</ol>,
  li: ({ children }: { children?: ReactNode }) => <li>{children}</li>,
  blockquote: ({ children }: { children?: ReactNode }) => <blockquote>{children}</blockquote>,
  strong: ({ children }: { children?: ReactNode }) => <strong>{children}</strong>,
};

function ProjectPagination({ previousSlug, nextSlug }: { previousSlug: string | null; nextSlug: string | null }) {
  if (!previousSlug && !nextSlug) return null;

  return <nav aria-label="Project navigation" className="mt-8 grid grid-cols-1 gap-4 border-t border-[color:var(--md-outline-variant)] pb-24 pt-8 md:grid-cols-2">
    {previousSlug ? <ProjectPaginationCard direction="previous" slug={previousSlug} /> : <div className="hidden md:block" aria-hidden="true" />}
    {nextSlug ? <ProjectPaginationCard direction="next" slug={nextSlug} /> : <div className="hidden md:block" aria-hidden="true" />}
  </nav>;
}

function ProjectPaginationCard({ direction, slug }: { direction: "previous" | "next"; slug: string }) {
  const project = getProjectBySlug(slug);
  const isPrevious = direction === "previous";

  return <Link to={`/projects/${slug}`} className={`github-pagination-card group p-4 ${isPrevious ? "text-left" : "text-left md:text-right"}`}>
    <div className={`flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] github-muted ${isPrevious ? "justify-start" : "justify-start md:justify-end"}`}>
      {isPrevious && <ChevronLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />}
      <span>{isPrevious ? "Previous project" : "Next project"}</span>
      {!isPrevious && <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />}
    </div>
    <h2 className="github-pagination-title mt-3 font-sans text-base font-semibold">{project?.title || formatSlugTitle(slug)}</h2>
    <p className="github-muted mt-2 text-xs leading-relaxed line-clamp-2">{project?.description || "Open the next featured project."}</p>
  </Link>;
}

function formatSlugTitle(slug: string) {
  return slug.split("-").filter(Boolean).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}
