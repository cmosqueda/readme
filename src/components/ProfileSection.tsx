import { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../lib/motion";
import { profile } from "../data/profile";
import OrbitalBanner from "./OrbitalBanner";

const ContributionGrass = lazy(() => import("./ContributionGrass"));

export default function ProfileSection() {
  return (
    <section className="flex w-full justify-center px-4 pb-12 pt-8 md:pt-12">
      <motion.div
        className="github-readme w-full max-w-5xl"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="github-readme-tab">
            <span className="github-file-icon">▤</span>
            <span>cmosqueda/README.md</span>
            <span className="orbital-tab-badge">MAIN</span>
          </div>
        </div>

        <div className="github-readme-body">
          <OrbitalBanner />

          <div className="orbital-readme-inner">
            <motion.div variants={fadeInUp} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <p className="section-kicker">{profile.eyebrow}</p>
                <h1 className="github-readme-title">Christine Mosqueda</h1>
              </div>
              <div className="github-quote">
                {profile.bioParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <code className="orbital-focus-line">{profile.focusLine}</code>
              </div>
            </motion.div>
            <Suspense fallback={<div className="contribution-aquarium" aria-hidden="true" style={{ minHeight: 245 }} />}>
              <ContributionGrass />
            </Suspense>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
