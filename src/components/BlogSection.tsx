// BlogSection.tsx
import { motion } from "framer-motion";
import { BookOpen, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getAllBlogPosts, type BlogPost } from "../lib/content";
import { fadeInUp, staggerContainer } from "../lib/motion";

const posts = getAllBlogPosts();

export default function BlogSection() {
  return (
    <section className="w-full flex justify-center py-12 px-4 relative">
      <div className="w-full max-w-4xl">
        {/* SECTION HEADER */}
        <div className="flex items-center gap-4 mb-12">
          <div className="neo-icon h-10 w-10">
            <BookOpen size={19} />
          </div>
          <div>
            <h2 className="section-title">Notes & articles</h2>
            <p className="section-kicker">Discovery, Demos & Product Thinking</p>
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
        className="neo-card-interactive group relative flex h-full flex-col items-start justify-between gap-4 rounded-2xl p-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4b7355]"
      >
        <div className="space-y-3 w-full">
          <div className="flex w-full items-center justify-between text-[10px] font-semibold text-[#718194]">
            <span className="text-[#4b7355]">{post.category}</span>
            <span>{post.readTime}</span>
          </div>
          <h3 className="font-[Fraunces] text-lg font-bold text-[#2d3b4c] transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-xs leading-relaxed text-[#617388] line-clamp-3">{post.summary}</p>
        </div>

        <div className="flex items-center gap-1 pt-2 text-[10px] font-bold uppercase tracking-wide text-[#4b7355]">
          Read article <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
        </div>
      </Link>
    </motion.div>
  );
}
