import { motion } from "framer-motion";
import { Terminal } from "lucide-react";
import { Icon } from "../lib/icons";
import { fadeInUp, staggerContainer } from "../lib/motion";
import { workflowPrinciples } from "../data/workflowApproach";

export default function WorkflowSection() {
  return (
    <section className="w-full flex justify-center py-10 px-4">
      <div className="w-full max-w-4xl">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Terminal className="text-emerald-500" size={20} />
            <h2 className="text-2xl font-bold tracking-tight uppercase font-mono text-white/90">Solution_Approach</h2>
          </div>
        </div>

        {/* PRINCIPLES GRID */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {workflowPrinciples.map((principle) => (
            <motion.div
              key={principle.id}
              variants={fadeInUp}
              className="relative group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-emerald-500/0 group-hover:border-emerald-500/40 rounded-tr-2xl transition-all duration-500" />

              <div className="mb-6 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/5 text-emerald-500 border border-emerald-500/10">
                <Icon name={principle.iconKey} size={20} />
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-mono text-emerald-500/60 uppercase tracking-widest">
                  {principle.subtitle}
                </p>
                <h3 className="text-lg font-bold text-white/90">{principle.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">
                  {principle.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[9px] font-mono text-white/20 uppercase tracking-tighter">Status: Field-Ready</span>
                <span className="text-[9px] font-mono text-emerald-500/40 uppercase">{principle.meta}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
