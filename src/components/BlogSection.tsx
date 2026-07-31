// BlogSection.tsx
import { motion } from "framer-motion";
import { BookOpen, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getAllBlogPosts, type BlogPost } from "../lib/content";
import { fadeInUp, staggerContainer } from "../lib/motion";

const posts = getAllBlogPosts();

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
            <h2 className="text-2xl font-bold tracking-tight uppercase font-mono text-white/90">Blogs & Articles</h2>
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">
              Discovery, Demos & Product Thinking
            </p>
          </div>
        </div>

        {/* BLOG GRID/LIST */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <motion.div variants={fadeInUp}>
      <Link
        to={`/blogs/${post.slug}`}
        className="group relative bg-white/[0.01] border border-white/5 rounded-xl p-6 hover:border-emerald-500/30 hover:bg-emerald-500/[0.01] transition-all duration-300 flex flex-col justify-between items-start h-full gap-4"
      >
        <div className="space-y-3 w-full">
          <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
            <span className="text-emerald-500/80">{post.category}</span>
            <span>{post.readTime}</span>
          </div>
          <h3 className="text-lg font-bold text-white/90 group-hover:text-emerald-400 transition-colors font-mono line-clamp-2">
            {post.title}
          </h3>
          <p className="text-xs text-white/40 line-clamp-3 leading-relaxed">{post.summary}</p>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-emerald-500/70 pt-2 group-hover:text-emerald-400 transition-colors">
          Read Note <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>
    </motion.div>
  );
}
