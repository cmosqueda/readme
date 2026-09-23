// App.tsx
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import BlogPostPage from "./components/BlogPostPage";
import ProjectPage from "./components/ProjectPage";

export default function App() {
  const [isLoading, setIsLoading] = useState(() => document.readyState !== "complete");

  useEffect(() => {
    if (document.readyState === "complete") {
      setIsLoading(false);
      return;
    }

    const finishLoading = () => setIsLoading(false);
    window.addEventListener("load", finishLoading, { once: true });
    const fallback = window.setTimeout(finishLoading, 2500);

    return () => {
      window.removeEventListener("load", finishLoading);
      window.clearTimeout(fallback);
    };
  }, []);

  if (isLoading) return <PortfolioSkeleton />;

  return (
    <BrowserRouter>
      <Routes>
        {/* Main single-page landing dashboard */}
        <Route path="/" element={<Home />} />

        {/* Dynamic routing matching individual markdown logs */}
        <Route path="/blogs/:slug" element={<BlogPostPage />} />
        <Route path="/projects/:slug" element={<ProjectPage />} />
      </Routes>
    </BrowserRouter>
  );
}

function PortfolioSkeleton() {
  return (
    <div className="app-shell flex min-h-screen" aria-busy="true" aria-label="Loading portfolio">
      <aside className="neo-surface hidden w-72 flex-col gap-8 p-8 md:flex">
        <div className="skeleton-shimmer h-36 w-36 self-center rounded-full" />
        <div className="space-y-3"><SkeletonBlock className="h-5 w-36" /><SkeletonBlock className="h-3 w-full" /><SkeletonBlock className="h-3 w-4/5" /></div>
        <SkeletonBlock className="h-12 w-full rounded-2xl" />
        <div className="space-y-3"><SkeletonBlock className="h-3 w-24" />{[0, 1, 2].map((item) => <SkeletonBlock key={item} className="h-8 w-full rounded-lg" />)}</div>
      </aside>

      <main className="flex-1 px-4 py-10 sm:px-6" role="status">
        <span className="sr-only">Loading portfolio content</span>
        <div className="mx-auto mt-16 max-w-4xl space-y-12">
          <div className="space-y-5"><SkeletonBlock className="h-3 w-44" /><SkeletonBlock className="h-14 w-3/4" /><SkeletonBlock className="h-4 w-full" /><SkeletonBlock className="h-4 w-5/6" /></div>
          <div className="grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((item) => <SkeletonBlock key={item} className="h-28 rounded-2xl" />)}</div>
          <SkeletonBlock className="h-64 rounded-3xl" />
          <div className="grid gap-5 md:grid-cols-2">{[0, 1].map((item) => <SkeletonBlock key={item} className="h-48 rounded-3xl" />)}</div>
        </div>
      </main>
    </div>
  );
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`skeleton-shimmer ${className}`} aria-hidden="true" />;
}
