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
    <h1 className="mb-6 border-b border-[#d5dde5] pb-2 font-[Manrope] text-2xl font-bold text-[#2d3b4c]">{children}</h1>
  ),
  h2: ({ children }: { children?: ReactNode }) => (
    <h2 className="mb-4 mt-10 font-[Manrope] text-xl font-bold text-[#2d3b4c]">{children}</h2>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p className="mb-6 text-sm leading-relaxed text-[#52657a] sm:text-base">{children}</p>
  ),
  li: ({ children }: { children?: ReactNode }) => <li className="mb-2 list-inside list-disc text-sm text-[#52657a]">{children}</li>,
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
    <code className="neo-pressed rounded px-1.5 py-0.5 text-sm text-[#496b86]">{children}</code>
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
      <div className="app-shell flex min-h-screen w-full items-center justify-center text-xs text-[#718194]">
        <div className="flex flex-col items-center gap-2">
          <span>Article not found</span>
          <Link to="/" className="text-[#496b86] transition-colors hover:text-[#2d3b4c]">
            Return to portfolio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="app-shell relative flex min-h-screen w-full justify-center px-4 py-16">
      {/* READING PROGRESS BAR */}
      <div
        className="fixed top-0 left-0 right-0 z-[80] h-1 bg-[#d5dde5]"
        role="progressbar"
        aria-label="Reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(readingProgress)}
      >
        <div
          className="h-full bg-[#496b86] transition-[width] duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <motion.div
        key={slug}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="w-full max-w-3xl"
      >
        {/* BACK TO HOME NAVIGATION */}
        <Link
          to="/"
          className="group mb-12 inline-flex items-center gap-2 text-xs font-semibold text-[#718194] transition-colors hover:text-[#496b86]"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to portfolio
        </Link>

        {/* METADATA HEADER BLOCK */}
        <header className="mb-12 border-b border-[#d5dde5] pb-8">
          <span className="neo-pressed rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#496b86]">
            {blog.category}
          </span>
          <h1 className="mt-4 font-[Manrope] text-3xl font-extrabold leading-tight tracking-[-0.05em] text-[#2d3b4c] md:text-4xl">
            {blog.title}
          </h1>
          <div className="mt-4 flex items-center gap-4 text-xs font-medium text-[#718194]">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} /> {blog.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} /> {blog.readTime}
            </span>
          </div>
        </header>

        {/* EXTRACTED MARKDOWN TEXT MARKUP */}
        <article className="prose prose-slate max-w-none pb-16">
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
        className={`
          neo-card fixed bottom-6 right-6 z-[70]
          flex items-center gap-2 rounded-full px-4 py-3
          text-[10px] font-bold uppercase tracking-wide text-[#52657a]
          transition-all duration-300 hover:text-[#496b86]
          ${readingProgress > 8 ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}
        `}
      >
        <ArrowUp size={14} />
        <span className="hidden sm:inline">Back to start</span>
      </button>
    </main>
  );
}

function MermaidDiagram({ chart }: { chart: string }) {
  const diagramId = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const renderDiagram = async () => {
      try {
        const { default: mermaid } = await import("mermaid");

        mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: "neutral" });
        const { svg: renderedSvg } = await mermaid.render(`mermaid-${diagramId}`, chart);

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
  }, [chart, diagramId]);

  if (error) {
    return (
      <pre className="my-6 overflow-x-auto rounded-xl border border-[#d5dde5] bg-[#f8fafc] p-4 text-sm text-[#52657a]">
        <code>{chart}</code>
      </pre>
    );
  }

  return (
    <div className="my-8 overflow-x-auto rounded-xl border border-[#d5dde5] bg-white p-4 shadow-sm" aria-label="Mermaid diagram">
      {svg ? (
        <div className="mermaid-diagram min-w-max" role="img" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <p className="m-0 text-sm text-[#718194]">Loading diagram…</p>
      )}
    </div>
  );
}

function BlogPagination({ previousSlug, nextSlug }: { previousSlug: string | null; nextSlug: string | null }) {
  if (!previousSlug && !nextSlug) return null;

  return (
    <nav
      aria-label="Blog post navigation"
      className="grid grid-cols-1 gap-4 border-t border-[#d5dde5] pb-24 pt-8 md:grid-cols-2"
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
      className={`
        neo-card-interactive group rounded-2xl p-5
        ${isPrevious ? "text-left" : "text-left md:text-right"}
      `}
    >
      <div
        className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#718194] ${isPrevious ? "justify-start" : "justify-start md:justify-end"}`}
      >
        {isPrevious && <ChevronLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />}
        <span>{isPrevious ? "Previous Note" : "Next Note"}</span>
        {!isPrevious && <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />}
      </div>

      <h2 className="mt-3 font-[Manrope] text-base font-bold text-[#2d3b4c]">
        {blog?.title || formatSlugTitle(slug)}
      </h2>

      <p className="mt-2 text-xs leading-relaxed text-[#718194] line-clamp-2">
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
