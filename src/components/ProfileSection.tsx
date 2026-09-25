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
            <p className="section-kicker text-center sm:text-left">
              {profile.eyebrow}
            </p>
            <h1 className="font-['Roboto_Mono'] text-5xl text-center sm:text-left sm:text-6xl font-extrabold tracking-[-0.06em] text-[color:var(--md-on-surface)] leading-none">
              {profile.titleLine1} <span className="text-[color:var(--md-primary)]">{profile.titleAccent}</span>
            </h1>
          </div>

          <div className="neo-pressed rounded-r-2xl border-l-4 border-[color:var(--md-secondary)]/60 py-4 pl-6 pr-4 flex flex-col gap-4">
            {profile.bioParagraphs.map((paragraph) => (
              <p key={paragraph} className="max-w-2xl text-base leading-relaxed text-[color:var(--md-on-surface-variant)] sm:text-lg">
                {paragraph}
              </p>
            ))}

            <p className="max-w-xl text-sm text-[color:var(--md-on-surface-variant)]/80">{profile.focusLine.replace("// Focus: ", "Focus: ")}</p>
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
      className="neo-card-interactive flex flex-col gap-3 rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 text-[color:var(--md-primary)]">
        <Icon name={iconKey} size={18} />
        <span className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--md-on-surface-variant)]">{label}</span>
      </div>
      <p className="text-xs font-medium leading-tight text-[color:var(--md-on-surface-variant)] sm:text-sm">{value}</p>
    </motion.div>
  );
}
