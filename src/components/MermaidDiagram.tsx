import { isValidElement, useEffect, useId, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  Copy,
  Maximize2,
  Pencil,
  Sparkles,
  Workflow,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

type DiagramLook = "neo" | "handDrawn";

let renderChain: Promise<unknown> = Promise.resolve();

function detectDiagramKind(chart: string): string {
  const lines = chart.split(/\r?\n/);
  let inFrontmatter = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]?.trim() ?? "";
    if (!line) continue;
    if (i === 0 && line === "---") {
      inFrontmatter = true;
      continue;
    }
    if (inFrontmatter) {
      if (line === "---") inFrontmatter = false;
      continue;
    }
    if (line.startsWith("%%")) continue;

    const head = line.toLowerCase();
    if (head.startsWith("flowchart") || head.startsWith("graph")) return "FLOWCHART";
    if (head.startsWith("sequencediagram")) return "SEQUENCE";
    if (head.startsWith("erdiagram")) return "ER DIAGRAM";
    if (head.startsWith("statediagram")) return "STATE";
    if (head.startsWith("classdiagram")) return "CLASS";
    if (head.startsWith("gantt")) return "GANTT";
    if (head.startsWith("pie")) return "PIE CHART";
    if (head.startsWith("mindmap")) return "MINDMAP";
    if (head.startsWith("gitgraph")) return "GIT GRAPH";
    break;
  }

  return "DIAGRAM";
}

export function MarkdownPre({ children }: { children?: ReactNode }) {
  if (isValidElement<{ className?: string; children?: ReactNode }>(children)) {
    const language = children.props.className?.match(/language-(\w+)/)?.[1];
    if (language === "mermaid") {
      return <MermaidDiagram chart={String(children.props.children).replace(/\n$/, "")} />;
    }
  }

  return <pre>{children}</pre>;
}

export default function MermaidDiagram({ chart }: { chart: string }) {
  const diagramId = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [look, setLook] = useState<DiagramLook>("neo");
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );

  const kind = detectDiagramKind(chart);

  useEffect(() => {
    const observer = new MutationObserver(() =>
      setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light"),
    );
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  useEffect(() => {
    let cancelled = false;
    setError(false);

    const runRender = async () => {
      const { default: mermaid } = await import("mermaid");
      const dark = theme === "dark";

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        look,
        theme: "base",
        fontFamily: '"Space Grotesk", system-ui, -apple-system, sans-serif',
        flowchart: {
          curve: "rounded",
          padding: 18,
          nodeSpacing: 46,
          rankSpacing: 52,
          htmlLabels: true,
          subGraphTitleMargin: { top: 10, bottom: 10 },
        },
        themeVariables: {
          fontFamily: '"Space Grotesk", system-ui, -apple-system, sans-serif',
          fontSize: "13.5px",
          darkMode: dark,
          background: "transparent",
          primaryColor: dark ? "#0b1629" : "#ffffff",
          primaryBorderColor: dark ? "#3b82f6" : "#2563eb",
          primaryTextColor: dark ? "#eef4fc" : "#0f172a",
          secondaryColor: dark ? "#07101f" : "#f1f5f9",
          secondaryBorderColor: dark ? "#38bdf8" : "#0284c7",
          secondaryTextColor: dark ? "#cbd5e1" : "#334155",
          tertiaryColor: dark ? "#040811" : "#e6edf6",
          tertiaryBorderColor: dark ? "rgba(96, 165, 250, 0.35)" : "rgba(37, 99, 235, 0.3)",
          tertiaryTextColor: dark ? "#9fb0c7" : "#475569",
          lineColor: dark ? "#60a5fa" : "#2563eb",
          textColor: dark ? "#eef4fc" : "#0f172a",
          mainBkg: dark ? "#0b1629" : "#ffffff",
          nodeBorder: dark ? "#3b82f6" : "#2563eb",
          clusterBkg: dark ? "rgba(11, 20, 36, 0.58)" : "rgba(241, 245, 249, 0.72)",
          clusterBorder: dark ? "rgba(96, 165, 250, 0.34)" : "rgba(37, 99, 235, 0.28)",
          edgeLabelBackground: dark ? "#070d18" : "#f8fafd",
          titleColor: dark ? "#60a5fa" : "#1d4ed8",
          actorBkg: dark ? "#0b1629" : "#ffffff",
          actorBorder: dark ? "#3b82f6" : "#2563eb",
          actorTextColor: dark ? "#eef4fc" : "#0f172a",
          signalColor: dark ? "#60a5fa" : "#2563eb",
          signalTextColor: dark ? "#eef4fc" : "#0f172a",
        },
      });

      const renderId = `mermaid-${diagramId}-${theme}-${look}`;
      const { svg: renderedSvg } = await mermaid.render(renderId, chart);
      if (!cancelled) {
        setSvg(renderedSvg);
      }
    };

    renderChain = renderChain
      .then(runRender, runRender)
      .catch((renderError) => {
        console.error("Unable to render Mermaid diagram:", renderError);
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [chart, diagramId, look, theme]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(chart);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failures in restricted contexts.
    }
  };

  const adjustZoom = (delta: number) => {
    setZoom((prev) => Math.min(1.8, Math.max(0.6, Math.round((prev + delta) * 10) / 10)));
  };

  if (error) {
    return (
      <div className="orbital-mermaid-card my-8">
        <div className="orbital-mermaid-bar">
          <div className="orbital-mermaid-title">
            <Workflow size={14} />
            <span>SYSTEM DIAGRAM</span>
            <span className="github-badge">{kind}</span>
          </div>
          <span className="font-mono text-[11px] text-[color:var(--gh-danger)]">Syntax fallback</span>
        </div>
        <pre className="!m-0 !rounded-none !border-0 bg-[color:var(--orb-recessed)] p-4 text-sm github-muted">
          <code>{chart}</code>
        </pre>
      </div>
    );
  }

  const controls = (inModal: boolean) => (
    <div className="orbital-mermaid-actions">
      <button
        type="button"
        onClick={() => setLook((prev) => (prev === "neo" ? "handDrawn" : "neo"))}
        className={`orbital-mermaid-btn ${look === "neo" ? "orbital-mermaid-btn--active" : ""}`}
        title={look === "neo" ? "Switch to hand-drawn sketch look" : "Switch to sleek Neo look"}
        aria-label="Toggle diagram look"
      >
        {look === "neo" ? <Sparkles size={12} /> : <Pencil size={12} />}
        <span>{look === "neo" ? "Neo" : "Sketch"}</span>
      </button>

      <div className="orbital-mermaid-zoom">
        <button
          type="button"
          onClick={() => adjustZoom(-0.2)}
          disabled={zoom <= 0.6}
          className="orbital-mermaid-btn"
          title="Zoom out"
          aria-label="Zoom out diagram"
        >
          <ZoomOut size={12} />
        </button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          className="orbital-mermaid-btn min-w-[3.1rem] justify-center"
          title="Reset zoom"
          aria-label="Reset diagram zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          onClick={() => adjustZoom(0.2)}
          disabled={zoom >= 1.8}
          className="orbital-mermaid-btn"
          title="Zoom in"
          aria-label="Zoom in diagram"
        >
          <ZoomIn size={12} />
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          void handleCopy();
        }}
        className="orbital-mermaid-btn"
        title="Copy Mermaid source"
        aria-label="Copy Mermaid source"
      >
        {copied ? <Check size={12} className="text-[color:var(--orb-live)]" /> : <Copy size={12} />}
        <span className="hidden sm:inline">{copied ? "Copied" : "Source"}</span>
      </button>

      {inModal ? (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="orbital-mermaid-btn"
          title="Close fullscreen"
          aria-label="Close fullscreen diagram"
        >
          <X size={13} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="orbital-mermaid-btn"
          title="Expand diagram"
          aria-label="Expand diagram fullscreen"
        >
          <Maximize2 size={12} />
        </button>
      )}
    </div>
  );

  const stage = (inModal: boolean) => (
    <div
      className={`orbital-mermaid-stage ${inModal ? "orbital-mermaid-stage--modal" : ""}`}
      aria-label="Mermaid diagram"
    >
      <span className="tank-corner tank-corner--tl" aria-hidden="true" />
      <span className="tank-corner tank-corner--tr" aria-hidden="true" />
      <span className="tank-corner tank-corner--bl" aria-hidden="true" />
      <span className="tank-corner tank-corner--br" aria-hidden="true" />

      {svg ? (
        <div
          className="orbital-mermaid-canvas-wrap"
          style={
            zoom === 1
              ? undefined
              : {
                  transform: `scale(${zoom})`,
                  transformOrigin: "top center",
                }
          }
        >
          <div
            className="mermaid-diagram orbital-mermaid-svg min-w-max"
            role="img"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
      ) : (
        <div className="flex min-h-[12rem] items-center justify-center font-mono text-xs github-muted">
          Rendering telemetry diagram…
        </div>
      )}
    </div>
  );

  return (
    <>
      <figure className="orbital-mermaid-card my-8">
        <div className="orbital-mermaid-bar">
          <div className="orbital-mermaid-title">
            <Workflow size={14} className="text-[color:var(--orb-ice)]" />
            <span>SYSTEM DIAGRAM</span>
            <span className="github-badge">{kind}</span>
          </div>
          {controls(false)}
        </div>
        {stage(false)}
      </figure>

      {expanded &&
        createPortal(
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-[#02060e]/80 p-4 backdrop-blur-md sm:p-6"
            onClick={() => setExpanded(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Expanded system diagram"
          >
            <div
              className="orbital-mermaid-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="orbital-mermaid-bar">
                <div className="orbital-mermaid-title">
                  <Workflow size={14} className="text-[color:var(--orb-ice)]" />
                  <span>SYSTEM DIAGRAM</span>
                  <span className="github-badge">{kind}</span>
                </div>
                {controls(true)}
              </div>
              {stage(true)}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
