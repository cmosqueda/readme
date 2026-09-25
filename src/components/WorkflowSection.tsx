import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, CircleDotDashed, Network, Route, Search, SlidersHorizontal } from "lucide-react";
import { fadeInUp, staggerContainer } from "../lib/motion";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 448;
const NODE_WIDTH = 208;
const NODE_HEIGHT = 124;

const nodes = [
  { id: "discover", label: "Discover", type: "Research input", icon: Search, input: "People + process signals", action: "Observe the real workflow", output: "Validated problem", tags: ["Users", "Friction"], start: { x: 56, y: 202 } },
  { id: "define", label: "Define", type: "System model", icon: Network, input: "Validated evidence", action: "Shape the buildable system", output: "Requirements + flows", tags: ["Rules", "Flows"], start: { x: 298, y: 52 } },
  { id: "validate", label: "Validate", type: "Delivery check", icon: CheckCircle2, input: "Working product", action: "Test the experience", output: "Release confidence", tags: ["QA", "Feedback"], start: { x: 536, y: 212 } },
] as const;

type NodeId = (typeof nodes)[number]["id"];
type Position = { x: number; y: number };
type DragState = { id: NodeId; offsetX: number; offsetY: number };
type PendingPosition = { id: NodeId; position: Position };

export default function WorkflowSection() {
  const [activeId, setActiveId] = useState<NodeId>("discover");
  const [positions, setPositions] = useState<Record<NodeId, Position>>(() => Object.fromEntries(nodes.map((node) => [node.id, node.start])) as Record<NodeId, Position>);
  const dragRef = useRef<DragState | null>(null);
  const moveFrameRef = useRef<number | null>(null);
  const pendingPositionRef = useRef<PendingPosition | null>(null);
  const active = nodes.find((node) => node.id === activeId) ?? nodes[0];

  useEffect(() => () => {
    if (moveFrameRef.current !== null) window.cancelAnimationFrame(moveFrameRef.current);
  }, []);

  const beginDrag = (event: React.PointerEvent<HTMLButtonElement>, id: NodeId) => {
    const position = positions[id];
    const canvas = event.currentTarget.parentElement;
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    dragRef.current = { id, offsetX: event.clientX - bounds.left - position.x, offsetY: event.clientY - bounds.top - position.y };
    event.currentTarget.setPointerCapture(event.pointerId);
    setActiveId(id);
  };

  const moveNode = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / bounds.width;
    const scaleY = CANVAS_HEIGHT / bounds.height;
    const x = ((event.clientX - bounds.left) * scaleX) - drag.offsetX;
    const y = ((event.clientY - bounds.top) * scaleY) - drag.offsetY;
    pendingPositionRef.current = {
      id: drag.id,
      position: {
        x: Math.max(10, Math.min(CANVAS_WIDTH - NODE_WIDTH - 10, x)),
        y: Math.max(10, Math.min(CANVAS_HEIGHT - NODE_HEIGHT - 10, y)),
      },
    };

    if (moveFrameRef.current !== null) return;

    moveFrameRef.current = window.requestAnimationFrame(() => {
      const pending = pendingPositionRef.current;
      moveFrameRef.current = null;
      if (!pending) return;

      setPositions((current) => {
        const previous = current[pending.id];
        if (previous.x === pending.position.x && previous.y === pending.position.y) return current;
        return { ...current, [pending.id]: pending.position };
      });
    });
  };

  const endDrag = () => { dragRef.current = null; };

  return (
    <section className="flex w-full justify-center px-4 py-10">
      <div className="w-full max-w-4xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div className="flex items-center gap-3"><span className="neo-icon h-10 w-10"><Route size={19} /></span><div><h2 className="section-title">How I work</h2><p className="section-kicker mt-1">Product systems simulation</p></div></div>
          <p className="hidden text-xs text-[color:var(--md-on-surface-variant)] sm:block">Drag nodes to model the workflow.</p>
        </div>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="workflow-sandbox overflow-hidden rounded-3xl border border-[color:var(--md-outline-variant)]">
          <motion.div variants={fadeInUp} className="sandbox-toolbar flex h-12 items-center justify-between border-b px-4"><div className="flex items-center gap-2 text-[color:var(--md-primary)]"><CircleDotDashed size={15} /><span className="text-[10px] font-bold uppercase tracking-[0.14em]">Workflow sandbox</span></div><div className="flex items-center gap-2 text-[10px] font-semibold text-[color:var(--md-on-surface-variant)]"><SlidersHorizontal size={13} /> Drag to arrange</div></motion.div>

          <div className="overflow-x-auto p-3 sm:p-5">
            <div
              className="sandbox-grid relative h-[28rem] w-[50rem]"
              onPointerMove={moveNode}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              aria-label="Draggable product systems workflow graph"
            >
              <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} aria-hidden="true">
                <defs><marker id="sandbox-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="var(--md-secondary)" /></marker></defs>
                <Connection from={rightPort(positions.discover)} to={leftPort(positions.define)} />
                <Connection from={rightPort(positions.define)} to={leftPort(positions.validate)} />
                <Connection from={bottomPort(positions.validate)} to={bottomPort(positions.discover)} feedback />
              </svg>
              {nodes.map((node) => <SandboxNode key={node.id} node={node} position={positions[node.id]} active={activeId === node.id} onSelect={setActiveId} onPointerDown={beginDrag} />)}
            </div>
          </div>

          <motion.div key={active.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.16 }} className="sandbox-console mx-3 mb-3 rounded-xl border p-3 sm:mx-5 sm:mb-5">
            <div className="mb-3 flex items-center justify-between"><span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[color:var(--md-primary)]">Active simulation</span><span className="rounded bg-[color:var(--md-primary-container)] px-2 py-1 text-[9px] font-bold text-[color:var(--md-on-primary-container)]">{active.label}</span></div>
            <div className="grid grid-cols-3 gap-2 text-center"><SimulationToken label="Input" value={active.input} /><SimulationToken label="Process" value={active.action} active /><SimulationToken label="Output" value={active.output} /></div>
          </motion.div>
        </motion.div>
        <p className="mt-3 text-center text-[10px] text-[color:var(--md-on-surface-variant)] md:hidden">Swipe the canvas, then drag a node to rearrange it.</p>
      </div>
    </section>
  );
}

function rightPort(position: Position) { return { x: position.x + NODE_WIDTH, y: position.y + NODE_HEIGHT / 2 }; }
function leftPort(position: Position) { return { x: position.x, y: position.y + NODE_HEIGHT / 2 }; }
function bottomPort(position: Position) { return { x: position.x + NODE_WIDTH / 2, y: position.y + NODE_HEIGHT }; }

function Connection({ from, to, feedback = false }: { from: Position; to: Position; feedback?: boolean }) {
  const spread = feedback ? 120 : Math.max(70, Math.abs(to.x - from.x) * 0.45);
  const controlY = feedback ? Math.max(from.y, to.y) + 90 : undefined;
  const path = feedback
    ? `M ${from.x} ${from.y} C ${from.x - spread} ${controlY}, ${to.x + spread} ${controlY}, ${to.x} ${to.y}`
    : `M ${from.x} ${from.y} C ${from.x + spread} ${from.y}, ${to.x - spread} ${to.y}, ${to.x} ${to.y}`;
  return <path d={path} fill="none" stroke={feedback ? "var(--md-on-surface-variant)" : "var(--md-secondary)"} strokeWidth={feedback ? 2 : 3} strokeDasharray={feedback ? "7 8" : undefined} strokeLinecap="round" markerEnd="url(#sandbox-arrow)" opacity=".78" />;
}

type Node = (typeof nodes)[number];

function SandboxNode({ node, position, active, onSelect, onPointerDown }: { node: Node; position: Position; active: boolean; onSelect: (id: NodeId) => void; onPointerDown: (event: React.PointerEvent<HTMLButtonElement>, id: NodeId) => void }) {
  const Icon = node.icon;
  return (
    <button type="button" onClick={() => onSelect(node.id)} onFocus={() => onSelect(node.id)} onPointerDown={(event) => onPointerDown(event, node.id)} aria-pressed={active} style={{ left: position.x, top: position.y, width: NODE_WIDTH }} className={`sandbox-node group absolute cursor-grab touch-none rounded-2xl border text-left outline-none transition-shadow active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-[color:var(--md-primary)] ${active ? "sandbox-node-active" : ""}`}>
      <span className={`sandbox-port absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-[3px] ${active ? "sandbox-port-active" : ""}`} />
      <span className={`sandbox-port absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-[3px] ${active ? "sandbox-port-active" : ""}`} />
      <span className="flex items-center gap-2 border-b border-white/10 px-4 py-3"><span className={`sandbox-node-icon flex h-7 w-7 items-center justify-center rounded-md ${active ? "sandbox-node-icon-active" : ""}`}><Icon size={15} /></span><span><span className="sandbox-node-title block text-sm font-bold">{node.label}</span><span className="sandbox-node-type block text-[9px] font-semibold uppercase tracking-wide">{node.type}</span></span></span>
      <span className="block px-4 py-3"><span className="flex gap-1.5">{node.tags.map((tag) => <span key={tag} className="sandbox-node-tag rounded px-2 py-1 text-[9px] font-bold">{tag}</span>)}</span><span className="sandbox-node-meta mt-3 block text-[10px] font-medium">Drag or click this stage</span></span>
    </button>
  );
}

function SimulationToken({ label, value, active = false }: { label: string; value: string; active?: boolean }) {
  return <div className={`sandbox-token rounded-lg border px-2 py-2 ${active ? "sandbox-token-active" : ""}`}><p className="sandbox-token-label text-[8px] font-bold uppercase tracking-[0.12em]">{label}</p><p className={`sandbox-token-value mt-1 text-[10px] font-bold leading-tight ${active ? "sandbox-token-value-active" : ""}`}>{value}</p></div>;
}
