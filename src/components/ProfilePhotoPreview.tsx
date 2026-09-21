import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import profilePic from "../assets/mosqueda-pic.jpg";
import { fadeScale } from "../lib/motion";

type Props = {
  sizeClassName: string;
};

export default function ProfilePhotoPreview({ sizeClassName }: Props) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
        aria-label="View Tine Mosqueda's full profile picture"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative group shrink-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 rounded-full"
      >
        <div className="absolute -inset-1 bg-gradient-to-b from-emerald-500/20 to-transparent rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000" />
        <div className={`relative ${sizeClassName} rounded-full border-2 border-white/5 bg-gray-900 flex items-center justify-center overflow-hidden`}>
          <img src={profilePic} alt="Tine Mosqueda" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-[9px] font-mono uppercase tracking-widest text-white/80">View</span>
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
              className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-950/90 backdrop-blur-xl p-6 sm:p-8"
              role="dialog"
              aria-modal="true"
              aria-label="Profile photo preview"
            >
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                aria-label="Close profile photo preview"
                className="absolute top-4 right-4 sm:top-6 sm:right-6 rounded-full border border-white/10 bg-white/[0.03] p-3 text-white/50 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300 focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              >
                <X size={18} />
              </button>
              <img
                src={profilePic}
                alt="Tine Mosqueda profile preview"
                onClick={(event) => event.stopPropagation()}
                className="max-h-[85vh] max-w-[85vw] rounded-2xl border border-white/10 object-contain shadow-[0_0_60px_rgba(16,185,129,0.15)]"
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
