import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, BookOpen, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { getAllProjects } from "../lib/content";
import { setPageSeo } from "../lib/seo";

export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const project = getAllProjects().find((item) => item.slug === slug);
  useEffect(() => { if (project) setPageSeo({ title: `${project.title} Case Study | Christine Mosqueda`, description: project.description, path: `/projects/${project.slug}`, type: "article" }); }, [project]);
  if (!project) return <main className="app-shell flex min-h-screen items-center justify-center p-8"><Link to="/" className="github-link">Return to portfolio</Link></main>;

  return <main className="app-shell github-detail min-h-screen px-4 py-8 md:py-12">
    <div className="mx-auto w-full max-w-6xl">
      <Link to="/#projects" className="github-detail-back mb-6 inline-flex items-center gap-2 text-sm"><ArrowLeft size={15} /> Back to projects</Link>
      <div className="github-repository-header">
        <div className="github-file-bar"><BookOpen size={16} /><span>cmosqueda / {project.slug}</span><span className="github-badge">{project.status}</span></div>
        <h1 className="github-detail-title mt-5">{project.title}</h1>
        <p className="github-detail-description">{project.description}</p>
        <p className="github-muted mt-3 text-xs">Case study by Christine Mosqueda · {project.role}</p>
        <div className="mt-5 flex flex-wrap gap-2">{project.tools.map((tool) => <span className="github-topic" key={tool}>{tool}</span>)}</div>
      </div>
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
    </div>
  </main>;
}

const markdownComponents = {
  h1: ({ children }: { children?: ReactNode }) => <h1>{children}</h1>,
  h2: ({ children }: { children?: ReactNode }) => <h2>{children}</h2>,
  h3: ({ children }: { children?: ReactNode }) => <h3>{children}</h3>,
  p: ({ children }: { children?: ReactNode }) => <p>{children}</p>,
  li: ({ children }: { children?: ReactNode }) => <li>{children}</li>,
  blockquote: ({ children }: { children?: ReactNode }) => <blockquote>{children}</blockquote>,
  strong: ({ children }: { children?: ReactNode }) => <strong>{children}</strong>,
};
