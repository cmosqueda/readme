// NavigationBar.tsx
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { sections } from "../data/navigation";

type Props = {
  active: string;
};

export default function NavigationBar({ active }: Props) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
              onClick={() => handleScroll(id)}
              className={`
                relative flex-shrink-0 px-5 py-2 rounded-full
                text-[11px] font-semibold tracking-wide capitalize
                transition-colors duration-300 ease-out
                ${isActive ? "text-[#3e607a]" : "text-[#718194] hover:text-[#2d3b4c]"}
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active-pill"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  className="neo-pressed absolute inset-0 rounded-full z-[-1]"
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
        <div className="neo-card rounded-2xl px-4 py-2.5">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8090a0]">Portfolio</p>
          <p className="text-xs font-bold capitalize text-[#43556a]">{activeLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="neo-card flex h-11 w-11 items-center justify-center rounded-2xl text-[#496b86] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#496b86]"
          aria-label="Open site navigation"
          aria-expanded={isMobileMenuOpen}
        >
          <Menu size={20} />
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[80] bg-[#203044]/35 p-4 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.nav
              className="neo-surface ml-auto flex h-full w-full max-w-[20rem] flex-col rounded-3xl p-6"
              aria-label="Mobile site navigation"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 32 }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-10 flex items-center justify-between">
                <div>
                  <p className="section-kicker">Navigate</p>
                  <p className="mt-1 font-[Manrope] text-xl font-bold text-[#2d3b4c]">Portfolio sections</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="neo-card flex h-10 w-10 items-center justify-center rounded-xl text-[#52657a] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#496b86]"
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
                      onClick={() => handleScroll(id)}
                      className={`flex items-center justify-between rounded-2xl px-4 py-4 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#496b86] ${
                        isActive ? "neo-pressed" : "neo-card-interactive"
                      }`}
                    >
                      <span className={`text-sm font-bold capitalize ${isActive ? "text-[#496b86]" : "text-[#43556a]"}`}>{label}</span>
                      <span className="text-[10px] font-bold text-[#8090a0]">0{index + 1}</span>
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
