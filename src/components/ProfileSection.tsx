import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../lib/motion";
import { profile } from "../data/profile";
import ContributionGrass from "./ContributionGrass";

export default function ProfileSection() {
  return (
    <section className="flex w-full justify-center px-4 pb-12 pt-8 md:pt-12">
      <motion.div className="github-readme w-full max-w-5xl" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
        <div className="github-readme-tab"><span className="github-file-icon">▤</span> cmosqueda/README.md</div>
        <div className="github-readme-body">
          <motion.div variants={fadeInUp} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2"><p className="section-kicker">{profile.eyebrow}</p><h1 className="github-readme-title">{profile.titleLine1} <span>{profile.titleAccent}</span></h1></div>
            <div className="github-quote">{profile.bioParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<p className="font-mono text-xs">{profile.focusLine}</p></div>
          </motion.div>
          <ContributionGrass />
        </div>
      </motion.div>
    </section>
  );
}
