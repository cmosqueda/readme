// BlogPostPage.tsx
import { isValidElement, useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUp, Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getBlogBySlug, getBlogPosition } from "../lib/content";
import { fadeInUp } from "../lib/motion";
import { setPageSeo } from "../lib/seo";

const blogMarkdownComponents = {
  h1: ({ children }: { children?: ReactNode }) => (
    <h1 className="mb-6 border-b border-[color:var(--md-outline-variant)] pb-2 font-sans text-2xl font-bold text-[color:var(--md-on-surface)]">{children}</h1>
  ),
  h2: ({ children }: { children?: ReactNode }) => (
    <h2 className="mb-4 mt-10 font-sans text-xl font-bold text-[color:var(--md-on-surface)]">{children}</h2>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p className="mb-6 text-sm leading-relaxed text-[color:var(--md-on-surface-variant)] sm:text-base">{children}</p>
  ),
  li: ({ children }: { children?: ReactNode }) => <li className="mb-2 list-inside list-disc text-sm text-[color:var(--md-on-surface-variant)]">{children}</li>,
  pre: ({ children }: { children?: ReactNode }) => {
    if (isValidElement<{ className?: string; children?: ReactNode }>(children)) {
      const language = children.props.className?.match(/language-(\w+)/)?.[1];

      if (language === "mermaid") {
        return <MermaidDiagram chart={String(children.props.children).replace(/\n$/, "")} />;
      }
    }

    return <pre className="neo-pressed my-6 overflow-x-auto rounded-xl p-4">{children}</pre>;
  },
  code: ({ children }: { children?: ReactNode }) => (
    <code className="neo-pressed rounded px-1.5 py-0.5 text-sm text-[color:var(--md-primary)]">{children}</code>
  ),
};

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [readingProgress, setReadingProgress] = useState(0);

  const blog = getBlogBySlug(slug);

  const { previousSlug, nextSlug } = useMemo(() => getBlogPosition(slug), [slug]);

  useEffect(() => {
    // When moving between blog posts through Previous/Next, reset the reader position.
    window.scrollTo({ top: 0, behavior: "auto" });
    setReadingProgress(0);
  }, [slug]);

  useEffect(() => {
    if (!blog) {
      setPageSeo({
        title: "Article not found | Tine Mosqueda",
        description: "The requested portfolio article could not be found.",
        path: "/",
      });
      return;
    }

    setPageSeo({
      title: `${blog.title} | Tine Mosqueda`,
      description: blog.summary,
      path: `/blogs/${blog.slug}`,
      type: "article",
      publishedTime: blog.date,
    });
  }, [blog]);

  useEffect(() => {
    const updateReadingProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (scrollableHeight <= 0) {
        setReadingProgress(0);
        return;
      }

      const progress = (scrollTop / scrollableHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    updateReadingProgress();
    window.addEventListener("scroll", updateReadingProgress, { passive: true });
    window.addEventListener("resize", updateReadingProgress);

    return () => {
      window.removeEventListener("scroll", updateReadingProgress);
      window.removeEventListener("resize", updateReadingProgress);
    };
  }, []);

  const handleBackToStart = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!blog) {
    return (
      <div className="app-shell flex min-h-screen w-full items-center justify-center text-xs text-[color:var(--md-on-surface-variant)]">
        <div className="flex flex-col items-center gap-2">
          <span>Article not found</span>
          <Link to="/" className="text-[color:var(--md-primary)] transition-colors hover:text-[color:var(--md-on-surface)]">
            Return to portfolio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="app-shell github-detail relative min-h-screen w-full px-4 py-8 md:py-12">
      {/* READING PROGRESS BAR */}
      <div
        className="fixed top-0 left-0 right-0 z-[80] h-1 bg-[color:var(--gh-subtle)]"
        role="progressbar"
        aria-label="Reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(readingProgress)}
      >
        <div
          className="h-full bg-[color:var(--gh-link)] transition-[width] duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <motion.div
        key={slug}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="mx-auto w-full max-w-4xl"
      >
        {/* BACK TO HOME NAVIGATION */}
        <Link
          to="/#blogs"
          className="github-detail-back group mb-6 inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to portfolio
        </Link>

        {/* METADATA HEADER BLOCK */}
        <header className="github-detail-header mb-8">
          <div className="github-file-bar"><span>⌘</span><span>articles / {blog.slug}.md</span></div>
          <span className="github-badge mt-5">
            {blog.category}
          </span>
          <h1 className="github-detail-title mt-4">
            {blog.title}
          </h1>
          <div className="github-detail-meta mt-4 flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} /> {blog.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} /> {blog.readTime}
            </span>
          </div>
        </header>

        {/* EXTRACTED MARKDOWN TEXT MARKUP */}
        <article className="github-markdown max-w-none pb-16">
          <ReactMarkdown components={blogMarkdownComponents}>
            {blog.content}
          </ReactMarkdown>
        </article>

        {/* LINKED BLOG PAGING */}
        <BlogPagination previousSlug={previousSlug} nextSlug={nextSlug} />
      </motion.div>

      {/* FLOATING BACK TO START BUTTON */}
      <button
        type="button"
        onClick={handleBackToStart}
        aria-label="Back to start"
        className={`github-back-to-top fixed bottom-6 right-6 z-[70] flex items-center gap-2 px-3 py-2 text-xs font-medium transition-all duration-300 ${readingProgress > 8 ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
      >
        <ArrowUp size={14} />
        <span className="hidden sm:inline">Back to top</span>
      </button>
    </main>
  );
}

function MermaidDiagram({ chart }: { chart: string }) {
  const diagramId = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme === "dark" ? "dark" : "light");

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light"));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const renderDiagram = async () => {
      try {
        const { default: mermaid } = await import("mermaid");

        const dark = theme === "dark";
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          themeVariables: {
            background: dark ? "#0d1117" : "#ffffff",
            primaryColor: dark ? "#161b22" : "#f6f8fa",
            primaryBorderColor: dark ? "#30363d" : "#d0d7de",
            primaryTextColor: dark ? "#f0f6fc" : "#1f2328",
            secondaryColor: dark ? "#0d1117" : "#ffffff",
            tertiaryColor: dark ? "#161b22" : "#f6f8fa",
            lineColor: dark ? "#8b949e" : "#57606a",
            textColor: dark ? "#f0f6fc" : "#1f2328",
            mainBkg: dark ? "#161b22" : "#f6f8fa",
            nodeBorder: dark ? "#30363d" : "#d0d7de",
          },
        });
        const { svg: renderedSvg } = await mermaid.render(`mermaid-${diagramId}-${theme}`, chart);

        if (!cancelled) setSvg(renderedSvg);
      } catch (renderError) {
        console.error("Unable to render Mermaid diagram:", renderError);
        if (!cancelled) setError(true);
      }
    };

    void renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [chart, diagramId, theme]);

  if (error) {
    return (
      <pre className="my-6 overflow-x-auto rounded-xl border border-[color:var(--md-outline-variant)] bg-[color:var(--md-surface-container-high)] p-4 text-sm text-[color:var(--md-on-surface-variant)]">
        <code>{chart}</code>
      </pre>
    );
  }

  return (
    <div className="my-8 overflow-x-auto rounded-xl border border-[color:var(--md-outline-variant)] bg-[color:var(--md-surface-container-lowest)] p-4 shadow-sm" aria-label="Mermaid diagram">
      {svg ? (
        <div className="mermaid-diagram min-w-max" role="img" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <p className="m-0 text-sm text-[color:var(--md-on-surface-variant)]">Loading diagram…</p>
      )}
    </div>
  );
}

function BlogPagination({ previousSlug, nextSlug }: { previousSlug: string | null; nextSlug: string | null }) {
  if (!previousSlug && !nextSlug) return null;

  return (
    <nav
      aria-label="Blog post navigation"
      className="grid grid-cols-1 gap-4 border-t border-[color:var(--md-outline-variant)] pb-24 pt-8 md:grid-cols-2"
    >
      {previousSlug ? (
        <BlogPaginationCard direction="previous" slug={previousSlug} />
      ) : (
        <div className="hidden md:block" aria-hidden="true" />
      )}

      {nextSlug ? (
        <BlogPaginationCard direction="next" slug={nextSlug} />
      ) : (
        <div className="hidden md:block" aria-hidden="true" />
      )}
    </nav>
  );
}

function BlogPaginationCard({ direction, slug }: { direction: "previous" | "next"; slug: string }) {
  const blog = getBlogBySlug(slug);
  const isPrevious = direction === "previous";

  return (
    <Link
      to={`/blogs/${slug}`}
      className={`github-pagination-card group p-4 ${isPrevious ? "text-left" : "text-left md:text-right"}`}
    >
      <div
        className={`flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] github-muted ${isPrevious ? "justify-start" : "justify-start md:justify-end"}`}
      >
        {isPrevious && <ChevronLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />}
        <span>{isPrevious ? "Previous Note" : "Next Note"}</span>
        {!isPrevious && <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />}
      </div>

      <h2 className="github-pagination-title mt-3 font-sans text-base font-semibold">
        {blog?.title || formatSlugTitle(slug)}
      </h2>

      <p className="github-muted mt-2 text-xs leading-relaxed line-clamp-2">
        {blog?.summary || "Open the next related solution note."}
      </p>
    </Link>
  );
}

function formatSlugTitle(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
