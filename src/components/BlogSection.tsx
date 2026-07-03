// BlogSection.tsx
import { BookOpen, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom"; // Or your respective router package
import useMarkdownFile from "../hooks/useMarkdownFile";

// blog slugs
const BLOG_SLUGS = ["how-to-test-without-test-cases"];

export default function BlogSection() {
  return (
    <section id="blogs" className="w-full flex justify-center py-12 px-4 relative">
      <div className="w-full max-w-4xl">
        {/* SECTION HEADER */}
        <div className="flex items-center gap-4 mb-12">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <BookOpen className="text-emerald-500" size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight uppercase font-mono text-white/90">Solution_Notes</h2>
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">
              Discovery, Demos & Product Thinking
            </p>
          </div>
        </div>

        {/* BLOG GRID/LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BLOG_SLUGS.map((slug) => (
            <BlogCard key={slug} slug={slug} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BlogCard({ slug }: { slug: string }) {
  const blog = useMarkdownFile("blogs", slug);

  if (!blog) return <div className="h-48 bg-white/[0.01] animate-pulse rounded-xl border border-white/5" />;

  return (
    <Link
      to={`/blogs/${slug}`}
      className="group relative bg-white/[0.01] border border-white/5 rounded-xl p-6 hover:border-emerald-500/30 hover:bg-emerald-500/[0.01] transition-all duration-300 flex flex-col justify-between items-start h-full gap-4"
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
        Read Note <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}
