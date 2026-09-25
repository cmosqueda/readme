import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useEffect } from "react";
import { getAllProjects } from "../lib/content";
import { setPageSeo } from "../lib/seo";

export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const project = getAllProjects().find((item) => item.slug === slug);

  useEffect(() => {
    if (project) setPageSeo({ title: `${project.title} Case Study | Tine Mosqueda`, description: project.description, path: `/projects/${project.slug}`, type: "article" });
  }, [project]);

  if (!project) return <main className="app-shell flex min-h-screen items-center justify-center p-8"><p className="text-sm text-[color:var(--md-on-surface-variant)]">Case study not found. <Link to="/" className="text-[color:var(--md-primary)] underline">Return to portfolio</Link></p></main>;

  return (
    <div className="app-shell min-h-screen">
      <header className="sticky top-0 z-20 border-b border-[color:var(--md-outline-variant)] bg-[color:var(--md-surface)]/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/#featured" className="inline-flex items-center gap-2 text-xs font-bold text-[color:var(--md-primary)] transition-colors hover:text-[color:var(--md-on-surface)]"><ArrowLeft size={15} /> Back to portfolio</Link>
        </div>
      </header>
      <main>
        <section className="border-b border-[color:var(--md-outline-variant)]">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-12 lg:px-8">
            <div className="lg:col-span-8">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="neo-pressed inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[color:var(--md-primary)]"><Zap size={12} /> {project.category}</span>
                <span className="neo-pressed rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--md-on-surface-variant)]">{project.status}</span>
              </div>
              <h1 className="max-w-4xl font-['Roboto_Mono'] text-3xl font-extrabold leading-tight tracking-[-0.05em] text-[color:var(--md-on-surface)] sm:text-4xl md:text-5xl">{project.title}</h1>
              <p className="mt-6 max-w-3xl text-sm leading-relaxed text-[color:var(--md-on-surface-variant)] sm:text-base">{project.description}</p>
            </div>
            <aside className="lg:col-span-4"><div className="neo-card rounded-2xl p-5"><p className="section-kicker mb-4">My role</p><div className="flex items-start gap-3"><div className="neo-pressed rounded-full p-2 text-[color:var(--md-primary)]"><ShieldCheck size={16} /></div><p className="text-sm leading-relaxed text-[color:var(--md-on-surface-variant)]">{project.role}</p></div></div></aside>
          </div>
        </section>
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-12 lg:px-8">
          <article className="lg:col-span-8"><div className="prose max-w-none prose-slate"><ReactMarkdown components={{
            h1: ({ children }) => <h2 className="mb-8 mt-0 border-b border-[color:var(--md-outline-variant)] pb-4 font-['Roboto_Mono'] text-3xl font-bold text-[color:var(--md-on-surface)]">{children}</h2>,
            h2: ({ children }) => <h2 className="mb-4 mt-10 font-['Roboto_Mono'] text-2xl font-bold text-[color:var(--md-on-surface)]">{children}</h2>,
            h3: ({ children }) => <h3 className="mb-4 mt-10 flex items-center gap-2 font-['Roboto_Mono'] text-xl font-bold text-[color:var(--md-primary)]"><ArrowRight size={18} /> {children}</h3>,
            p: ({ children }) => <p className="mb-6 text-base leading-relaxed text-[color:var(--md-on-surface-variant)]">{children}</p>,
            ul: ({ children }) => <ul className="mb-8 space-y-4 text-[color:var(--md-on-surface-variant)]">{children}</ul>,
            li: ({ children }) => <li className="flex items-start gap-3"><span className="mt-1 text-[color:var(--md-primary)]">•</span><span>{children}</span></li>,
            strong: ({ children }) => <strong className="rounded bg-[color:var(--md-primary-container)] px-1 font-bold text-[color:var(--md-on-primary-container)]">{children}</strong>,
            blockquote: ({ children }) => <blockquote className="neo-pressed my-8 rounded-r-xl border-l-4 border-[color:var(--md-secondary)] p-6 italic text-[color:var(--md-on-surface-variant)]">{children}</blockquote>,
          }}>{project.content}</ReactMarkdown></div></article>
          <aside className="lg:col-span-4"><div className="space-y-6 lg:sticky lg:top-24">
            <div className="neo-card rounded-2xl p-6"><h2 className="section-kicker border-b border-[color:var(--md-outline-variant)] pb-3">Project details</h2><div className="mt-6 space-y-5">{project.stats.map((stat) => <div key={stat.label}><p className="mb-1 text-[10px] font-semibold uppercase text-[color:var(--md-on-surface-variant)]">{stat.label}</p><p className="font-['Roboto_Mono'] text-xl font-bold text-[color:var(--md-on-surface)]">{stat.value}</p></div>)}</div></div>
            <div className="neo-card rounded-2xl p-6"><h2 className="section-kicker mb-4">Tools used</h2><div className="flex flex-wrap gap-2">{project.tools.map((tool) => <span key={tool} className="neo-pressed rounded-md px-2 py-1 text-[9px] font-medium text-[color:var(--md-on-surface-variant)]">{tool}</span>)}</div></div>
          </div></aside>
        </div>
      </main>
    </div>
  );
}
