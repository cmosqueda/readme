import { BookOpen, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getAllBlogPosts, type BlogPost } from "../lib/content";
import { fadeInUp, staggerContainer } from "../lib/motion";

const posts = getAllBlogPosts();

export default function BlogSection() {
  return (
    <section className="w-full justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-5xl">
        <div className="github-section-heading">
          <div className="github-section-icon"><BookOpen size={18} /></div>
          <div>
            <h2>Blogs &amp; articles</h2>
            <p>Working notes on product thinking, systems, testing, and the developer transition.</p>
          </div>
          <span className="orbital-section-tag">03 // FIELD_LOGS</span>
        </div>
        <motion.div className="github-article-list" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
          {posts.map((post, index) => (
            <BlogCard key={post.slug} post={post} logNumber={posts.length - index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function BlogCard({ post, logNumber }: { post: BlogPost; logNumber: number }) {
  return (
    <motion.div variants={fadeInUp}>
      <Link to={`/blogs/${post.slug}`} className="github-article-card group">
        <span className="orbital-log-badge hidden sm:inline-flex">
          LOG {String(logNumber).padStart(2, "0")}
        </span>
        <div className="github-article-icon sm:hidden"><BookOpen size={17} /></div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2 font-mono text-[11px] github-muted">
            <span className="github-badge">{post.category}</span>
            <span>·</span>
            <span>{post.readTime}</span>
            {post.date && <><span>·</span><span>{post.date}</span></>}
          </div>
          <h3>{post.title}</h3>
          <p>{post.summary}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => <span key={tag} className="github-topic">{tag}</span>)}
          </div>
        </div>
        <ChevronRight size={18} className="github-muted self-center transition-transform group-hover:translate-x-1" />
      </Link>
    </motion.div>
  );
}
