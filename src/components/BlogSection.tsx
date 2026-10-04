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
          <div><h2>Blogs & articles</h2><p>Working notes on product thinking, systems, testing, and the developer transition.</p></div>
        </div>
        <motion.div className="github-article-list" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
          {posts.map((post) => <BlogCard key={post.slug} post={post} />)}
        </motion.div>
      </div>
    </section>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <motion.div variants={fadeInUp}>
      <Link to={`/blogs/${post.slug}`} className="github-article-card group">
        <div className="github-article-icon"><BookOpen size={17} /></div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2 text-xs github-muted"><span className="github-badge">{post.category}</span><span>·</span><span>{post.readTime}</span>{post.date && <><span>·</span><span>{post.date}</span></>}</div>
          <h3>{post.title}</h3>
          <p>{post.summary}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">{post.tags.map((tag) => <span key={tag} className="github-topic">{tag}</span>)}</div>
        </div>
        <ChevronRight size={18} className="github-muted self-center transition-transform group-hover:translate-x-1" />
      </Link>
    </motion.div>
  );
}
