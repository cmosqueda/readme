// BlogPostPage.tsx
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUp, BookOpen, Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getBlogBySlug, getBlogPosition } from "../lib/content";
import { fadeInUp } from "../lib/motion";
import { setPageSeo } from "../lib/seo";
import { MarkdownPre } from "./MermaidDiagram";
import ThemeToggle from "./ThemeToggle";

const blogMarkdownComponents = {
  h1: ({ children }: { children?: ReactNode }) => <h1>{children}</h1>,
  h2: ({ children }: { children?: ReactNode }) => <h2>{children}</h2>,
  h3: ({ children }: { children?: ReactNode }) => <h3>{children}</h3>,
  p: ({ children }: { children?: ReactNode }) => <p>{children}</p>,
  ul: ({ children }: { children?: ReactNode }) => <ul>{children}</ul>,
  ol: ({ children }: { children?: ReactNode }) => <ol>{children}</ol>,
  li: ({ children }: { children?: ReactNode }) => <li>{children}</li>,
  blockquote: ({ children }: { children?: ReactNode }) => <blockquote>{children}</blockquote>,
  strong: ({ children }: { children?: ReactNode }) => <strong>{children}</strong>,
  pre: MarkdownPre,
  code: ({ children }: { children?: ReactNode }) => <code>{children}</code>,
};

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [readingProgress, setReadingProgress] = useState(0);

  const blog = getBlogBySlug(slug);

  const { previousSlug, nextSlug } = useMemo(() => getBlogPosition(slug), [slug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    setReadingProgress(0);
  }, [slug]);

  useEffect(() => {
    if (!blog) {
      setPageSeo({
        title: "Article not found | Christine Mosqueda",
        description: "The requested portfolio article could not be found.",
        path: "/",
      });
      return;
    }

    setPageSeo({
      title: `${blog.title} | Christine Mosqueda`,
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
      <div className="app-shell flex min-h-screen w-full items-center justify-center font-mono text-xs github-muted">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-[color:var(--gh-border)] bg-[color:var(--gh-canvas)] px-8 py-6">
          <span>Article not found</span>
          <Link to="/" className="github-link hover:underline">
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
        className="orbital-progress-track fixed top-0 left-0 right-0 z-[80] h-1"
        role="progressbar"
        aria-label="Reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(readingProgress)}
      >
        <div
          className="orbital-progress-fill h-full transition-[width] duration-150 ease-out"
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
        {/* TOP NAVIGATION ROW */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            to="/#blogs"
            className="github-detail-back group inline-flex items-center gap-2"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
            Back to portfolio
          </Link>
          <ThemeToggle className="github-theme-toggle" />
        </div>

        {/* METADATA HEADER BLOCK */}
        <header className="github-detail-header mb-6">
          <div className="github-file-bar">
            <BookOpen size={15} />
            <span>cmosqueda / articles / {blog.slug}.md</span>
            <span className="github-badge">{blog.category}</span>
          </div>
          <h1 className="github-detail-title mt-5">
            {blog.title}
          </h1>
          <div className="github-detail-meta mt-4 flex flex-wrap items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              By Christine Mosqueda
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={13} /> {blog.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} /> {blog.readTime}
            </span>
          </div>
          {blog.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <span key={tag} className="github-topic">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {blog.coverImage && (
          <img
            src={blog.coverImage}
            alt=""
            className="mb-6 aspect-[2/1] w-full rounded-xl border border-[color:var(--gh-border)] object-cover"
          />
        )}

        {/* EXTRACTED MARKDOWN TEXT MARKUP */}
        <article className="github-markdown github-file-content mb-12">
          <div className="github-file-bar">
            <span>▤</span>
            <span>FIELD_LOG.md</span>
          </div>
          <div className="p-5 sm:p-8 md:p-10">
            <ReactMarkdown components={blogMarkdownComponents}>
              {blog.content}
            </ReactMarkdown>
          </div>
        </article>

        {/* LINKED BLOG PAGING */}
        <BlogPagination previousSlug={previousSlug} nextSlug={nextSlug} />
      </motion.div>

      {/* FLOATING BACK TO START BUTTON */}
      <button
        type="button"
        onClick={handleBackToStart}
        aria-label="Back to start"
        className={`github-back-to-top fixed bottom-6 right-6 z-[70] flex items-center gap-2 px-3.5 py-2 font-mono text-xs font-medium transition-all duration-300 ${readingProgress > 8 ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
      >
        <ArrowUp size={14} />
        <span className="hidden sm:inline">Back to top</span>
      </button>
    </main>
  );
}

function BlogPagination({ previousSlug, nextSlug }: { previousSlug: string | null; nextSlug: string | null }) {
  if (!previousSlug && !nextSlug) return null;

  return (
    <nav
      aria-label="Blog post navigation"
      className="grid grid-cols-1 gap-4 border-t border-[color:var(--gh-border)] pb-24 pt-8 md:grid-cols-2"
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
      className={`github-pagination-card group p-5 ${isPrevious ? "text-left" : "text-left md:text-right"}`}
    >
      <div
        className={`flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] github-muted ${isPrevious ? "justify-start" : "justify-start md:justify-end"}`}
      >
        {isPrevious && <ChevronLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />}
        <span>{isPrevious ? "Previous Note" : "Next Note"}</span>
        {!isPrevious && <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />}
      </div>

      <h2 className="github-pagination-title mt-3 font-sans text-base font-bold">
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
