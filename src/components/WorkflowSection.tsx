import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowRight, CircleDotDashed, Sparkles, Terminal } from "lucide-react";
import { Icon } from "../lib/icons";
import { fadeInUp, staggerContainer } from "../lib/motion";
import { workflowPrinciples } from "../data/workflowApproach";

export default function WorkflowSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePrinciple = workflowPrinciples[activeIndex];

  return (
    <section className="w-full flex justify-center py-10 px-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="text-emerald-500" size={20} />
            <div>
              <h2 className="text-2xl font-bold tracking-tight uppercase font-mono text-white/90">How_I_Work</h2>
              <p className="mt-1 text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">Signal → System → Validated Delivery</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-white/45 sm:max-w-xs sm:text-right">
            Explore each phase to see how a real workflow becomes a buildable product decision.
          </p>
        </div>

        <motion.div
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-4 shadow-[0_0_40px_rgba(16,185,129,0.06)] sm:p-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:28px_28px]" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <motion.div variants={fadeInUp} className="relative">
            <div className="mb-6 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-400/70">
              <CircleDotDashed size={13} />
              Product Systems Loop
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-stretch md:gap-0">
              {workflowPrinciples.map((principle, index) => {
                const isActive = index === activeIndex;

                return (
                  <div key={principle.id} className="flex min-w-0 flex-1 flex-col md:flex-row md:items-center">
                    <button
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      onMouseEnter={() => setActiveIndex(index)}
                      aria-pressed={isActive}
                      className={`group relative min-h-28 flex-1 rounded-xl border p-4 text-left transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 md:min-h-36 ${
                        isActive
                          ? "border-emerald-500/50 bg-emerald-500/[0.12] shadow-[0_0_24px_rgba(16,185,129,0.12)]"
                          : "border-white/10 bg-gray-950/40 hover:border-emerald-500/30 hover:bg-emerald-500/[0.05]"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="workflow-active-stage"
                          className="absolute inset-x-4 top-0 h-px bg-emerald-300"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <div className="mb-5 flex items-center justify-between">
                        <span className={`text-[10px] font-mono ${isActive ? "text-emerald-300" : "text-white/30"}`}>0{index + 1}</span>
                        <span className={`rounded-md border p-1.5 ${isActive ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-300" : "border-white/10 text-white/35"}`}>
                          <Icon name={principle.iconKey} size={15} />
                        </span>
                      </div>
                      <p className={`text-sm font-bold ${isActive ? "text-white" : "text-white/70"}`}>{principle.meta}</p>
                      <p className="mt-1 text-[10px] font-mono uppercase tracking-wider text-white/35">{principle.subtitle}</p>
                    </button>

                    {index < workflowPrinciples.length - 1 && (
                      <div className="flex h-6 items-center justify-center text-emerald-500/50 md:h-auto md:w-8 md:shrink-0">
                        <ArrowDown className="md:hidden" size={16} />
                        <ArrowRight className="hidden md:block" size={16} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activePrinciple.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="relative mt-6 grid gap-4 rounded-xl border border-white/10 bg-gray-950/65 p-5 md:grid-cols-[1.05fr_0.95fr]"
            >
              <div>
                <div className="mb-3 flex items-center gap-2 text-emerald-400">
                  <Icon name={activePrinciple.iconKey} size={17} />
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em]">Phase 0{activeIndex + 1}</p>
                </div>
                <h3 className="text-xl font-bold text-white">{activePrinciple.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{activePrinciple.description}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                <div className="rounded-lg border border-white/10 bg-white/[0.025] p-3">
                  <p className="mb-2 text-[9px] font-mono uppercase tracking-[0.2em] text-white/30">Input Signal</p>
                  <p className="text-xs leading-relaxed text-white/65">{activePrinciple.signal}</p>
                </div>
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] p-3">
                  <p className="mb-2 flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-[0.2em] text-emerald-400/70">
                    <Sparkles size={11} /> Output Artifacts
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {activePrinciple.deliverables.map((deliverable) => (
                      <span key={deliverable} className="rounded border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[9px] font-mono text-emerald-200">
                        {deliverable}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
