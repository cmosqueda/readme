// blogPosts.ts
// Keep this list in the reading order you want for the blog pager.
// The markdown files should exist in: public/blogs/{slug}.md

export const BLOG_SLUGS = ["how-to-test-without-test-cases"] as const;

export type BlogSlug = (typeof BLOG_SLUGS)[number] | string;

export function getBlogPosition(slug: string | undefined) {
  const currentIndex = slug ? BLOG_SLUGS.findIndex((item) => item === slug) : -1;

  return {
    currentIndex,
    previousSlug: currentIndex > 0 ? BLOG_SLUGS[currentIndex - 1] : null,
    nextSlug: currentIndex >= 0 && currentIndex < BLOG_SLUGS.length - 1 ? BLOG_SLUGS[currentIndex + 1] : null,
  };
}
