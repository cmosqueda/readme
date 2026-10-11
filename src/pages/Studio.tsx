import {
  BookMarked,
  BookOpen,
  Check,
  ChevronRight,
  Eye,
  FileCode2,
  FilePlus2,
  FolderKanban,
  LogOut,
  Newspaper,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ThemeToggle from "../components/ThemeToggle";
import { setPageSeo } from "../lib/seo";

type Post = {
  slug: string;
  sha?: string;
  title: string;
  date: string;
  category: string;
  readTime: string;
  summary: string;
  tags: string[];
  body: string;
  draft?: boolean;
  coverImage?: string;
  updatedAt?: string;
};

type Project = {
  slug: string;
  sha?: string;
  title: string;
  category: string;
  role: string;
  status: string;
  description: string;
  tools: string[];
  workflow: string[];
  stats: { label: string; value: string }[];
  order: number;
  body: string;
  draft?: boolean;
  coverImage?: string;
};

type Workspace = "blogs" | "projects";
type StatusFilter = "all" | "published" | "draft";

const blankPost = (): Post => ({
  slug: "",
  title: "",
  date: new Date().toISOString().slice(0, 10),
  category: "",
  readTime: "",
  summary: "",
  tags: [],
  body: "",
  draft: true,
});

const blankProject = (): Project => ({
  slug: "",
  title: "",
  category: "",
  role: "",
  status: "In Progress",
  description: "",
  tools: [],
  workflow: [],
  stats: [{ label: "", value: "" }],
  order: 0,
  body: "",
  draft: true,
});

const request = async (url: string, init?: RequestInit) => {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok)
    throw new Error(
      (await response.json().catch(() => ({}))).error || "Request failed.",
    );
  return response.status === 204 ? null : response.json();
};

const csv = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

export default function Studio() {
  const [login, setLogin] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [workspace, setWorkspace] = useState<Workspace>("blogs");
  const [posts, setPosts] = useState<Post[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [preview, setPreview] = useState(false);

  const load = async () => {
    try {
      const user = await request("/api/studio/session");
      setLogin(user.login);
      const [nextPosts, nextProjects] = await Promise.all([
        request("/api/studio/blogs"),
        request("/api/studio/projects"),
      ]);
      setPosts(nextPosts);
      setProjects(nextProjects);
    } catch {
      setLogin(null);
    } finally {
      setCheckingSession(false);
    }
  };

  useEffect(() => {
    setPageSeo({
      title: "Portfolio Studio",
      description: "Private portfolio content editor.",
      path: "/studio",
    });
    document
      .querySelector('meta[name="robots"]')
      ?.setAttribute("content", "noindex, nofollow");
    void load();
  }, []);

  const savePost = async () => {
    if (!editingPost || busy) return;
    if (!editingPost.title.trim() || !editingPost.slug.trim()) {
      setError("Title and slug are required before saving.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await request("/api/studio/blogs", {
        method: "PUT",
        body: JSON.stringify({
          slug: editingPost.slug,
          data: editingPost,
          body: editingPost.body,
          sha: editingPost.sha,
        }),
      });
      await load();
      setEditingPost(null);
      setPreview(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  const saveProject = async () => {
    if (!editingProject || busy) return;
    if (!editingProject.title.trim() || !editingProject.slug.trim()) {
      setError("Project title and slug are required before saving.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await request("/api/studio/projects", {
        method: "PUT",
        body: JSON.stringify({
          slug: editingProject.slug,
          data: editingProject,
          body: editingProject.body,
          sha: editingProject.sha,
        }),
      });
      await load();
      setEditingProject(null);
      setPreview(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (type: Workspace, item: Post | Project) => {
    if (
      !item.sha ||
      !confirm(
        `Delete this ${type === "blogs" ? "article" : "project"} permanently?`,
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      await request(`/api/studio/${type}`, {
        method: "DELETE",
        body: JSON.stringify({ slug: item.slug, sha: item.sha }),
      });
      await load();
      if (type === "blogs") setEditingPost(null);
      else setEditingProject(null);
      setPreview(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete.");
    } finally {
      setBusy(false);
    }
  };

  const selectWorkspace = (next: Workspace) => {
    setWorkspace(next);
    setError("");
    setQuery("");
    setStatusFilter("all");
    setPreview(false);
  };

  const newEntry = () => {
    setError("");
    setPreview(false);
    if (workspace === "blogs") setEditingPost(blankPost());
    else setEditingProject(blankProject());
  };

  const filteredPosts = useMemo(() => {
    const q = query.toLowerCase().trim();
    return posts
      .filter((post) => {
        if (statusFilter === "published" && post.draft) return false;
        if (statusFilter === "draft" && !post.draft) return false;
        if (!q) return true;
        return (
          post.title.toLowerCase().includes(q) ||
          post.slug.toLowerCase().includes(q) ||
          post.category.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [posts, query, statusFilter]);

  const filteredProjects = useMemo(() => {
    const q = query.toLowerCase().trim();
    return projects
      .filter((project) => {
        if (statusFilter === "published" && project.draft) return false;
        if (statusFilter === "draft" && !project.draft) return false;
        if (!q) return true;
        return (
          project.title.toLowerCase().includes(q) ||
          project.slug.toLowerCase().includes(q) ||
          project.category.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.order - b.order);
  }, [projects, query, statusFilter]);

  const draftCount =
    workspace === "blogs"
      ? posts.filter((p) => p.draft).length
      : projects.filter((p) => p.draft).length;
  const totalCount = workspace === "blogs" ? posts.length : projects.length;
  const activeSlug =
    workspace === "blogs" ? editingPost?.slug : editingProject?.slug;

  if (checkingSession) {
    return (
      <main className="app-shell flex min-h-screen items-center justify-center p-6">
        <div className="studio-loading" aria-label="Loading studio">
          <span className="github-mark">◉</span>
          <p>Connecting to studio…</p>
        </div>
      </main>
    );
  }

  if (!login) {
    return (
      <main className="app-shell flex min-h-screen flex-col">
        <div className="github-topbar">
          <div className="github-topbar-inner">
            <span className="github-wordmark">
              <span className="github-mark">◉</span> cmosqueda / studio
            </span>
            <ThemeToggle className="github-theme-toggle" />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <section className="studio-signin">
            <p className="github-badge">
              <BookMarked size={12} /> Private workspace
            </p>
            <h1>Portfolio Studio</h1>
            <p className="github-muted">
              The portfolio-branded editor for articles and featured projects.
              Sign in with the authorized GitHub account to commit straight to{" "}
              <code>main</code>.
            </p>
            <a href="/api/studio/auth" className="github-btn-primary">
              Sign in with GitHub
            </a>
            <p className="studio-signin-note">
              Restricted area · robots noindex · OAuth via /api/studio/callback
            </p>
          </section>
        </div>
      </main>
    );
  }

  const isBlogs = workspace === "blogs";
  const activeEditor = isBlogs ? editingPost : editingProject;

  return (
    <main className="app-shell min-h-screen">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="github-topbar">
        <div className="github-topbar-inner studio-topbar">
          <a href="/" className="github-wordmark" aria-label="Back to portfolio">
            <span className="github-mark">◉</span>
            <span className="studio-crumb">
              cmosqueda <span>/</span> <strong>studio</strong>
            </span>
          </a>
          <nav className="github-tabs studio-tabs" aria-label="Studio workspaces">
            <button
              onClick={() => selectWorkspace("blogs")}
              className={`github-tab studio-tab ${isBlogs ? "github-tab-active" : ""}`}
              aria-current={isBlogs ? "page" : undefined}
            >
              <Newspaper size={14} /> Articles
              <span className="github-badge">{posts.length}</span>
            </button>
            <button
              onClick={() => selectWorkspace("projects")}
              className={`github-tab studio-tab ${!isBlogs ? "github-tab-active" : ""}`}
              aria-current={!isBlogs ? "page" : undefined}
            >
              <FolderKanban size={14} /> Projects
              <span className="github-badge">{projects.length}</span>
            </button>
          </nav>
          <div className="studio-topbar-actions">
            <ThemeToggle className="github-theme-toggle" />
            <span className="studio-avatar" title={login}>
              {login.slice(0, 1).toUpperCase()}
            </span>
            <button
              className="github-icon-button studio-signout"
              onClick={async () => {
                await request("/api/studio/session", { method: "DELETE" });
                setLogin(null);
              }}
              aria-label="Sign out"
              title={`Sign out (${login})`}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>

      <div className="studio-shell">
        {/* ── Repo header ───────────────────────────────────── */}
        <header className="studio-repohead">
          <div className="studio-repohead-left">
            <span className="studio-repo-icon">
              <BookMarked size={17} />
            </span>
            <div>
              <p className="studio-repo-title">
                portfolio-content <span>/</span> {isBlogs ? "articles" : "projects"}
              </p>
              <p className="github-muted studio-repo-sub">
                {isBlogs
                  ? "Markdown articles committed to main"
                  : "Featured case studies committed to main"}{" "}
                · signed in as <strong>{login}</strong>
              </p>
            </div>
          </div>
          <div className="studio-repohead-right">
            <span className="github-badge">
              <span className="studio-dot" /> main
            </span>
            <span className="github-badge">Public</span>
            <button onClick={newEntry} className="github-btn-primary studio-new">
              <Plus size={15} /> New {isBlogs ? "article" : "project"}
            </button>
          </div>
        </header>

        {/* ── Stat strip ────────────────────────────────────── */}
        <div className="studio-stats" role="status">
          <div className="github-info-card studio-stat">
            <span className="github-muted">Total</span>
            <strong>{totalCount}</strong>
          </div>
          <div className="github-info-card studio-stat">
            <span className="github-muted">Drafts</span>
            <strong>{draftCount}</strong>
          </div>
          <div className="github-info-card studio-stat">
            <span className="github-muted">Published</span>
            <strong>{totalCount - draftCount}</strong>
          </div>
          <div className="github-info-card studio-stat studio-stat-wide">
            <FileCode2 size={14} />
            <span className="github-muted">
              {isBlogs ? "content/blogs/*.md" : "content/projects/*.md"}
            </span>
          </div>
        </div>

        {error && (
          <div className="studio-alert" role="alert">
            <TriangleAlert size={15} />
            <span>{error}</span>
            <button onClick={() => setError("")} aria-label="Dismiss error">
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── Main grid ─────────────────────────────────────── */}
        <div className="studio-grid">
          {/* File explorer */}
          <aside className="studio-files" aria-label="Content files">
            <div className="studio-files-toolbar">
              <label className="studio-search">
                <Search size={14} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${isBlogs ? "articles" : "projects"}…`}
                  aria-label="Search files"
                />
                {query && (
                  <button onClick={() => setQuery("")} aria-label="Clear search">
                    <X size={13} />
                  </button>
                )}
              </label>
              <div className="studio-filter" role="tablist" aria-label="Filter by status">
                {(["all", "published", "draft"] as StatusFilter[]).map((f) => (
                  <button
                    key={f}
                    role="tab"
                    aria-selected={statusFilter === f}
                    onClick={() => setStatusFilter(f)}
                    className={statusFilter === f ? "studio-filter-active" : ""}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="studio-filelist">
              {isBlogs ? (
                filteredPosts.length === 0 ? (
                  <EmptyState
                    icon={<BookOpen size={18} />}
                    title="No articles found"
                    hint="Try a different search, or create a new article."
                    action={newEntry}
                    actionLabel="New article"
                  />
                ) : (
                  filteredPosts.map((post) => (
                    <button
                      key={post.slug}
                      onClick={() => {
                        setEditingPost(post);
                        setPreview(false);
                        setError("");
                      }}
                      className={`studio-file ${activeSlug === post.slug ? "studio-file-active" : ""}`}
                    >
                      <span className="studio-file-icon">
                        <FileCode2 size={15} />
                      </span>
                      <span className="studio-file-main">
                        <span className="studio-file-title">
                          {post.title || "(untitled)"}
                        </span>
                        <span className="github-muted studio-file-meta">
                          {post.slug}.md · {post.draft ? "draft" : post.date || "published"}
                        </span>
                      </span>
                      <StatusBadge draft={post.draft} />
                    </button>
                  ))
                )
              ) : filteredProjects.length === 0 ? (
                <EmptyState
                  icon={<FolderKanban size={18} />}
                  title="No projects found"
                  hint="Try a different search, or pin a new project."
                  action={newEntry}
                  actionLabel="New project"
                />
              ) : (
                filteredProjects.map((project) => (
                  <button
                    key={project.slug}
                    onClick={() => {
                      setEditingProject(project);
                      setPreview(false);
                      setError("");
                    }}
                    className={`studio-file ${activeSlug === project.slug ? "studio-file-active" : ""}`}
                  >
                    <span className="studio-file-icon">
                      <FileCode2 size={15} />
                    </span>
                    <span className="studio-file-main">
                      <span className="studio-file-title">
                        {project.title || "(untitled)"}
                      </span>
                      <span className="github-muted studio-file-meta">
                        {project.slug}.md · #{project.order} ·{" "}
                        {project.draft ? "draft" : project.status}
                      </span>
                    </span>
                    <StatusBadge draft={project.draft} />
                  </button>
                ))
              )}
            </div>

            <button onClick={newEntry} className="github-button studio-files-new">
              <FilePlus2 size={15} /> New {isBlogs ? "article" : "project"}
            </button>
          </aside>

          {/* Editor */}
          <section className="studio-editor" aria-label="Editor">
            {!activeEditor ? (
              <div className="studio-empty">
                <span className="studio-empty-icon">
                  {isBlogs ? <BookOpen size={20} /> : <FolderKanban size={20} />}
                </span>
                <h2>
                  {isBlogs ? "Select an article" : "Select a project"} to edit
                </h2>
                <p className="github-muted">
                  Pick a file on the left, or create a new{" "}
                  {isBlogs ? "article" : "featured project"}. Saves commit
                  Markdown directly to <code>main</code>.
                </p>
                <button onClick={newEntry} className="github-btn-primary">
                  <Plus size={15} /> New {isBlogs ? "article" : "project"}
                </button>
              </div>
            ) : isBlogs && editingPost ? (
              <BlogEditor
                post={editingPost}
                setPost={setEditingPost}
                save={savePost}
                busy={busy}
                preview={preview}
                setPreview={setPreview}
                remove={() => remove("blogs", editingPost)}
              />
            ) : !isBlogs && editingProject ? (
              <ProjectEditor
                project={editingProject}
                setProject={setEditingProject}
                save={saveProject}
                busy={busy}
                preview={preview}
                setPreview={setPreview}
                remove={() => remove("projects", editingProject)}
              />
            ) : null}
          </section>
        </div>

        <footer className="github-muted studio-foot">
          <span>
            studio · commits as <strong>{login}</strong> to branch{" "}
            <code>main</code>
          </span>
          <a href="/">← back to portfolio</a>
        </footer>
      </div>
    </main>
  );
}

/* ── Bits ─────────────────────────────────────────────────── */

function StatusBadge({ draft }: { draft?: boolean }) {
  return draft ? (
    <span className="github-badge studio-badge-draft">
      <span className="studio-dot studio-dot-draft" /> draft
    </span>
  ) : (
    <span className="github-badge studio-badge-live">
      <Check size={11} /> live
    </span>
  );
}

function EmptyState({
  icon,
  title,
  hint,
  action,
  actionLabel,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  action: () => void;
  actionLabel: string;
}) {
  return (
    <div className="studio-file-empty">
      <span>{icon}</span>
      <strong>{title}</strong>
      <p className="github-muted">{hint}</p>
      <button onClick={action} className="github-button">
        {actionLabel}
      </button>
    </div>
  );
}

function EditorChrome({
  kind,
  fileName,
  title,
  isNew,
  draft,
  busy,
  preview,
  setPreview,
  save,
  remove,
  children,
}: {
  kind: string;
  fileName: string;
  title: string;
  isNew: boolean;
  draft?: boolean;
  busy: boolean;
  preview: boolean;
  setPreview: (v: boolean) => void;
  save: () => void;
  remove: () => Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <div className="studio-doc">
      <div className="studio-doc-bar">
        <div className="studio-doc-file">
          <FileCode2 size={15} />
          <span className="studio-doc-path">
            {kind} <ChevronRight size={12} /> {(fileName || "untitled")}.md
          </span>
          <StatusBadge draft={draft} />
        </div>
        <div className="studio-doc-actions">
          <div className="studio-compose-tabs" role="tablist" aria-label="Edit or preview">
            <button
              role="tab"
              aria-selected={!preview}
              className={!preview ? "studio-compose-active" : ""}
              onClick={() => setPreview(false)}
            >
              <Pencil size={13} /> Edit
            </button>
            <button
              role="tab"
              aria-selected={preview}
              className={preview ? "studio-compose-active" : ""}
              onClick={() => setPreview(true)}
            >
              <Eye size={13} /> Preview
            </button>
          </div>
          <button
            onClick={remove}
            disabled={isNew || busy}
            className="github-icon-button studio-icon-danger"
            aria-label="Delete file"
            title="Delete file"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="studio-doc-title">
        <p className="github-muted studio-kicker">
          {isNew ? "New file · uncommitted" : "Editing file on main"}
        </p>
        <h2>{title || "(untitled)"}</h2>
      </div>

      {children}

      <div className="studio-doc-foot">
        <p className="github-muted">
          {isNew
            ? "Saving creates a new Markdown file on main."
            : "Saving commits an update to main."}
        </p>
        <button
          onClick={save}
          disabled={busy}
          className="github-btn-primary studio-save"
        >
          <Save size={15} /> {busy ? "Committing…" : isNew ? "Publish file" : "Commit changes"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  span,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  span?: boolean;
  hint?: string;
}) {
  return (
    <label className={`studio-field ${span ? "studio-field-span" : ""}`}>
      <span className="studio-label">
        {label}
        {hint && <em>{hint}</em>}
      </span>
      {children}
    </label>
  );
}

const inputCls = "studio-input";
const areaCls = "studio-input studio-area";
const monoCls = "studio-input studio-area studio-mono";

/* ── Blog editor ──────────────────────────────────────────── */

function BlogEditor({
  post,
  setPost,
  save,
  busy,
  preview,
  setPreview,
  remove,
}: {
  post: Post;
  setPost: (post: Post) => void;
  save: () => void;
  busy: boolean;
  preview: boolean;
  setPreview: (v: boolean) => void;
  remove: () => Promise<void>;
}) {
  const update = <K extends keyof Post>(key: K, value: Post[K]) => {
    if (key === "title" && (!post.slug || post.slug === slugify(post.title))) {
      setPost({ ...post, title: value as string, slug: slugify(value as string) });
      return;
    }
    setPost({ ...post, [key]: value });
  };

  return (
    <EditorChrome
      kind={post.draft ? "drafts" : "articles"}
      fileName={post.slug}
      title={post.title}
      isNew={!post.sha}
      draft={post.draft}
      busy={busy}
      preview={preview}
      setPreview={setPreview}
      save={save}
      remove={remove}
    >
      {preview ? (
        <div className="studio-preview">
          <p className="github-muted studio-kicker">Preview · rendered Markdown</p>
          <h3>{post.title || "(untitled)"}</h3>
          {post.summary && <p className="studio-preview-summary">{post.summary}</p>}
          <div className="github-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.body || "_Nothing to preview yet._"}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        <>
          <div className="studio-section">
            <h3>
              <BookOpen size={14} /> Frontmatter
            </h3>
            <div className="studio-form-grid">
              <Field label="Title" span>
                <input
                  className={inputCls}
                  value={post.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="e.g. How I map messy workflows"
                />
              </Field>
              <Field label="Slug" hint="auto from title">
                <input
                  className={`${inputCls} studio-mono-input`}
                  value={post.slug}
                  onChange={(e) => update("slug", slugify(e.target.value))}
                  placeholder="my-article-slug"
                  spellCheck={false}
                />
              </Field>
              <Field label="Publish date">
                <input
                  className={inputCls}
                  type="date"
                  value={post.date}
                  onChange={(e) => update("date", e.target.value)}
                />
              </Field>
              <Field label="Category">
                <input
                  className={inputCls}
                  value={post.category}
                  onChange={(e) => update("category", e.target.value)}
                  placeholder="Systems · Research · QA"
                />
              </Field>
              <Field label="Reading time">
                <input
                  className={inputCls}
                  value={post.readTime}
                  onChange={(e) => update("readTime", e.target.value)}
                  placeholder="6 min read"
                />
              </Field>
              <Field label="Cover image" hint="optional path">
                <input
                  className={`${inputCls} studio-mono-input`}
                  value={post.coverImage ?? ""}
                  onChange={(e) => update("coverImage", e.target.value)}
                  placeholder="/images/blog/cover.png"
                  spellCheck={false}
                />
              </Field>
              <Field label="Summary" span>
                <textarea
                  className={areaCls}
                  rows={3}
                  value={post.summary}
                  onChange={(e) => update("summary", e.target.value)}
                  placeholder="One or two sentences shown on the article card."
                />
              </Field>
              <Field label="Tags" hint="comma separated" span>
                <input
                  className={inputCls}
                  value={post.tags.join(", ")}
                  onChange={(e) => update("tags", csv(e.target.value))}
                  placeholder="systems, research, qa"
                />
              </Field>
              <label className="studio-check studio-field-span">
                <input
                  type="checkbox"
                  checked={post.draft === true}
                  onChange={(e) => update("draft", e.target.checked)}
                />
                <span>
                  Save as draft
                  <em>Drafts stay hidden on the portfolio.</em>
                </span>
              </label>
            </div>
          </div>

          <div className="studio-section">
            <h3>
              <FileCode2 size={14} /> Article body
              <span className="github-muted">{post.body.length} chars</span>
            </h3>
            <textarea
              className={monoCls}
              rows={18}
              value={post.body}
              onChange={(e) => update("body", e.target.value)}
              placeholder={"# Start writing in Markdown…"}
              spellCheck={false}
            />
          </div>
        </>
      )}
    </EditorChrome>
  );
}

/* ── Project editor ───────────────────────────────────────── */

function ProjectEditor({
  project,
  setProject,
  save,
  busy,
  preview,
  setPreview,
  remove,
}: {
  project: Project;
  setProject: (project: Project) => void;
  save: () => void;
  busy: boolean;
  preview: boolean;
  setPreview: (v: boolean) => void;
  remove: () => Promise<void>;
}) {
  const update = <K extends keyof Project>(key: K, value: Project[K]) =>
    setProject({ ...project, [key]: value });

  const updateTitle = (value: string) => {
    if (!project.slug || project.slug === slugify(project.title)) {
      setProject({ ...project, title: value, slug: slugify(value) });
      return;
    }
    setProject({ ...project, title: value });
  };

  const updateStat = (index: number, key: "label" | "value", value: string) =>
    update(
      "stats",
      project.stats.map((stat, i) => (i === index ? { ...stat, [key]: value } : stat)),
    );

  return (
    <EditorChrome
      kind={project.draft ? "drafts" : "projects"}
      fileName={project.slug}
      title={project.title}
      isNew={!project.sha}
      draft={project.draft}
      busy={busy}
      preview={preview}
      setPreview={setPreview}
      save={save}
      remove={remove}
    >
      {preview ? (
        <div className="studio-preview">
          <p className="github-muted studio-kicker">Preview · case study card</p>
          <div className="github-repo-card studio-preview-card">
            <span className="github-repo-name">⌘ {project.title || "(untitled)"}</span>
            <span className="github-badge">{project.status}</span>
            <p className="github-muted">{project.description || "No summary yet."}</p>
            <div className="studio-preview-tags">
              {project.tools.slice(0, 6).map((t) => (
                <span key={t} className="github-topic">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="github-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {project.body || "_Nothing to preview yet._"}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        <>
          <div className="studio-section">
            <h3>
              <FolderKanban size={14} /> Frontmatter
            </h3>
            <div className="studio-form-grid">
              <Field label="Project title" span>
                <input
                  className={inputCls}
                  value={project.title}
                  onChange={(e) => updateTitle(e.target.value)}
                  placeholder="e.g. Claims triage console"
                />
              </Field>
              <Field label="Slug" hint="auto from title">
                <input
                  className={`${inputCls} studio-mono-input`}
                  value={project.slug}
                  onChange={(e) => update("slug", slugify(e.target.value))}
                  placeholder="claims-triage-console"
                  spellCheck={false}
                />
              </Field>
              <Field label="Display order">
                <input
                  className={inputCls}
                  type="number"
                  value={project.order}
                  onChange={(e) => update("order", Number(e.target.value))}
                />
              </Field>
              <Field label="Category">
                <input
                  className={inputCls}
                  value={project.category}
                  onChange={(e) => update("category", e.target.value)}
                  placeholder="Systems · QA · Research"
                />
              </Field>
              <Field label="Role">
                <input
                  className={inputCls}
                  value={project.role}
                  onChange={(e) => update("role", e.target.value)}
                  placeholder="Product Systems Analyst"
                />
              </Field>
              <Field label="Status">
                <select
                  className={inputCls}
                  value={project.status}
                  onChange={(e) => update("status", e.target.value)}
                >
                  <option>Planning</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>Live</option>
                </select>
              </Field>
              <Field label="Cover image" hint="optional path">
                <input
                  className={`${inputCls} studio-mono-input`}
                  value={project.coverImage ?? ""}
                  onChange={(e) => update("coverImage", e.target.value)}
                  placeholder="/images/projects/cover.png"
                  spellCheck={false}
                />
              </Field>
              <Field label="Summary" span>
                <textarea
                  className={areaCls}
                  rows={3}
                  value={project.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="One or two sentences shown on the project card."
                />
              </Field>
              <Field label="Tools" hint="comma separated">
                <input
                  className={inputCls}
                  value={project.tools.join(", ")}
                  onChange={(e) => update("tools", csv(e.target.value))}
                  placeholder="Figma, SQL, Playwright"
                />
              </Field>
              <Field label="Workflow" hint="comma separated">
                <input
                  className={inputCls}
                  value={project.workflow.join(", ")}
                  onChange={(e) => update("workflow", csv(e.target.value))}
                  placeholder="Research, Mapping, Validation"
                />
              </Field>
            </div>
          </div>

          <div className="studio-section">
            <h3>
              <BookMarked size={14} /> Statistics
              <button
                onClick={() =>
                  update("stats", [...project.stats, { label: "", value: "" }])
                }
                className="github-button studio-mini-btn"
                type="button"
              >
                <Plus size={13} /> Add
              </button>
            </h3>
            <div className="studio-stats-edit">
              {project.stats.map((stat, index) => (
                <div key={index} className="studio-stat-row">
                  <input
                    className={inputCls}
                    value={stat.label}
                    placeholder="Label"
                    onChange={(e) => updateStat(index, "label", e.target.value)}
                  />
                  <input
                    className={inputCls}
                    value={stat.value}
                    placeholder="Value"
                    onChange={(e) => updateStat(index, "value", e.target.value)}
                  />
                  <button
                    onClick={() =>
                      update(
                        "stats",
                        project.stats.filter((_, i) => i !== index),
                      )
                    }
                    disabled={project.stats.length === 1}
                    className="github-icon-button"
                    aria-label="Remove statistic"
                    type="button"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <label className="studio-check">
              <input
                type="checkbox"
                checked={project.draft === true}
                onChange={(e) => update("draft", e.target.checked)}
              />
              <span>
                Save as draft
                <em>Drafts stay hidden on the portfolio.</em>
              </span>
            </label>
          </div>

          <div className="studio-section">
            <h3>
              <FileCode2 size={14} /> Case study body
              <span className="github-muted">{project.body.length} chars</span>
            </h3>
            <textarea
              className={monoCls}
              rows={18}
              value={project.body}
              onChange={(e) => update("body", e.target.value)}
              placeholder={"# Case study in Markdown…"}
              spellCheck={false}
            />
          </div>
        </>
      )}
    </EditorChrome>
  );
}
