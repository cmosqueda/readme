import {
  ArrowUp,
  BookMarked,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  FileCode2,
  FilePlus2,
  FolderKanban,
  Globe,
  Loader2,
  LogOut,
  MapPin,
  Newspaper,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Smile,
  Trash2,
  TriangleAlert,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useBlocker, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ThemeToggle from "../components/ThemeToggle";
import { setPageSeo } from "../lib/seo";
import { useProfileStatus, type ProfileStatus } from "../data/status";
import ProfileStatusBadge from "../components/StatusBadge";
import profilePic from "../assets/glorious-goat.jpg";
import { statusIconList, renderStatusIcon } from "../lib/statusIcons";

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
  details: { label: string; value: string }[];
  order: number;
  body: string;
  draft?: boolean;
  coverImage?: string;
};

type Experience = {
  slug: string;
  sha?: string;
  company: string;
  role: string;
  period: string;
  location: string;
  order: number;
  highlights: string[];
  draft?: boolean;
  body: string;
};

type Workspace = "blogs" | "projects" | "experiences";
type StatusFilter = "all" | "published" | "draft";

type DeployInfo = {
  head: { sha: string; short: string } | null;
  contentCommit: {
    sha: string;
    short: string;
    message: string;
    date: string | null;
  } | null;
  deployed: {
    commit: string | null;
    short: string | null;
    builtAt: string | null;
  } | null;
  manifestError: string | null;
  vercel: {
    configured?: boolean;
    state?: string;
    commit?: string | null;
    url?: string | null;
    createdAt?: string | null;
    error?: string;
  } | null;
  inSync: boolean;
  checkedAt: string;
} | null;

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
  details: [{ label: "", value: "" }],
  order: 0,
  body: "",
  draft: true,
});

const blankExperience = (): Experience => ({
  slug: "",
  company: "",
  role: "",
  period: `${new Date().toLocaleDateString("en-US", { month: "short" })} ${new Date().getFullYear()} — Present`,
  location: "Cagayan de Oro, PH",
  order: 1,
  highlights: [],
  draft: true,
  body: "",
});

const request = async (url: string, init?: RequestInit) => {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || "Request failed.");
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
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [profileStatus, updateProfileStatus] = useProfileStatus();
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [preview, setPreview] = useState(false);
  const [deploy, setDeploy] = useState<DeployInfo>(null);
  const [deployState, setDeployState] = useState<"idle" | "checking" | "error">("idle");
  const deployBusy = useRef(false);

  const refreshDeploy = async () => {
    if (deployBusy.current) return;
    deployBusy.current = true;
    setDeployState("checking");
    try {
      setDeploy(await request("/api/studio/status"));
      setDeployState("idle");
    } catch {
      setDeployState("error");
    } finally {
      deployBusy.current = false;
    }
  };

  const load = async () => {
    try {
      const user = await request("/api/studio/session");
      setLogin(user.login);
      const [nextPosts, nextProjects, nextExperiences, statusData] = await Promise.all([
        request("/api/studio/blogs"),
        request("/api/studio/projects"),
        request("/api/studio/experiences").catch(() => []),
        request("/api/studio/profile-status").catch(() => null),
      ]);
      setPosts(nextPosts);
      setProjects(nextProjects);
      setExperiences(nextExperiences || []);
      if (statusData && (typeof statusData.emoji === "string" || typeof statusData.message === "string")) {
        updateProfileStatus({
          emoji: statusData.emoji ?? "",
          message: statusData.message ?? "",
        });
      }
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
    document.querySelector('meta[name="robots"]')?.setAttribute("content", "noindex, nofollow");
    void load();
  }, []);

  useEffect(() => {
    if (!login) return;
    void refreshDeploy();
    const timer = setInterval(() => {
      void refreshDeploy();
    }, 30000);
    return () => clearInterval(timer);
  }, [login]);

  // Throws on failure so callers (Save button, unsaved-changes dialog)
  // can decide whether to proceed.
  const persistPost = async (post: Post) => {
    if (!post.title.trim() || !post.slug.trim()) {
      throw new Error("Title and slug are required before saving.");
    }
    // originalSlug lets the API tell an in-place update apart from a
    // deliberate rename (slug field edited on an existing file).
    const originalPost = post.sha
      ? posts.find((p) => p.sha === post.sha)
      : undefined;
    const saveResult = await request("/api/studio/blogs", {
      method: "PUT",
      body: JSON.stringify({
        slug: post.slug,
        originalSlug: originalPost?.slug ?? post.slug,
        data: post,
        body: post.body,
        sha: post.sha,
      }),
    });
    await load();
    setEditingPost(null);
    setPreview(false);
    if (saveResult?.warning) setError(saveResult.warning);
    void refreshDeploy();
  };

  const savePost = async () => {
    if (!editingPost || busy) return;
    setBusy(true);
    setError("");
    try {
      await persistPost(editingPost);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  const persistProject = async (project: Project) => {
    if (!project.title.trim() || !project.slug.trim()) {
      throw new Error("Project title and slug are required before saving.");
    }
    const originalProject = project.sha
      ? projects.find((p) => p.sha === project.sha)
      : undefined;
    const projectResult = await request("/api/studio/projects", {
      method: "PUT",
      body: JSON.stringify({
        slug: project.slug,
        originalSlug: originalProject?.slug ?? project.slug,
        data: project,
        body: project.body,
        sha: project.sha,
      }),
    });
    await load();
    setEditingProject(null);
    setPreview(false);
    if (projectResult?.warning) setError(projectResult.warning);
    void refreshDeploy();
  };

  const saveProject = async () => {
    if (!editingProject || busy) return;
    setBusy(true);
    setError("");
    try {
      await persistProject(editingProject);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  const persistExperience = async (experience: Experience) => {
    if (!experience.role.trim() || !experience.company.trim() || !experience.slug.trim()) {
      throw new Error("Role, company, and slug are required before saving.");
    }
    const originalExperience = experience.sha
      ? experiences.find((e) => e.sha === experience.sha)
      : undefined;
    const expResult = await request("/api/studio/experiences", {
      method: "PUT",
      body: JSON.stringify({
        slug: experience.slug,
        originalSlug: originalExperience?.slug ?? experience.slug,
        data: experience,
        body: experience.body,
        sha: experience.sha,
      }),
    });
    await load();
    setEditingExperience(null);
    setPreview(false);
    if (expResult?.warning) setError(expResult.warning);
    void refreshDeploy();
  };

  const saveExperience = async () => {
    if (!editingExperience || busy) return;
    setBusy(true);
    setError("");
    try {
      await persistExperience(editingExperience);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  const [pendingDelete, setPendingDelete] = useState<{
    type: Workspace;
    slug: string;
    title: string;
    sha: string;
  } | null>(null);

  const askDelete = (type: Workspace, item: Post | Project | Experience) => {
    if (!item.sha || busy) return;
    const title =
      "title" in item
        ? item.title || "(untitled)"
        : `${item.role || "Role"} at ${item.company || "Company"}`;
    setPendingDelete({
      type,
      slug: item.slug,
      title,
      sha: item.sha,
    });
  };

  const confirmDelete = async () => {
    if (!pendingDelete || busy) return;
    const { type, slug, sha } = pendingDelete;
    setBusy(true);
    setError("");
    try {
      await request(`/api/studio/${type}`, {
        method: "DELETE",
        body: JSON.stringify({ slug, sha }),
      });
      await load();
      if (type === "blogs") setEditingPost(null);
      else if (type === "projects") setEditingProject(null);
      else setEditingExperience(null);
      setPreview(false);
      setPendingDelete(null);
      void refreshDeploy();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!pendingDelete) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) setPendingDelete(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pendingDelete, busy]);

  /* ── Unsaved-changes guard ────────────────────────────────
     baselineRef snapshots the item when its editor opens; any deviation
     means unsaved work. guardNav() wraps every in-studio exit (tabs, file
     select, new entry, sign-out) and useBlocker covers router exits. */
  const baselineRef = useRef<string | null>(null);
  // Object twin of baselineRef so Discard can restore content, not just
  // close the dialog (otherwise the dirty editor survives and the guard
  // fires again on the very next exit).
  const baselineItemRef = useRef<Post | Project | Experience | null>(null);
  type PendingNav =
    | { kind: "studio"; run: () => void | Promise<void> }
    | { kind: "router"; run: () => void; dest: string };
  const pendingNavRef = useRef<PendingNav | null>(null);
  // Bridges the dialog handoff: while set, neither guardNav nor the
  // blocker effect may reopen the dialog (kills reopen races outright).
  const suppressRef = useRef(false);
  const [unsavedOpen, setUnsavedOpen] = useState(false);
  const unsavedOpenRef = useRef(false);
  unsavedOpenRef.current = unsavedOpen;

  const activeItem: Post | Project | Experience | null =
    workspace === "blogs"
      ? editingPost
      : workspace === "projects"
      ? editingProject
      : editingExperience;
  const dirty =
    activeItem !== null && baselineRef.current !== null
      ? JSON.stringify(activeItem) !== baselineRef.current
      : false;
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  const guardNav = (action: () => void | Promise<void>) => {
    if (suppressRef.current || !dirtyRef.current || busy) {
      void action();
      return;
    }
    pendingNavRef.current = { kind: "studio", run: action };
    setUnsavedOpen(true);
  };

  const blocker = useBlocker(dirty || unsavedOpen);
  const blockerRef = useRef(blocker);
  blockerRef.current = blocker;
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  useEffect(() => {
    // Router exit (portfolio links, back button). Ignored while suppressed
    // or while the dialog is already open for an in-studio exit —
    // dismissing handles the reset.
    if (suppressRef.current) return;
    if (blocker.state === "blocked" && !unsavedOpenRef.current) {
      const dest = `${blocker.location.pathname}${blocker.location.search}${blocker.location.hash}`;
      pendingNavRef.current = {
        kind: "router",
        dest,
        run: () => {
          const current = blockerRef.current;
          if (current.state === "blocked") current.proceed();
          else navigateRef.current(dest);
        },
      };
      setUnsavedOpen(true);
    }
  }, [blocker]);

  // Page refresh / tab close: browsers only allow the native prompt here.
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (dirtyRef.current) event.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  useEffect(() => {
    if (!unsavedOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        blockerRef.current.reset?.();
        pendingNavRef.current = null;
        setUnsavedOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [unsavedOpen, busy]);

  const releaseSuppress = () => {
    window.setTimeout(() => {
      suppressRef.current = false;
    }, 100);
  };

  const cancelUnsaved = () => {
    if (busy) return;
    suppressRef.current = true;
    blockerRef.current.reset?.();
    pendingNavRef.current = null;
    setUnsavedOpen(false);
    releaseSuppress();
  };

  const discardUnsaved = () => {
    if (busy) return;
    suppressRef.current = true;
    const pending = pendingNavRef.current;
    pendingNavRef.current = null;
    setUnsavedOpen(false);
    // Revert first: abandoning edits must leave a clean editor behind,
    // otherwise the guard refires on the next exit and the dialog persists.
    revertToBaseline();
    try {
      if (pending?.kind === "router") {
        // Router exits must proceed, never reset-then-run (reset would
        // strand the navigation and leave the dialog's job undone).
        pending.run();
      } else {
        // Studio exits: clear any stale router block first so it can
        // never resurface as a phantom dialog.
        blockerRef.current.reset?.();
        void pending?.run();
      }
    } finally {
      releaseSuppress();
    }
  };

  const saveDraftAndContinue = async () => {
    if (busy) return;
    const flaggedPost =
      editingPost !== null ? { ...editingPost, draft: true } : null;
    const flaggedProject =
      editingPost === null && editingProject !== null
        ? { ...editingProject, draft: true }
        : null;
    const flaggedExperience =
      editingPost === null && editingProject === null && editingExperience !== null
        ? { ...editingExperience, draft: true }
        : null;
    if (!flaggedPost && !flaggedProject && !flaggedExperience) {
      cancelUnsaved();
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (flaggedPost) await persistPost(flaggedPost);
      else if (flaggedProject) await persistProject(flaggedProject);
      else if (flaggedExperience) await persistExperience(flaggedExperience);
      // The blocker is still engaged (dialog open), so a router
      // destination proceeds; in-studio actions just run.
      suppressRef.current = true;
      const pending = pendingNavRef.current;
      pendingNavRef.current = null;
      setUnsavedOpen(false);
      try {
        if (pending?.kind === "router") pending.run();
        else {
          blockerRef.current.reset?.();
          void pending?.run();
        }
      } finally {
        releaseSuppress();
      }
    } catch (caught) {
      // Keep the dialog open so no work is lost; the error shows behind it.
      setError(caught instanceof Error ? caught.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  const selectWorkspace = (next: Workspace) => {
    guardNav(() => {
      setWorkspace(next);
      setError("");
      setQuery("");
      setStatusFilter("all");
      setPreview(false);
    });
  };

  const openPost = (post: Post) => {
    setEditingPost(post);
    baselineRef.current = JSON.stringify(post);
    baselineItemRef.current = post;
    setPreview(false);
    setError("");
  };

  const openProject = (project: Project) => {
    setEditingProject(project);
    baselineRef.current = JSON.stringify(project);
    baselineItemRef.current = project;
    setPreview(false);
    setError("");
  };

  const openExperience = (exp: Experience) => {
    setEditingExperience(exp);
    baselineRef.current = JSON.stringify(exp);
    baselineItemRef.current = exp;
    setPreview(false);
    setError("");
  };

  const newEntry = () => {
    guardNav(() => {
      setError("");
      setPreview(false);
      if (workspace === "blogs") {
        const fresh = blankPost();
        setEditingPost(fresh);
        baselineRef.current = JSON.stringify(fresh);
        baselineItemRef.current = fresh;
      } else if (workspace === "projects") {
        const fresh = blankProject();
        setEditingProject(fresh);
        baselineRef.current = JSON.stringify(fresh);
        baselineItemRef.current = fresh;
      } else {
        const fresh = blankExperience();
        setEditingExperience(fresh);
        baselineRef.current = JSON.stringify(fresh);
        baselineItemRef.current = fresh;
      }
    });
  };

  // Abandon unsaved edits: existing files revert to their last-saved
  // snapshot, brand-new entries close outright.
  const revertToBaseline = () => {
    const snapshot = baselineItemRef.current;
    const restored = snapshot
      ? (JSON.parse(JSON.stringify(snapshot)) as Post & Project & Experience)
      : null;
    if (workspace === "blogs") {
      setEditingPost(restored && restored.sha ? (restored as Post) : null);
    } else if (workspace === "projects") {
      setEditingProject(
        restored && restored.sha ? (restored as Project) : null,
      );
    } else {
      setEditingExperience(
        restored && restored.sha ? (restored as Experience) : null,
      );
    }
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

  const filteredExperiences = useMemo(() => {
    const q = query.toLowerCase().trim();
    return experiences
      .filter((exp) => {
        if (statusFilter === "published" && exp.draft) return false;
        if (statusFilter === "draft" && !exp.draft) return false;
        if (!q) return true;
        return (
          exp.role.toLowerCase().includes(q) ||
          exp.company.toLowerCase().includes(q) ||
          exp.location.toLowerCase().includes(q) ||
          exp.slug.toLowerCase().includes(q) ||
          exp.highlights.some((h) => h.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => Number(a.order) - Number(b.order));
  }, [experiences, query, statusFilter]);

  const draftCount =
    workspace === "blogs"
      ? posts.filter((p) => p.draft).length
      : workspace === "projects"
      ? projects.filter((p) => p.draft).length
      : experiences.filter((e) => e.draft).length;
  const totalCount =
    workspace === "blogs"
      ? posts.length
      : workspace === "projects"
      ? projects.length
      : experiences.length;
  const activeSlug =
    workspace === "blogs"
      ? editingPost?.slug
      : workspace === "projects"
      ? editingProject?.slug
      : editingExperience?.slug;

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
              The portfolio-branded editor for articles and featured projects. Sign in with the authorized GitHub
              account to commit straight to <code>main</code>.
            </p>
            <a href="/api/studio/auth" className="github-btn-primary">
              Sign in with GitHub
            </a>
            <p className="studio-signin-note">Restricted area · robots noindex · OAuth via /api/studio/callback</p>
          </section>
        </div>
      </main>
    );
  }

  const isBlogs = workspace === "blogs";
  const isProjects = workspace === "projects";
  const isExperiences = workspace === "experiences";
  const activeEditor = isBlogs ? editingPost : isProjects ? editingProject : editingExperience;

  const workspaceNoun = isBlogs ? "article" : isProjects ? "project" : "experience";
  const workspaceTitle = isBlogs ? "articles" : isProjects ? "projects" : "experiences";

  return (
    <main className="app-shell min-h-screen">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="github-topbar">
        <div className="github-topbar-inner studio-topbar">
          <Link to="/" className="github-wordmark" aria-label="Back to portfolio">
            <span className="github-mark">◉</span>
            <span className="studio-crumb">
              cmosqueda <span>/</span> <strong>studio</strong>
            </span>
          </Link>
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
              className={`github-tab studio-tab ${isProjects ? "github-tab-active" : ""}`}
              aria-current={isProjects ? "page" : undefined}
            >
              <FolderKanban size={14} /> Projects
              <span className="github-badge">{projects.length}</span>
            </button>
            <button
              onClick={() => selectWorkspace("experiences")}
              className={`github-tab studio-tab ${isExperiences ? "github-tab-active" : ""}`}
              aria-current={isExperiences ? "page" : undefined}
            >
              <BriefcaseBusiness size={14} /> Experiences
              <span className="github-badge">{experiences.length}</span>
            </button>
          </nav>
          <div className="studio-topbar-actions">
            <ProfileMenu
              login={login}
              status={profileStatus}
              onEditStatus={() => setStatusModalOpen(true)}
              onSignOut={async () => {
                guardNav(async () => {
                  await request("/api/studio/session", { method: "DELETE" });
                  setLogin(null);
                });
              }}
            />
          </div>
        </div>
      </div>

      <div className="studio-shell">
        {/* ── Repo header ───────────────────────────────────── */}
        <header className="studio-repohead">
          <div className="studio-repohead-left">
            <span className="studio-repo-icon">
              {isBlogs ? <BookMarked size={17} /> : isProjects ? <FolderKanban size={17} /> : <BriefcaseBusiness size={17} />}
            </span>
            <div>
              <p className="studio-repo-title">
                portfolio-content <span>/</span> {workspaceTitle}
              </p>
              <p className="github-muted studio-repo-sub">
                {isBlogs
                  ? "Markdown articles committed to main"
                  : isProjects
                  ? "Featured case studies committed to main"
                  : "Career experience entries committed to main"}{" "}
                · signed in as <strong>{login}</strong>
              </p>
            </div>
          </div>
          <div className="studio-repohead-right">
            <DeployStatus
              deploy={deploy}
              state={deployState}
              onRefresh={() => {
                void refreshDeploy();
              }}
            />
            <button
              type="button"
              onClick={() => setStatusModalOpen(true)}
              className="github-button flex items-center gap-2"
              title="Edit public profile status"
            >
              {renderStatusIcon(profileStatus.emoji, 13, "text-[var(--gh-muted)]")}
              <span className="max-w-[120px] truncate text-xs font-medium">
                {profileStatus.message || "Set status"}
              </span>
            </button>
            <span className="github-badge">
              <span className="studio-dot" /> main
            </span>
            <span className="github-badge">Public</span>
            <button onClick={newEntry} className="github-btn-primary studio-new">
              <Plus size={15} /> New {workspaceNoun}
            </button>
          </div>
        </header>

        {/* ── Workspace summary ─────────────────────────────── */}
        <div className="studio-summary" role="status">
          <div className="github-info-card studio-summary-item">
            <span className="github-muted">Total</span>
            <strong>{totalCount}</strong>
          </div>
          <div className="github-info-card studio-summary-item">
            <span className="github-muted">Drafts</span>
            <strong>{draftCount}</strong>
          </div>
          <div className="github-info-card studio-summary-item">
            <span className="github-muted">Published</span>
            <strong>{totalCount - draftCount}</strong>
          </div>
          <div className="github-info-card studio-summary-item studio-summary-wide">
            <FileCode2 size={14} />
            <span className="github-muted">
              {isBlogs
                ? "content/blogs/*.md"
                : isProjects
                ? "content/projects/*.md"
                : "content/experiences/*.md"}
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
                  placeholder={`Search ${workspaceTitle}…`}
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
                      onClick={() => guardNav(() => openPost(post))}
                      className={`studio-file ${activeSlug === post.slug ? "studio-file-active" : ""}`}
                    >
                      <span className="studio-file-icon">
                        <FileCode2 size={15} />
                      </span>
                      <span className="studio-file-main">
                        <span className="studio-file-title">{post.title || "(untitled)"}</span>
                        <span className="github-muted studio-file-meta">
                          {post.slug}.md · {post.draft ? "draft" : post.date || "published"}
                        </span>
                      </span>
                      <StatusBadge draft={post.draft} />
                    </button>
                  ))
                )
              ) : isProjects ? (
                filteredProjects.length === 0 ? (
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
                      onClick={() => guardNav(() => openProject(project))}
                      className={`studio-file ${activeSlug === project.slug ? "studio-file-active" : ""}`}
                    >
                      <span className="studio-file-icon">
                        <FileCode2 size={15} />
                      </span>
                      <span className="studio-file-main">
                        <span className="studio-file-title">{project.title || "(untitled)"}</span>
                        <span className="github-muted studio-file-meta">
                          {project.slug}.md · #{project.order} · {project.draft ? "draft" : project.status}
                        </span>
                      </span>
                      <StatusBadge draft={project.draft} />
                    </button>
                  ))
                )
              ) : (
                filteredExperiences.length === 0 ? (
                  <EmptyState
                    icon={<BriefcaseBusiness size={18} />}
                    title="No experiences found"
                    hint="Try a different search, or add a career entry."
                    action={newEntry}
                    actionLabel="New experience"
                  />
                ) : (
                  filteredExperiences.map((exp) => (
                    <button
                      key={exp.slug}
                      onClick={() => guardNav(() => openExperience(exp))}
                      className={`studio-file ${activeSlug === exp.slug ? "studio-file-active" : ""}`}
                    >
                      <span className="studio-file-icon">
                        <BriefcaseBusiness size={15} />
                      </span>
                      <span className="studio-file-main">
                        <span className="studio-file-title">{exp.role || "(untitled role)"}</span>
                        <span className="github-muted studio-file-meta">
                          {exp.company} · #{exp.order} · {exp.period}
                        </span>
                      </span>
                      <StatusBadge draft={exp.draft} />
                    </button>
                  ))
                )
              )}
            </div>

            <button onClick={newEntry} className="github-button studio-files-new">
              <FilePlus2 size={15} /> New {workspaceNoun}
            </button>
          </aside>

          {/* Editor */}
          <section className="studio-editor" aria-label="Editor">
            {!activeEditor ? (
              <div className="studio-empty">
                <span className="studio-empty-icon">
                  {isBlogs ? (
                    <BookOpen size={20} />
                  ) : isProjects ? (
                    <FolderKanban size={20} />
                  ) : (
                    <BriefcaseBusiness size={20} />
                  )}
                </span>
                <h2>Select an {workspaceNoun} to edit</h2>
                <p className="github-muted">
                  Pick a file on the left, or create a new {workspaceNoun}. Saves commit
                  Markdown directly to <code>main</code>.
                </p>
                <button onClick={newEntry} className="github-btn-primary">
                  <Plus size={15} /> New {workspaceNoun}
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
                remove={() => askDelete("blogs", editingPost)}
              />
            ) : isProjects && editingProject ? (
              <ProjectEditor
                project={editingProject}
                setProject={setEditingProject}
                save={saveProject}
                busy={busy}
                preview={preview}
                setPreview={setPreview}
                remove={() => askDelete("projects", editingProject)}
              />
            ) : isExperiences && editingExperience ? (
              <ExperienceEditor
                experience={editingExperience}
                setExperience={setEditingExperience}
                save={saveExperience}
                busy={busy}
                preview={preview}
                setPreview={setPreview}
                remove={() => askDelete("experiences", editingExperience)}
              />
            ) : null}
          </section>
        </div>

        <footer className="github-muted studio-foot">
          <span>
            studio · commits as <strong>{login}</strong> to branch <code>main</code>
          </span>
          <Link to="/">← back to portfolio</Link>
        </footer>
      </div>

      {pendingDelete && (
        <div
          className="studio-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !busy) setPendingDelete(null);
          }}
        >
          <div
            className="studio-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="studio-delete-title"
            aria-describedby="studio-delete-desc"
          >
            <span className="studio-modal-icon" aria-hidden="true">
              <Trash2 size={18} />
            </span>
            <h2 id="studio-delete-title">
              Delete {pendingDelete.type === "blogs" ? "article" : pendingDelete.type === "projects" ? "project" : "experience"}?
            </h2>
            <p id="studio-delete-desc">
              <strong>{pendingDelete.title}</strong>
              <span className="studio-modal-path">{pendingDelete.slug}.md</span>
              <span>
                This removes the file from <code>main</code> permanently. This
                action cannot be undone.
              </span>
            </p>
            <div className="studio-modal-actions">
              <button
                type="button"
                className="github-button"
                onClick={() => setPendingDelete(null)}
                disabled={busy}
                autoFocus
              >
                Cancel
              </button>
              <button
                type="button"
                className="github-btn-danger"
                onClick={() => {
                  void confirmDelete();
                }}
                disabled={busy}
              >
                <Trash2 size={14} aria-hidden="true" />
                {busy ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {unsavedOpen && (
        <div
          className="studio-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) cancelUnsaved();
          }}
        >
          <div
            className="studio-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="studio-unsaved-title"
            aria-describedby="studio-unsaved-desc"
          >
            <span
              className="studio-modal-icon studio-modal-icon-warn"
              aria-hidden="true"
            >
              <TriangleAlert size={18} />
            </span>
            <h2 id="studio-unsaved-title">Unsaved changes</h2>
            <p id="studio-unsaved-desc">
              <strong>
                {activeItem && "title" in activeItem
                  ? (activeItem.title ?? "").trim() || activeItem.slug || "Untitled"
                  : activeItem
                  ? `${activeItem.role || "Role"} at ${activeItem.company || "Company"}`
                  : "Untitled"}
              </strong>
              <span>
                Your draft {workspace === "blogs" ? "article" : workspace === "projects" ? "project" : "experience"} is
                not saved yet. Do you want to save it as a draft first?
                Discarding will lose all your temporary changes.
              </span>
            </p>
            <div className="studio-modal-actions">
              <button
                type="button"
                className="github-button"
                onClick={cancelUnsaved}
                disabled={busy}
                autoFocus
              >
                Keep editing
              </button>
              <button
                type="button"
                className="github-btn-danger-outline"
                onClick={discardUnsaved}
                disabled={busy}
              >
                Discard changes
              </button>
              <button
                type="button"
                className="github-btn-primary"
                onClick={() => {
                  void saveDraftAndContinue();
                }}
                disabled={busy}
              >
                <Save size={14} aria-hidden="true" />
                {busy ? "Saving…" : "Save as draft"}
              </button>
            </div>
          </div>
        </div>
      )}

      <StatusModal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        currentStatus={profileStatus}
        onSaved={(updated) => updateProfileStatus(updated)}
        onRefreshDeploy={() => {
          void refreshDeploy();
        }}
      />
    </main>
  );
}

/* ── Bits ─────────────────────────────────────────────────── */

function StatusModal({
  open,
  onClose,
  currentStatus,
  onSaved,
  onRefreshDeploy,
}: {
  open: boolean;
  onClose: () => void;
  currentStatus: ProfileStatus;
  onSaved: (next: ProfileStatus) => void;
  onRefreshDeploy?: () => void;
}) {
  const [emoji, setEmoji] = useState(currentStatus.emoji);
  const [message, setMessage] = useState(currentStatus.message);
  const [sha, setSha] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setEmoji(currentStatus.emoji);
      setMessage(currentStatus.message);
      setError("");
      setSuccess(false);

      void request("/api/studio/profile-status")
        .then((data) => {
          if (data) {
            if (typeof data.emoji === "string") setEmoji(data.emoji);
            if (typeof data.message === "string") setMessage(data.message);
            if (typeof data.sha === "string") setSha(data.sha);
          }
        })
        .catch(() => {
          // offline/local dev fallback
        });
    }
  }, [open, currentStatus]);

  if (!open) return null;

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const res = await request("/api/studio/profile-status", {
        method: "PUT",
        body: JSON.stringify({ emoji, message, sha }),
      });
      const updatedStatus: ProfileStatus = { emoji, message };
      if (res?.sha) setSha(res.sha);
      onSaved(updatedStatus);
      setSuccess(true);
      if (onRefreshDeploy) onRefreshDeploy();
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      setError(err?.message || "Could not save status.");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setEmoji("");
    setMessage("");
  };

  return (
    <div
      className="studio-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div
        className="studio-modal !max-w-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="studio-status-title"
      >
        <div className="flex items-center justify-between border-b border-[var(--gh-border)] pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--gh-subtle)] text-[var(--gh-text)]">
              <Smile size={18} />
            </span>
            <div>
              <h2 id="studio-status-title" className="text-base font-semibold leading-tight">
                Edit profile status
              </h2>
              <p className="text-xs text-[var(--gh-muted)]">
                Shows on desktop avatar & mobile header.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="github-icon-button"
            aria-label="Close"
            disabled={saving}
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 py-4">
          {error && (
            <div className="studio-alert" role="alert">
              <TriangleAlert size={14} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-md border border-[var(--gh-success)] bg-emerald-500/10 px-3 py-2 text-xs text-[var(--gh-success)]">
              <Check size={14} />
              <span>Status saved and committed to main!</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--gh-text)]">Status Icon & Message</label>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-12 items-center justify-center rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] text-[var(--gh-text)]">
                {renderStatusIcon(emoji, 16)}
              </div>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="coffee"
                className="w-24 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] px-2.5 py-1.5 text-xs outline-none focus:border-[var(--gh-link)] font-mono"
                title="Icon name or key (e.g. coffee, code, rocket)"
              />
              <div className="relative flex-1">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 80))}
                  placeholder="What's happening? (e.g. nabubuang)"
                  maxLength={80}
                  className="w-full rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] px-3 py-1.5 text-sm outline-none focus:border-[var(--gh-link)]"
                />
                <span className="absolute right-2 top-2 text-[10px] text-[var(--gh-muted)]">
                  {message.length}/80
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-[var(--gh-muted)]">Icon pack presets:</span>
            <div className="flex flex-wrap gap-1.5">
              {statusIconList.map((preset) => {
                const Icon = preset.icon;
                const isSelected = emoji.toLowerCase() === preset.key.toLowerCase();
                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => {
                      setEmoji(preset.key);
                      if (!message) setMessage(preset.label.toLowerCase());
                    }}
                    className={`flex items-center gap-1.5 rounded-md border border-[var(--gh-border)] px-2 py-1 text-xs transition-colors hover:bg-[var(--gh-subtle)] ${
                      isSelected
                        ? "border-[var(--gh-link)] bg-[var(--gh-subtle)] text-[var(--gh-link)] font-medium"
                        : "bg-[var(--gh-canvas)] text-[var(--gh-text)]"
                    }`}
                  >
                    <Icon size={13} />
                    <span className="text-[11px]">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-[var(--gh-border)] bg-[var(--gh-subtle)] p-3">
            <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-[var(--gh-muted)]">
              <span>Live preview</span>
              <span>Desktop & Mobile</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col items-center justify-center rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] p-3">
                <span className="mb-2 text-[10px] font-medium text-[var(--gh-muted)]">Desktop Side Panel</span>
                <div className="relative inline-block">
                  <div className="h-16 w-16 overflow-hidden rounded-full border border-[var(--gh-border)] bg-[var(--gh-subtle)]">
                    <img
                      src={profilePic}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <ProfileStatusBadge
                    variant="desktop-corner"
                    customStatus={{ emoji, message }}
                    expandAlways={true}
                    disableModal={true}
                    className="!max-w-[130px] !text-[10px]"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-center rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] p-3">
                <span className="mb-2 text-[10px] font-medium text-[var(--gh-muted)]">Mobile Banner</span>
                <ProfileStatusBadge
                  variant="mobile-banner"
                  customStatus={{ emoji, message }}
                  disableModal={true}
                  className="!text-[11px]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="studio-modal-actions flex items-center justify-between border-t border-[var(--gh-border)] pt-3">
          <button
            type="button"
            className="github-button text-xs text-[var(--gh-danger)] hover:bg-rose-500/10"
            onClick={handleClear}
            disabled={saving || (!emoji && !message)}
          >
            Clear status
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="github-button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="github-btn-primary"
              onClick={() => void handleSave()}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save size={13} />
                  Save status
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileMenu({
  login,
  status,
  onEditStatus,
  onSignOut,
}: {
  login: string;
  status: ProfileStatus;
  onEditStatus: () => void;
  onSignOut: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="studio-profile" ref={wrapRef}>
      <button
        type="button"
        className="studio-profile-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Profile menu for ${login}`}
        title={login}
      >
        <span className="studio-avatar" aria-hidden="true">
          {login.slice(0, 1).toUpperCase()}
        </span>
        <ChevronDown size={14} className={`studio-profile-caret ${open ? "studio-profile-caret-open" : ""}`} />
      </button>
      {open && (
        <div className="studio-menu" role="menu" aria-label="Profile">
          <div className="studio-menu-head">
            <span className="studio-avatar studio-avatar-sm" aria-hidden="true">
              <UserRound size={14} />
            </span>
            <span className="studio-menu-identity">
              <strong>{login}</strong>
              <span className="github-muted">Signed in</span>
            </span>
          </div>
          <button
            type="button"
            role="menuitem"
            className="studio-menu-row studio-menu-action"
            onClick={() => {
              setOpen(false);
              onEditStatus();
            }}
          >
            {renderStatusIcon(status.emoji, 14, "text-[var(--gh-muted)]")}
            <span className="flex-1 text-left truncate">
              {status.message || "Set status"}
            </span>
            <Pencil size={11} className="github-muted" />
          </button>
          <div className="studio-menu-row">
            <span className="studio-menu-label">Appearance</span>
            <ThemeToggle className="github-theme-toggle studio-menu-theme" />
          </div>
          <button
            type="button"
            role="menuitem"
            className="studio-menu-row studio-menu-action"
            onClick={() => {
              setOpen(false);
              void onSignOut();
            }}
          >
            <LogOut size={15} />
            <span>Log out</span>
          </button>
        </div>
      )}
    </div>
  );
}

function DeployStatus({
  deploy,
  state,
  onRefresh,
}: {
  deploy: DeployInfo;
  state: "idle" | "checking" | "error";
  onRefresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const vercelState = deploy?.vercel && "state" in deploy.vercel ? (deploy.vercel.state ?? null) : null;
  const isDeploying = vercelState === "QUEUED" || vercelState === "BUILDING";
  const isFailed = (vercelState === "ERROR" || vercelState === "CANCELED") && !deploy?.inSync;

  let tone: "live" | "deploying" | "behind" | "failed" | "unknown" = "unknown";
  let label = "Unknown";
  if (deploy?.inSync) {
    tone = "live";
    label = "Live";
  } else if (isDeploying) {
    tone = "deploying";
    label = "Deploying…";
  } else if (isFailed) {
    tone = "failed";
    label = "Failed";
  } else if (deploy && deploy.deployed) {
    tone = "behind";
    label = "Behind";
  } else if (state === "checking") {
    tone = "deploying";
    label = "Checking…";
  } else if (state === "error") {
    tone = "unknown";
    label = "Unknown";
  }

  const formatTime = (iso: string | null) => {
    if (!iso) return "—";
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
  };

  return (
    <div className="studio-deploy" ref={wrapRef}>
      <button
        type="button"
        className={`github-badge studio-deploy-pill studio-deploy-${tone}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Compare the deployed site against repo HEAD"
      >
        {state === "checking" ? (
          <Loader2 size={11} className="studio-spin" aria-hidden="true" />
        ) : (
          <span className={`studio-dot studio-deploy-dot studio-dot-${tone}`} aria-hidden="true" />
        )}
        {label}
      </button>
      {open && (
        <div className="studio-deploy-pop" role="dialog" aria-label="Deploy status">
          <p className="studio-deploy-head">Deploy status</p>
          <dl className="studio-deploy-rows">
            <div>
              <dt>Repo main</dt>
              <dd>{deploy?.head?.short ?? "—"}</dd>
            </div>
            <div>
              <dt>Latest content change</dt>
              <dd title={deploy?.contentCommit?.message ?? ""}>
                {deploy?.contentCommit
                  ? `${deploy.contentCommit.short} · ${deploy.contentCommit.message || "(no message)"}`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt>Deployed site</dt>
              <dd>{deploy?.deployed?.short ?? deploy?.manifestError ?? "No build yet"}</dd>
            </div>
            <div>
              <dt>Deployed at</dt>
              <dd>{formatTime(deploy?.deployed?.builtAt ?? null)}</dd>
            </div>
            <div>
              <dt>Vercel</dt>
              <dd>{vercelState ?? deploy?.vercel?.error ?? "Not connected"}</dd>
            </div>
          </dl>
          <div className="studio-deploy-foot">
            <span className="github-muted">Checked {formatTime(deploy?.checkedAt ?? null)}</span>
            <button type="button" className="github-button studio-mini-btn" onClick={onRefresh}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewBackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    const editor = document.querySelector(".studio-editor");
    if (editor) editor.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top of preview"
      className={`github-back-to-top studio-preview-top ${visible ? "studio-preview-top-visible" : ""}`}
    >
      <ArrowUp size={14} />
      <span className="studio-preview-top-label">Back to top</span>
    </button>
  );
}

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
  remove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="studio-doc">
      <div className="studio-doc-bar">
        <div className="studio-doc-file">
          <FileCode2 size={15} />
          <span className="studio-doc-path">
            {kind} <ChevronRight size={12} /> {fileName || "untitled"}.md
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
        <p className="github-muted studio-kicker">{isNew ? "New file · uncommitted" : "Editing file on main"}</p>
        <h2>{title || "(untitled)"}</h2>
      </div>

      {children}

      <div className="studio-doc-foot">
        <p className="github-muted">
          {isNew ? "Saving creates a new Markdown file on main." : "Saving commits an update to main."}
        </p>
        <button onClick={save} disabled={busy} className="github-btn-primary studio-save">
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

/* Chip input for comma-separated values. Typing never reformats the text,
   so commas and spaces behave normally; tokens commit on Enter, comma,
   or blur, and clicking Save blurs first so nothing is lost. */
function TokenInput({
  values,
  onChange,
  placeholder,
  ariaLabel,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  ariaLabel: string;
}) {
  const [text, setText] = useState("");

  const commit = (raw: string) => {
    const parts = csv(raw).filter((part) => !values.some((v) => v.toLowerCase() === part.toLowerCase()));
    if (parts.length) onChange([...values, ...parts]);
    setText("");
  };

  return (
    <div
      className="studio-tokens"
      onClick={(e) => {
        const input = e.currentTarget.querySelector("input");
        input?.focus();
      }}
    >
      {values.map((token) => (
        <span key={token} className="github-topic studio-token">
          {token}
          <button
            type="button"
            aria-label={`Remove ${token}`}
            onClick={(e) => {
              e.stopPropagation();
              onChange(values.filter((v) => v !== token));
            }}
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        value={text}
        aria-label={ariaLabel}
        placeholder={values.length ? "Add another…" : placeholder}
        onChange={(e) => {
          const next = e.target.value;
          if (next.includes(",")) commit(next);
          else setText(next);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit(text);
          } else if (e.key === "Backspace" && !text && values.length) {
            onChange(values.slice(0, -1));
          }
        }}
        onBlur={() => {
          if (text.trim()) commit(text);
        }}
      />
    </div>
  );
}

/* Prominent publish/draft selector. Draft is a real frontmatter value for
   both articles and projects — this surfaces it instead of burying it. */
function VisibilityControl({ draft, onChange }: { draft?: boolean; onChange: (draft: boolean) => void }) {
  const isDraft = draft === true;
  return (
    <div className="studio-section">
      <h3>
        <Eye size={14} /> Visibility
        <span className={isDraft ? "studio-visibility-draft" : "studio-visibility-live"}>
          {isDraft ? "Draft — hidden" : "Published — live after deploy"}
        </span>
      </h3>
      <div className="studio-visibility-grid" role="radiogroup" aria-label="Visibility">
        <button
          type="button"
          role="radio"
          aria-checked={!isDraft}
          onClick={() => onChange(false)}
          className={`studio-visibility-option ${!isDraft ? "studio-visibility-selected-live" : ""}`}
        >
          <Globe size={17} aria-hidden="true" />
          <span>
            <strong>Published</strong>
            <em>Visible on the portfolio after deploy.</em>
          </span>
          {!isDraft && <Check size={15} aria-hidden="true" />}
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={isDraft}
          onClick={() => onChange(true)}
          className={`studio-visibility-option ${isDraft ? "studio-visibility-selected-draft" : ""}`}
        >
          <EyeOff size={17} aria-hidden="true" />
          <span>
            <strong>Draft</strong>
            <em>Hidden from the portfolio, kept in Git.</em>
          </span>
          {isDraft && <Check size={15} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}

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
  remove: () => void;
}) {
  const update = <K extends keyof Post>(key: K, value: Post[K]) => {
    // Auto-derive the slug from the title for new files only. Existing
    // files keep a stable path so edits update in place instead of
    // creating a duplicate (deliberate renames go through originalSlug).
    if (
      key === "title" &&
      !post.sha &&
      (!post.slug || post.slug === slugify(post.title))
    ) {
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
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body || "_Nothing to preview yet._"}</ReactMarkdown>
          </div>
          <PreviewBackToTop />
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
              <Field label="Slug" hint={post.sha ? "renames the file on save" : "auto from title"}>
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
              <Field label="Tags" hint="type, then Enter" span>
                <TokenInput
                  values={post.tags}
                  onChange={(tags) => update("tags", tags)}
                  placeholder="systems, research, qa"
                  ariaLabel="Article tags"
                />
              </Field>
            </div>
          </div>

          <VisibilityControl draft={post.draft} onChange={(draft) => update("draft", draft)} />

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
  remove: () => void;
}) {
  const update = <K extends keyof Project>(key: K, value: Project[K]) => setProject({ ...project, [key]: value });

  const updateTitle = (value: string) => {
    if (!project.sha && (!project.slug || project.slug === slugify(project.title))) {
      setProject({ ...project, title: value, slug: slugify(value) });
      return;
    }
    setProject({ ...project, title: value });
  };

  const updateDetail = (index: number, key: "label" | "value", value: string) =>
    update(
      "details",
      project.details.map((detail, i) => (i === index ? { ...detail, [key]: value } : detail)),
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
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.body || "_Nothing to preview yet._"}</ReactMarkdown>
          </div>
          <PreviewBackToTop />
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
              <Field label="Slug" hint={project.sha ? "renames the file on save" : "auto from title"}>
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
                <select className={inputCls} value={project.status} onChange={(e) => update("status", e.target.value)}>
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
              <Field label="Tools" hint="type, then Enter">
                <TokenInput
                  values={project.tools}
                  onChange={(tools) => update("tools", tools)}
                  placeholder="Figma, SQL, Playwright"
                  ariaLabel="Project tools"
                />
              </Field>
              <Field label="Workflow" hint="type, then Enter">
                <TokenInput
                  values={project.workflow}
                  onChange={(workflow) => update("workflow", workflow)}
                  placeholder="Research, Mapping, Validation"
                  ariaLabel="Workflow highlights"
                />
              </Field>
            </div>
          </div>

          <VisibilityControl draft={project.draft} onChange={(draft) => update("draft", draft)} />

          <div className="studio-section">
            <h3>
              <BookMarked size={14} /> Details
              <button
                onClick={() => update("details", [...project.details, { label: "", value: "" }])}
                className="github-button studio-mini-btn"
                type="button"
              >
                <Plus size={13} /> Add
              </button>
            </h3>
            <div className="studio-details-edit">
              {project.details.map((detail, index) => (
                <div key={index} className="studio-detail-row">
                  <input
                    className={inputCls}
                    value={detail.label}
                    placeholder="Label"
                    onChange={(e) => updateDetail(index, "label", e.target.value)}
                  />
                  <input
                    className={inputCls}
                    value={detail.value}
                    placeholder="Value"
                    onChange={(e) => updateDetail(index, "value", e.target.value)}
                  />
                  <button
                    onClick={() =>
                      update(
                        "details",
                        project.details.filter((_, i) => i !== index),
                      )
                    }
                    disabled={project.details.length === 1}
                    className="github-icon-button"
                    aria-label="Remove detail"
                    type="button"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
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

/* ── Experience editor ────────────────────────────────────── */

function ExperienceEditor({
  experience,
  setExperience,
  save,
  busy,
  preview,
  setPreview,
  remove,
}: {
  experience: Experience;
  setExperience: (exp: Experience) => void;
  save: () => void;
  busy: boolean;
  preview: boolean;
  setPreview: (v: boolean) => void;
  remove: () => void;
}) {
  const update = <K extends keyof Experience>(key: K, value: Experience[K]) =>
    setExperience({ ...experience, [key]: value });

  const updateRoleOrCompany = (roleVal: string, companyVal: string) => {
    if (!experience.sha) {
      const derivedSlug = slugify(`${companyVal}-${roleVal}`);
      setExperience({ ...experience, role: roleVal, company: companyVal, slug: derivedSlug || experience.slug });
      return;
    }
    setExperience({ ...experience, role: roleVal, company: companyVal });
  };

  return (
    <EditorChrome
      kind={experience.draft ? "drafts" : "experiences"}
      fileName={experience.slug}
      title={experience.role ? `${experience.role} @ ${experience.company}` : "(untitled experience)"}
      isNew={!experience.sha}
      draft={experience.draft}
      busy={busy}
      preview={preview}
      setPreview={setPreview}
      save={save}
      remove={remove}
    >
      {preview ? (
        <div className="studio-preview">
          <p className="github-muted studio-kicker">Preview · career timeline entry</p>
          <div className="github-activity-timeline" style={{ padding: "16px 0" }}>
            <div className="github-activity-event-icon">
              <BriefcaseBusiness size={19} />
            </div>
            <div className="github-experience-list">
              <article className="github-experience-item">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                  <h3>{experience.role || "(untitled role)"}</h3>
                  <time className="text-xs text-[var(--gh-muted)] shrink-0">{experience.period}</time>
                </div>
                <p className="font-medium text-[var(--gh-text)] flex items-center gap-1.5 flex-wrap">
                  <span>{experience.company || "(company)"}</span>
                  {experience.location && (
                    <span className="text-xs text-[var(--gh-muted)] inline-flex items-center gap-1 font-normal">
                      · <MapPin size={11} /> {experience.location}
                    </span>
                  )}
                </p>
                <div className="mt-2 text-xs leading-relaxed text-[var(--gh-muted)] github-markdown">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {experience.body || "_No description provided._"}
                  </ReactMarkdown>
                </div>
                {experience.highlights && experience.highlights.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {experience.highlights.map((tag, i) => (
                      <span key={i} className="github-badge text-[11px] py-0.5 px-2">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            </div>
          </div>
          <PreviewBackToTop />
        </div>
      ) : (
        <>
          <div className="studio-section">
            <h3>
              <BriefcaseBusiness size={14} /> Frontmatter
            </h3>
            <div className="studio-form-grid">
              <Field label="Role / Title">
                <input
                  className={inputCls}
                  value={experience.role}
                  onChange={(e) => updateRoleOrCompany(e.target.value, experience.company)}
                  placeholder="e.g. Product Systems Analyst"
                />
              </Field>
              <Field label="Company / Organization">
                <input
                  className={inputCls}
                  value={experience.company}
                  onChange={(e) => updateRoleOrCompany(experience.role, e.target.value)}
                  placeholder="e.g. AdaptiveHub"
                />
              </Field>
              <Field label="Slug" hint={experience.sha ? "renames the file on save" : "auto from company & role"}>
                <input
                  className={`${inputCls} studio-mono-input`}
                  value={experience.slug}
                  onChange={(e) => update("slug", slugify(e.target.value))}
                  placeholder="company-role"
                  spellCheck={false}
                />
              </Field>
              <Field label="Display order" hint="lower numbers appear first">
                <input
                  className={inputCls}
                  type="number"
                  value={experience.order}
                  onChange={(e) => update("order", Number(e.target.value))}
                />
              </Field>
              <Field label="Period">
                <input
                  className={inputCls}
                  value={experience.period}
                  onChange={(e) => update("period", e.target.value)}
                  placeholder="e.g. Jan 2024 — Present"
                />
              </Field>
              <Field label="Location">
                <input
                  className={inputCls}
                  value={experience.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="e.g. Cagayan de Oro, PH"
                />
              </Field>
              <Field label="Highlights" hint="type, then Enter" span>
                <TokenInput
                  values={experience.highlights}
                  onChange={(highlights) => update("highlights", highlights)}
                  placeholder="React, Process Optimization, QA Automation"
                  ariaLabel="Experience highlights"
                />
              </Field>
            </div>
          </div>

          <VisibilityControl draft={experience.draft} onChange={(draft) => update("draft", draft)} />

          <div className="studio-section">
            <h3>
              <FileCode2 size={14} /> Role description
              <span className="github-muted">{experience.body.length} chars</span>
            </h3>
            <textarea
              className={monoCls}
              rows={12}
              value={experience.body}
              onChange={(e) => update("body", e.target.value)}
              placeholder={"Describe your core contributions, systems designed, and outcomes achieved…"}
              spellCheck={false}
            />
          </div>
        </>
      )}
    </EditorChrome>
  );
}
