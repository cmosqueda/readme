// NavigationBar.tsx
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";
import { sections } from "../data/navigation";
import ThemeToggle from "./ThemeToggle";

type Props = {
  active: string;
  onNavigate: (id: string) => void;
};

export default function NavigationBar({ active, onNavigate }: Props) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigate = (id: string) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  const activeLabel = sections.find((section) => section.id === active)?.label ?? "overview";

  return (
    <>
      <header className="github-topbar hidden md:block">
        <div className="github-topbar-inner">
          <button onClick={() => handleNavigate("profile")} className="github-wordmark w-[9rem]" aria-label="Go to profile overview">
            <span className="github-mark">◉</span> {activeLabel === "profile" ? "Overview" : "Christine Mosqueda"}
          </button>
          <nav className="github-tabs" aria-label="Portfolio sections">
        {sections.filter((section) => section.showInNav !== false).map(({ id, label }) => {
          const isActive = active === id;

          return (
            <button
              key={id}
              onClick={() => handleNavigate(id)}
              className={`
                github-tab relative flex-shrink-0 px-4 py-4 text-sm capitalize
                ${isActive ? "github-tab-active" : ""}
              `}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="relative">{label}</span>
            </button>
          );
        })}
          </nav>
          <ThemeToggle className="github-theme-toggle" />
        </div>
      </header>

      <div className="fixed inset-x-0 top-0 z-[50] flex items-center justify-between px-5 py-4 md:hidden">
        <div className="github-mobile-brand" aria-live="polite">
          <BookOpen size={16} /> <span>cmosqueda / README</span>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="github-mobile-menu flex h-9 w-9 items-center justify-center outline-none"
          aria-label="Open site navigation"
          aria-expanded={isMobileMenuOpen}
        >
          <Menu size={20} />
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[80] bg-black/40 p-4 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.nav
              className="github-mobile-panel ml-auto flex h-full w-full max-w-[20rem] flex-col p-6"
              aria-label="Mobile site navigation"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 32 }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-10 flex items-center justify-between">
                <div>
                  <p className="section-kicker">Currently viewing</p>
                  <p className="mt-1 font-mono text-xl font-bold capitalize">{activeLabel}</p>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle className="github-theme-toggle" />
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="github-icon-button flex h-9 w-9 items-center justify-center outline-none"
                    aria-label="Close site navigation"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {sections.filter((section) => section.showInNav !== false).map(({ id, label }, index) => {
                  const isActive = active === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleNavigate(id)}
                      className={`github-mobile-nav-item flex items-center justify-between px-3 py-3 text-left outline-none ${isActive ? "github-mobile-nav-item-active" : ""}`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className="text-[15px] font-semibold capitalize">{label}</span>
                      <span className="font-mono text-[10px]">0{index + 1}</span>
                    </button>
                  );
                })}
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
