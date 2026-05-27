// MarkdownEngine.tsx
import { useState, useEffect } from "react";
import matter from "gray-matter";

export interface ProjectData {
  id: string;
  title: string;
  category: string;
  role: string;
  status: string;
  description: string;
  tools: string[];
  workflow: string[];
  stats: { label: string; value: string }[];
  content: string;
}

export default function useMarkdownProject(slug: string) {
  const [project, setProject] = useState<ProjectData | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const response = await fetch(`/content/${slug}.md`);
        if (!response.ok) throw new Error(`System_Error: Failed to fetch ${slug}`);

        const text = await response.text();
        const { data, content } = matter(text);

        if (isMounted) {
          // Validation: Ensure arrays exist to prevent .map() errors in UI
          setProject({
            ...data,
            tools: data.tools || [],
            workflow: data.workflow || [],
            stats: data.stats || [],
            content: content,
          } as ProjectData);
        }
      } catch (err) {
        console.error("QA_LOG_FAILURE:", err);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    }; // Cleanup to prevent memory leaks
  }, [slug]);

  return project;
}
