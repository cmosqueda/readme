// BlogPostPage.tsx
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import useMarkdownFile from "../hooks/useMarkdownFile";
import ReactMarkdown from "react-markdown";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();

  // Feed the dynamic URL slug parameters directly to your generic hook
  const blog = useMarkdownFile("blogs", slug || "");

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
    <main className="w-full min-h-screen bg-gray-950 text-white/90 py-16 px-4 flex justify-center selection:bg-emerald-500/20">
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
        <article className="prose prose-invert prose-emerald max-w-none">
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
    </main>
  );
}
