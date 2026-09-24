// NavigationBar.tsx
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { sections } from "../data/navigation";

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

  const activeLabel = sections.find((section) => section.id === active)?.label ?? "portfolio";

  return (
    <>
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-[50] hidden justify-center p-6 md:flex">
        <nav className="neo-surface pointer-events-auto flex flex-row items-center gap-1 rounded-full p-1.5 overflow-x-auto scrollbar-hide max-w-[95vw] sm:max-w-fit">
        {sections.map(({ id, label }) => {
          const isActive = active === id;

          return (
            <button
              key={id}
              onClick={() => handleNavigate(id)}
              className={`
                relative flex-shrink-0 px-5 py-2 rounded-full
                text-xs font-semibold tracking-wide capitalize
                transition-colors duration-300 ease-out
                ${isActive ? "font-extrabold text-[#2d3b4c]" : "text-[#617388] hover:text-[#2d3b4c]"}
              `}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active-pill"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  className="absolute inset-0 -z-10 rounded-full border border-[#4b7355] bg-[#e4ede5]"
                />
              )}
              <span className="relative">
                {label}
              </span>
            </button>
          );
        })}
        </nav>
      </div>

      <div className="fixed inset-x-0 top-0 z-[50] flex items-center justify-between px-5 py-4 md:hidden">
        <div className="mobile-nav-card rounded-2xl px-4 py-2.5" aria-live="polite">
          <p className="mobile-nav-label text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#617388]">Viewing</p>
          <p className="mobile-nav-current mt-0.5 text-sm font-extrabold capitalize tracking-tight text-[#2d3b4c]">{activeLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="mobile-nav-card flex h-11 w-11 items-center justify-center rounded-2xl text-[#2d3b4c] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4b7355]"
          aria-label="Open site navigation"
          aria-expanded={isMobileMenuOpen}
        >
          <Menu size={20} />
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[80] bg-[#1f2e22]/35 p-4 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.nav
              className="mobile-nav-panel ml-auto flex h-full w-full max-w-[20rem] flex-col rounded-3xl p-6"
              aria-label="Mobile site navigation"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 32 }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-10 flex items-center justify-between">
                <div>
                  <p className="mobile-nav-label section-kicker">Currently viewing</p>
                  <p className="mobile-nav-current mt-1 font-[Fraunces] text-xl font-extrabold capitalize text-[#2d3b4c]">{activeLabel}</p>
                </div>
                  <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="neo-card flex h-10 w-10 items-center justify-center rounded-xl text-[#52657a] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4b7355]"
                  aria-label="Close site navigation"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {sections.map(({ id, label }, index) => {
                  const isActive = active === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleNavigate(id)}
                      className={`flex items-center justify-between rounded-2xl px-4 py-4 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4b7355] ${
                        isActive ? "mobile-nav-item-active" : "mobile-nav-item"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className={`text-[15px] font-extrabold capitalize ${isActive ? "text-white" : "text-[#43556a]"}`}>{label}</span>
                      <span className={`text-[10px] font-extrabold ${isActive ? "text-white/75" : "text-[#718194]"}`}>0{index + 1}</span>
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
