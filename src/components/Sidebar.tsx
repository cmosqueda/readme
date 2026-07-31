import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, ExternalLink, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import profilePic from "../assets/mosqueda-pic.jpg";
import { Icon } from "../lib/icons";
import { identity, summaryTags } from "../data/identity";
import { fadeScale } from "../lib/motion";

export default function Sidebar() {
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
    <aside className="hidden md:flex w-72 flex-col justify-between p-8 border-r border-white/5 bg-gray-950/50 backdrop-blur-xl relative">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

      <div className="flex flex-col gap-8">
        {/* PROFILE SCANNER AREA */}
        <motion.button
          type="button"
          onClick={() => setIsPreviewOpen(true)}
          aria-label="View full profile picture"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative group mx-auto cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 rounded-full"
        >
          <div className="absolute -inset-1 bg-gradient-to-b from-emerald-500/20 to-transparent rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative w-36 h-36 rounded-full border-2 border-white/5 bg-gray-900 flex items-center justify-center overflow-hidden">
            <img src={profilePic} alt="Profile" />
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
                className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-950/90 backdrop-blur-xl p-8"
              >
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  aria-label="Close preview"
                  className="absolute top-6 right-6 rounded-full border border-white/10 bg-white/[0.03] p-3 text-white/50 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                >
                  <X size={18} />
                </button>
                <img
                  src={profilePic}
                  alt="Profile preview"
                  onClick={(event) => event.stopPropagation()}
                  className="max-h-[85vh] max-w-[85vw] rounded-2xl border border-white/10 object-contain shadow-[0_0_60px_rgba(16,185,129,0.15)]"
                />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}

        {/* IDENTITY DETAILS */}
        <div className="flex flex-col gap-5">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-white/90">{identity.name}</h1>
            <p className="text-xs text-white/40 leading-relaxed font-light">{identity.tagline}</p>
          </div>

          {/* CV BUTTON COMPONENT */}
          <a
            href={identity.cvHref}
            target="_blank"
            rel="noopener noreferrer"
            className="
              group flex items-center justify-between px-4 py-3
              bg-emerald-500/10 border border-emerald-500/20 rounded-xl
              hover:bg-emerald-500/20 hover:border-emerald-500/40
              transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.05)]
            "
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-emerald-500/20 rounded-md text-emerald-400 group-hover:scale-110 transition-transform">
                <Download size={14} />
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider">VIEW_CV</span>
            </div>
            <ExternalLink size={12} className="text-emerald-500/40 group-hover:text-emerald-400 " />
          </a>
        </div>

        {/* SYSTEM TAGS */}
        <div className="space-y-4">
          <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Core Tracks</p>
          <div className="flex flex-wrap gap-2">
            {summaryTags.map((tag) => (
              <div
                key={tag.label}
                className="flex items-center gap-1.5 bg-white/[0.03] border border-white/10 px-3 py-1.5 rounded-md hover:border-emerald-500/30 transition-colors"
              >
                <span className="text-emerald-500/70">
                  <Icon name={tag.iconKey} size={10} />
                </span>
                <span className="text-[10px] font-medium text-white/60">{tag.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER STATS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <p className="text-[10px] font-mono text-white/20 uppercase">{identity.systemLabel}</p>
          <p className="text-[10px] font-mono text-white/20">© {new Date().getFullYear()}</p>
        </div>
      </div>
    </aside>
  );
}
