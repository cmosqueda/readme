// content.ts
// Build-time markdown loader. Drop a new .md file into src/content/{projects,blogs}
// and it is picked up automatically — no code changes required.
import matter from "gray-matter";

export interface ProjectData {
  id: string;
  slug: string;
  title: string;
  category: string;
  role: string;
  status: string;
  description: string;
  tools: string[];
  workflow: string[];
  stats: { label: string; value: string }[];
  order: number;
  content: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  summary: string;
  tags: string[];
  content: string;
}

const projectFiles = import.meta.glob("/src/content/projects/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const blogFiles = import.meta.glob("/src/content/blogs/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function slugFromPath(path: string) {
  return path.split("/").pop()!.replace(/\.md$/, "");
}

const projects: ProjectData[] = Object.entries(projectFiles)
  .map(([path, raw]) => {
    const slug = slugFromPath(path);
    const { data, content } = matter(raw);
    return {
      slug,
      id: data.id ?? slug,
      title: data.title ?? slug,
      category: data.category ?? "",
      role: data.role ?? "",
      status: data.status ?? "",
      description: data.description ?? "",
      tools: data.tools ?? [],
      workflow: data.workflow ?? [],
      stats: data.stats ?? [],
      order: data.order ?? 0,
      content,
    };
  })
  .sort((a, b) => a.order - b.order);

const blogPosts: BlogPost[] = Object.entries(blogFiles)
  .map(([path, raw]) => {
    const slug = slugFromPath(path);
    const { data, content } = matter(raw);
    return {
      slug,
      title: data.title ?? slug,
      category: data.category ?? "",
      date: data.date ?? "",
      readTime: data.readTime ?? "",
      summary: data.summary ?? "",
      tags: data.tags ?? [],
      content,
    };
  })
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

export function getAllProjects(): ProjectData[] {
  return projects;
}

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts;
}

export function getBlogBySlug(slug: string | undefined): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getBlogPosition(slug: string | undefined) {
  const currentIndex = slug ? blogPosts.findIndex((post) => post.slug === slug) : -1;

  return {
    currentIndex,
    previousSlug: currentIndex > 0 ? blogPosts[currentIndex - 1].slug : null,
    nextSlug: currentIndex >= 0 && currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1].slug : null,
  };
}
