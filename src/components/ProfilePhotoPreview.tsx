import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import profilePic from "../assets/mosqueda_photo.png";
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
        className="relative group shrink-0 cursor-pointer rounded-2xl outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#496b86]"
      >
        <div
          className={`neo-card relative ${sizeClassName} flex items-center justify-center overflow-hidden rounded-2xl`}
        >
          <img src={profilePic} alt="Tine Mosqueda" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[#2d3b4c]/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-[9px] font-semibold tracking-widest text-white">View photo</span>
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
              className="fixed inset-0 z-[200] flex items-center justify-center bg-[#2d3b4c]/35 backdrop-blur-md p-6 sm:p-8"
              role="dialog"
              aria-modal="true"
              aria-label="Profile photo preview"
            >
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                aria-label="Close profile photo preview"
                className="neo-card absolute top-4 right-4 rounded-full p-3 text-[#52657a] transition hover:text-[#2d3b4c] sm:top-6 sm:right-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#496b86]"
              >
                <X size={18} />
              </button>
              <img
                src={profilePic}
                alt="Tine Mosqueda profile preview"
                onClick={(event) => event.stopPropagation()}
                className="neo-card max-h-[85vh] max-w-[85vw] rounded-3xl object-contain p-1"
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
