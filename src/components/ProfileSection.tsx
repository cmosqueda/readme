import { Compass, Terminal, Presentation, Network } from "lucide-react";

export default function ProfileSection() {
  return (
    <section className="w-full flex justify-center py-12 px-4 mt-10">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        {/* ========================= */}
        {/* HERO BLOCK */}
        {/* ========================= */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            {/* <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.3em] text-center sm:text-left">
              Corporate_Assignment // Promoted
            </span> */}
            <h1 className="text-4xl text-center sm:text-left sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent font-mono leading-none">
              Product Systems <span className="text-emerald-500">Analyst</span>
            </h1>
          </div>

          <div className="border-l-2 border-emerald-500/30 pl-6 flex flex-col gap-4">
            <p className="text-base sm:text-lg text-white/80 max-w-2xl leading-relaxed">
              I architect product operations at the intersection of quality engineering, AI-driven automation, and
              system documentation. By balancing between heuristic and deterministic approaches, I ensure platforms are
              structurally resilient, scalable, and built on verifiable engineering blueprints.
            </p>

            <p className="text-sm text-white/50 max-w-xl font-mono">
              // Focus: AI Automation & Architecture, High-Integrity Testing, System Mapping, and Production-Ready
              Blueprints.
            </p>
          </div>
        </div>

        {/* ========================= */}
        {/* PHILOSOPHY CARD */}
        {/* ========================= */}
        <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <Compass className="text-emerald-500 w-6 h-6 shrink-0 mt-1" />
            <div>
              <h3 className="text-white font-medium mb-2">Systems Philosophy</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Reliability is an architectural constraint. I identify operational bottlenecks within complex systems,
                design human-in-the-loop AI automations to optimize them, and translate the entire lifecycle into
                technical documentation that engineering teams can seamlessly implement.
              </p>
            </div>
          </div>
        </div>

        {/* ========================= */}
        {/* TECHNICAL SPEC GRID */}
        {/* ========================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SpecCard
            icon={<Terminal size={18} />}
            label="Product Strategy"
            value="System Mapping • API Integrations • SDLC Architecture"
          />
          <SpecCard
            icon={<Presentation size={18} />}
            label="AI Automation"
            value="Human-in-the-Loop AI • Workflow Engineering • LLM Benchmarking"
          />
          <SpecCard
            icon={<Network size={18} />}
            label="Quality Lens"
            value="Regression Pipelines • System Blueprints • E2E Validation Logs"
          />
        </div>
      </div>
    </section>
  );
}

function SpecCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="group hover:bg-white/5 transition-colors border border-white/5 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-emerald-500">
        {icon}
        <span className="text-[10px] uppercase tracking-tighter font-mono text-white/40">{label}</span>
      </div>
      <p className="text-xs sm:text-sm font-medium text-white/90 leading-tight">{value}</p>
    </div>
  );
}
