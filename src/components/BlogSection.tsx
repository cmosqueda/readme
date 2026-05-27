// BlogSection.tsx
import { useState } from "react";
import { BookOpen, X, Calendar, Clock, ChevronRight } from "lucide-react";
import useMarkdownFile from "../hooks/useMarkdownFile";
import ReactMarkdown from "react-markdown";

// empty for now, will add blogs soon
const BLOG_SLUGS = [""];

export default function BlogSection() {
  const [selectedBlog, setSelectedBlog] = useState<any | null>(null);

  return (
    <section className="w-full flex justify-center py-12 px-4 relative">
      <div className="w-full max-w-4xl">
        {/* SECTION HEADER */}
        <div className="flex items-center gap-4 mb-12">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <BookOpen className="text-emerald-500" size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight uppercase font-mono text-white/90">Technical_Logs</h2>
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">Articles & QA Deep Dives</p>
          </div>
        </div>

        {/* BLOG GRID/LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BLOG_SLUGS.map((slug) => (
            <BlogCard key={slug} slug={slug} onOpen={setSelectedBlog} />
          ))}
        </div>
      </div>

      {/* ARTICLE MODAL READ VIEW */}
      {selectedBlog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-gray-950/95 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
            onClick={() => setSelectedBlog(null)}
          />

          <div className="relative w-full max-w-3xl max-h-[85vh] bg-gray-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* Header metadata */}
            <div className="p-6 md:p-8 border-b border-white/5 bg-white/[0.01] flex justify-between items-start gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-500 tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">
                  {selectedBlog.category}
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-white font-mono mt-3">{selectedBlog.title}</h3>
                <div className="flex items-center gap-4 text-white/40 text-xs font-mono mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {selectedBlog.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {selectedBlog.readTime}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedBlog(null)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 border border-white/5 transition-all shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Document Container */}
            <div className="overflow-y-auto p-8 md:p-12 scrollbar-thin scrollbar-thumb-emerald-500/10 scrollbar-track-transparent">
              <div className="prose prose-invert prose-emerald max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold text-white mb-6 border-b border-white/5 pb-2 font-mono">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-bold text-white/90 mt-8 mb-3 font-mono">{children}</h2>
                    ),
                    p: ({ children }) => (
                      <p className="text-white/70 leading-relaxed mb-4 text-sm sm:text-base">{children}</p>
                    ),
                    li: ({ children }) => (
                      <li className="list-disc list-inside text-white/60 text-sm mb-2">{children}</li>
                    ),
                    code: ({ children }) => (
                      <code className="bg-white/5 px-1.5 py-0.5 rounded text-emerald-400 font-mono text-sm border border-white/5">
                        {children}
                      </code>
                    ),
                  }}
                >
                  {selectedBlog.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function BlogCard({ slug, onOpen }: { slug: string; onOpen: (data: any) => void }) {
  const blog = useMarkdownFile("blogs", slug);

  if (!blog) return <div className="h-48 bg-white/[0.01] animate-pulse rounded-xl border border-white/5" />;

  return (
    <button
      onClick={() => onOpen(blog)}
      className="text-left group relative bg-white/[0.01] border border-white/5 rounded-xl p-6 hover:border-emerald-500/30 hover:bg-emerald-500/[0.01] transition-all duration-300 flex flex-col justify-between items-start h-full gap-4"
    >
      <div className="space-y-3 w-full">
        <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
          <span className="text-emerald-500/80">{blog.category}</span>
          <span>{blog.readTime}</span>
        </div>
        <h3 className="text-lg font-bold text-white/90 group-hover:text-emerald-400 transition-colors font-mono line-clamp-2">
          {blog.title}
        </h3>
        <p className="text-xs text-white/40 line-clamp-3 leading-relaxed">{blog.summary}</p>
      </div>

      <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-emerald-500/70 pt-2 group-hover:text-emerald-400 transition-colors">
        Read Document <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </button>
  );
}
