import { motion } from "framer-motion";
import { Icon, type IconKey } from "../lib/icons";
import { fadeInUp, staggerContainer } from "../lib/motion";
import { profile, specCards } from "../data/profile";

export default function ProfileSection() {
  return (
    <section className="w-full flex justify-center py-12 px-4 mt-10">
      <motion.div
        className="w-full max-w-4xl flex flex-col gap-8"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {/* ========================= */}
        {/* HERO BLOCK */}
        {/* ========================= */}
        <motion.div variants={fadeInUp} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-5xl text-center sm:text-left sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent font-mono leading-none">
              {profile.titleLine1} <span className="text-emerald-500">{profile.titleAccent}</span>
            </h1>
          </div>

          <div className="border-l-2 border-emerald-500/30 pl-6 flex flex-col gap-4">
            {profile.bioParagraphs.map((paragraph) => (
              <p key={paragraph} className="text-base sm:text-lg text-white/80 max-w-2xl leading-relaxed">
                {paragraph}
              </p>
            ))}

            <p className="text-sm text-white/50 max-w-xl font-mono">{profile.focusLine}</p>
          </div>
        </motion.div>

        {/* ========================= */}
        {/* TECHNICAL SPEC GRID */}
        {/* ========================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {specCards.map((card) => (
            <SpecCard key={card.label} iconKey={card.iconKey} label={card.label} value={card.value} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function SpecCard({ iconKey, label, value }: { iconKey: IconKey; label: string; value: string }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="group hover:bg-white/5 transition-colors border border-white/5 rounded-xl p-4 flex flex-col gap-3"
    >
      <div className="flex items-center gap-2 text-emerald-500">
        <Icon name={iconKey} size={18} />
        <span className="text-[10px] uppercase tracking-tighter font-mono text-white/40">{label}</span>
      </div>
      <p className="text-xs sm:text-sm font-medium text-white/90 leading-tight">{value}</p>
    </motion.div>
  );
}
