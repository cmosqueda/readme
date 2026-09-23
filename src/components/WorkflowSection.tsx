import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowRight, CircleDotDashed, Sparkles, Route } from "lucide-react";
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
            <span className="neo-icon h-10 w-10"><Route size={19} /></span>
            <div>
              <h2 className="section-title">How I work</h2>
              <p className="section-kicker mt-1">Discovery to validated delivery</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-[#617388] sm:max-w-xs sm:text-right">
            Explore each phase to see how a real workflow becomes a buildable product decision.
          </p>
        </div>

        <motion.div
          className="neo-card relative overflow-hidden rounded-3xl p-4 sm:p-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div variants={fadeInUp} className="relative">
            <div className="section-kicker mb-6 flex items-center gap-2">
              <CircleDotDashed size={13} className="text-[#496b86]" />
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
                      className={`group relative min-h-28 flex-1 rounded-2xl p-4 text-left transition-all duration-300 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#496b86] md:min-h-36 ${
                        isActive
                          ? "neo-pressed text-[#2d3b4c]"
                          : "neo-card-interactive text-[#52657a]"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="workflow-active-stage"
                          className="absolute inset-x-5 top-0 h-1 rounded-b-full bg-[#7492aa]"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <div className="mb-5 flex items-center justify-between">
                        <span className={`text-[10px] font-bold ${isActive ? "text-[#496b86]" : "text-[#8090a0]"}`}>0{index + 1}</span>
                        <span className={`rounded-lg p-1.5 ${isActive ? "neo-card text-[#496b86]" : "neo-pressed text-[#718194]"}`}>
                          <Icon name={principle.iconKey} size={15} />
                        </span>
                      </div>
                      <p className={`text-sm font-bold ${isActive ? "text-[#2d3b4c]" : "text-[#52657a]"}`}>{principle.meta}</p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#8090a0]">{principle.subtitle}</p>
                    </button>

                    {index < workflowPrinciples.length - 1 && (
                      <div className="flex h-6 items-center justify-center text-[#91a6b8] md:h-auto md:w-8 md:shrink-0">
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
              className="neo-pressed relative mt-6 grid gap-4 rounded-2xl p-5 md:grid-cols-[1.05fr_0.95fr]"
            >
              <div>
                <div className="mb-3 flex items-center gap-2 text-[#496b86]">
                  <Icon name={activePrinciple.iconKey} size={17} />
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em]">Phase {activeIndex + 1}</p>
                </div>
                <h3 className="font-[Manrope] text-xl font-bold text-[#2d3b4c]">{activePrinciple.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#52657a]">{activePrinciple.description}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                <div className="neo-card rounded-xl p-3">
                  <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#8090a0]">Starting point</p>
                  <p className="text-xs leading-relaxed text-[#52657a]">{activePrinciple.signal}</p>
                </div>
                <div className="neo-card rounded-xl p-3">
                  <p className="mb-2 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#496b86]">
                    <Sparkles size={11} /> Deliverables
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {activePrinciple.deliverables.map((deliverable) => (
                      <span key={deliverable} className="neo-pressed rounded-md px-2 py-1 text-[9px] font-medium text-[#52657a]">
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
