// useMarkdownFile.tsx
import { useState, useEffect } from "react";
import matter from "gray-matter";

export interface MarkdownData {
  content: string;
  [key: string]: any; // Allows dynamic frontmatter layout fields
}

export default function useMarkdownFile(directory: "content" | "blogs", slug: string) {
  const [data, setData] = useState<MarkdownData | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const response = await fetch(`/${directory}/${slug}.md`);
        if (!response.ok) throw new Error(`System_Error: Failed to fetch ${slug} from ${directory}`);

        const text = await response.text();
        const { data: frontmatter, content } = matter(text);

        if (isMounted) {
          setData({
            ...frontmatter,
            content,
          });
        }
      } catch (err) {
        console.error("QA_LOG_FAILURE:", err);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [directory, slug]);

  return data;
}
