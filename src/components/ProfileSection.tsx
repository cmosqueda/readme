import { Compass, Terminal, Presentation, Network } from "lucide-react";

export default function ProfileSection() {
  return (
    <section className="w-full flex justify-center py-12 px-4 mt-10">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        {/* ========================= */}
        {/* HERO BLOCK */}
        {/* ========================= */}
        <div className="flex flex-col gap-6">
          <h1 className="text-5xl text-center sm:text-left sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent font-mono">
            Solutions <span className="text-emerald-500">Engineer</span>
          </h1>

          <div className="border-l-2 border-emerald-500/30 pl-6 flex flex-col gap-4">
            <p className="text-base sm:text-lg text-white/80 max-w-2xl leading-relaxed">
              I translate customer workflows, product requirements, and technical constraints into clear solution
              designs, demos, and implementation-ready documentation.
            </p>

            <p className="text-sm text-white/50 max-w-xl font-mono">
              // Focus: Technical Discovery, Product Demos, API Workflows, Proof-of-Concept Support, and Customer-Ready
              Documentation.
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
              <h3 className="text-white font-medium mb-2">Solutions Philosophy</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                A strong solution starts with discovery. I focus on understanding the user’s current process,
                identifying operational pain points, mapping them to product capabilities, and communicating the value
                in a way both technical and non-technical stakeholders can trust.
              </p>
            </div>
          </div>
        </div>

        {/* ========================= */}
        {/* TECHNICAL SPEC GRID */}
        {/* ========================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SpecCard icon={<Terminal size={18} />} label="Technical Base" value="QA • APIs • Product Workflows" />
          <SpecCard
            icon={<Presentation size={18} />}
            label="Customer Motion"
            value="Discovery • Demos • Proof of Value"
          />
          <SpecCard
            icon={<Network size={18} />}
            label="Delivery Lens"
            value="Implementation Docs • Support • Feedback Loops"
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
      <p className="text-sm font-medium text-white/90 leading-tight">{value}</p>
    </div>
  );
}
