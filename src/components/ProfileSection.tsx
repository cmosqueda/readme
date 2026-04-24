import { ShieldCheck, Terminal, Microscope, CheckCircle2 } from "lucide-react";

export default function ProfileSection() {
  return (
    <section className="w-full flex justify-center py-12 px-4">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        {/* ========================= */}
        {/* STATUS HEADER (The "Live" Feel) */}
        {/* ========================= */}
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-400">
            Open for Opportunities
          </span>
        </div>

        {/* ========================= */}
        {/* HERO BLOCK */}
        {/* ========================= */}
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent font-mono">
            QA Practitioner <span className="text-emerald-500">&</span> Quality Engineer
          </h1>

          <div className="border-l-2 border-emerald-500/30 pl-6 flex flex-col gap-4">
            <p className="text-base sm:text-lg text-white/80 max-w-2xl leading-relaxed">
              Specializing in the <span className="text-white font-semibold">systematic deconstruction</span> of
              applications to ensure reliability. I bridge the gap between complex requirements and high-integrity
              software.
            </p>

            <p className="text-sm text-white/50 max-w-xl font-mono">
              // Focus: API Validation, Regression Testing, & User-Centric Quality Metrics.
            </p>
          </div>
        </div>

        {/* ========================= */}
        {/* PHILOSOPHY CARD */}
        {/* ========================= */}
        <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <ShieldCheck className="text-emerald-500 w-6 h-6 shrink-0 mt-1" />
            <div>
              <h3 className="text-white font-medium mb-2">Philosophy</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                I view QA as a strategic asset. My approach prioritizes early defect detection and detailed edge-case
                analysis, maintaining a "test-to-break" mindset to ensure software remains resilient under real-world
                conditions.
              </p>
            </div>
          </div>
        </div>

        {/* ========================= */}
        {/* TECHNICAL SPEC GRID */}
        {/* ========================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SpecCard icon={<Terminal size={18} />} label="Environment" value="Manual & Automated Testing" />
          <SpecCard icon={<Microscope size={18} />} label="Methodology" value="Black-Box • Regression • Exploratory" />
          <SpecCard icon={<CheckCircle2 size={18} />} label="Tooling" value="Postman • Jest • Notion" />
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
      <p className="text-sm font-medium text-white/90 leading-tight">{value}</p>
    </div>
  );
}
