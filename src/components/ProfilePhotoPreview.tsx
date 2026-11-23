import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import profilePic from "../assets/glorious-goat.jpg";
import { fadeScale } from "../lib/motion";

type Props = {
  sizeClassName: string;
};

export default function ProfilePhotoPreview({ sizeClassName }: Props) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const isCircular = sizeClassName.includes("github-avatar");

  useEffect(() => {
    if (!isPreviewOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsPreviewOpen(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isPreviewOpen]);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setIsPreviewOpen(true)}
        aria-label="View Christine Mosqueda's full profile picture"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`orbital-avatar-trigger group relative shrink-0 cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--orb-cobalt)] ${isCircular ? "rounded-full" : "rounded-2xl"}`}
      >
        <div
          className={`orbital-avatar-frame relative ${sizeClassName} flex items-center justify-center overflow-hidden ${isCircular ? "rounded-full" : "rounded-2xl"}`}
        >
          <img
            src={profilePic}
            alt="Christine Mosqueda, known as Tine Mosqueda and Rocket Puncher"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-[#03060c]/60 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="rounded-full border border-white/25 bg-slate-900/75 px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-widest text-white">
              View photo
            </span>
          </div>
        </div>
      </motion.button>

      {createPortal(
        <AnimatePresence>
          {isPreviewOpen && (
            <motion.div
              variants={fadeScale}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsPreviewOpen(false)}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-[#02060e]/80 p-6 backdrop-blur-md sm:p-8"
              role="dialog"
              aria-modal="true"
              aria-label="Profile photo preview"
            >
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                aria-label="Close profile photo preview"
                className="github-icon-button absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full sm:top-6 sm:right-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--orb-cobalt)]"
              >
                <X size={18} />
              </button>
              <img
                src={profilePic}
                alt="Christine Mosqueda profile preview"
                onClick={(event) => event.stopPropagation()}
                className="max-h-[85vh] max-w-[85vw] rounded-2xl border border-[color:var(--orb-rim)] bg-[color:var(--orb-panel)] object-contain p-1 shadow-2xl"
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
