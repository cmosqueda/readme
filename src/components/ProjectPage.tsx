import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { getAllProjects } from "../lib/content";
import { setPageSeo } from "../lib/seo";

export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const project = getAllProjects().find((item) => item.slug === slug);

  useEffect(() => {
    if (project) {
      setPageSeo({
        title: `${project.title} Case Study | Tine Mosqueda`,
        description: project.description,
        path: `/projects/${project.slug}`,
        type: "article",
      });
    }
  }, [project]);

  if (!project) {
    return (
      <main className="app-shell flex min-h-screen items-center justify-center p-8">
        <p className="text-sm text-[#52657a]">Case study not found. <Link to="/" className="text-[#496b86] underline">Return to portfolio</Link></p>
      </main>
    );
  }

  return (
    <main className="app-shell min-h-screen px-4 py-16 sm:px-6">
      <article className="mx-auto max-w-3xl">
        <Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-[#496b86]">
          <ArrowLeft size={16} /> Back to portfolio
        </Link>
        <header className="mb-10 border-b border-[#d5dde5] pb-8">
          <p className="section-kicker">Case study · {project.category}</p>
          <h1 className="mt-3 font-[Manrope] text-4xl font-extrabold tracking-[-0.05em] text-[#2d3b4c]">
            {project.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[#52657a]">{project.description}</p>
          <dl className="mt-6 grid gap-3 text-sm text-[#52657a] sm:grid-cols-2">
            <div><dt className="font-bold text-[#2d3b4c]">Role</dt><dd>{project.role}</dd></div>
            <div><dt className="font-bold text-[#2d3b4c]">Status</dt><dd>{project.status}</dd></div>
          </dl>
        </header>
        <div className="prose prose-slate max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h2>{children}</h2>,
            }}
          >
            {project.content}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
