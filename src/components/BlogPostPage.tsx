// BlogPostPage.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowUp, Calendar, Clock } from "lucide-react";
import useMarkdownFile from "../hooks/useMarkdownFile";
import ReactMarkdown from "react-markdown";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [readingProgress, setReadingProgress] = useState(0);

  // Feed the dynamic URL slug parameters directly to your generic hook
  const blog = useMarkdownFile("blogs", slug || "");

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
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-950 font-mono text-white/40 text-xs">
        <div className="flex flex-col items-center gap-2">
          <div className="w-4 h-4 border border-emerald-500 border-t-transparent animate-spin rounded-full" />
          <span>LOADING_SOLUTION_NOTE...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="relative w-full min-h-screen bg-gray-950 text-white/90 py-16 px-4 flex justify-center selection:bg-emerald-500/20">
      {/* READING PROGRESS BAR */}
      <div
        className="fixed top-0 left-0 right-0 z-[80] h-1 bg-white/5"
        role="progressbar"
        aria-label="Reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(readingProgress)}
      >
        <div
          className="h-full bg-emerald-500 transition-[width] duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="w-full max-w-3xl">
        {/* BACK TO HOME NAVIGATION */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-white/40 hover:text-emerald-400 transition-colors mb-12 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          RETURN_TO_HOME
        </Link>

        {/* METADATA HEADER BLOCK */}
        <header className="border-b border-white/5 pb-8 mb-12">
          <span className="text-[10px] font-mono uppercase text-emerald-500 tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">
            {blog.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold font-mono text-white mt-4 tracking-tight leading-tight">
            {blog.title}
          </h1>
          <div className="flex items-center gap-4 text-white/40 text-xs font-mono mt-4">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} /> {blog.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} /> {blog.readTime}
            </span>
          </div>
        </header>

        {/* EXTRACTED MARKDOWN TEXT MARKUP */}
        <article className="prose prose-invert prose-emerald max-w-none pb-24">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold text-white mb-6 border-b border-white/5 pb-2 font-mono">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-bold text-white/90 mt-10 mb-4 font-mono">{children}</h2>
              ),
              p: ({ children }) => (
                <p className="text-white/70 leading-relaxed mb-6 text-sm sm:text-base">{children}</p>
              ),
              li: ({ children }) => <li className="list-disc list-inside text-white/60 text-sm mb-2">{children}</li>,
              code: ({ children }) => (
                <code className="bg-white/5 px-1.5 py-0.5 rounded text-emerald-400 font-mono text-sm border border-white/5">
                  {children}
                </code>
              ),
            }}
          >
            {blog.content}
          </ReactMarkdown>
        </article>
      </div>

      {/* FLOATING BACK TO START BUTTON */}
      <button
        type="button"
        onClick={handleBackToStart}
        aria-label="Back to start"
        className={`
          fixed bottom-6 right-6 z-[70]
          flex items-center gap-2 rounded-full border border-white/10 bg-gray-900/90 px-4 py-3
          text-[10px] font-mono uppercase tracking-wider text-white/60 shadow-lg backdrop-blur
          transition-all duration-300 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-400
          ${readingProgress > 8 ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}
        `}
      >
        <ArrowUp size={14} />
        <span className="hidden sm:inline">Back_To_Start</span>
      </button>
    </main>
  );
}
