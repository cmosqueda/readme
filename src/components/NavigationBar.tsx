// NavigationBar.tsx
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
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
                ${isActive ? "font-extrabold text-[color:var(--md-on-primary-container)]" : "text-[color:var(--md-on-surface-variant)] hover:text-[color:var(--md-on-surface)]"}
              `}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active-pill"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  className="absolute inset-0 -z-10 rounded-full bg-[color:var(--md-primary-container)]"
                />
              )}
              <span className="relative">
                {label}
              </span>
            </button>
          );
        })}
        <ThemeToggle className="theme-toggle ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[color:var(--md-primary)] outline-none transition-colors hover:bg-[color:var(--md-surface-container-highest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--md-primary)]" />
        </nav>
      </div>

      <div className="fixed inset-x-0 top-0 z-[50] flex items-center justify-between px-5 py-4 md:hidden">
        <div className="mobile-nav-card rounded-2xl px-4 py-2.5" aria-live="polite">
          <p className="mobile-nav-label text-[10px] font-extrabold uppercase tracking-[0.14em] text-[color:var(--md-on-surface-variant)]">Viewing</p>
          <p className="mobile-nav-current mt-0.5 text-sm font-extrabold capitalize tracking-tight text-[color:var(--md-on-surface)]">{activeLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="mobile-nav-card flex h-11 w-11 items-center justify-center rounded-2xl text-[color:var(--md-on-surface)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--md-primary)]"
          aria-label="Open site navigation"
          aria-expanded={isMobileMenuOpen}
        >
          <Menu size={20} />
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[80] bg-[color:var(--md-scrim)]/40 p-4 md:hidden"
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
                  <p className="mobile-nav-current mt-1 font-['Roboto_Mono'] text-xl font-extrabold capitalize text-[color:var(--md-on-surface)]">{activeLabel}</p>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle className="theme-toggle neo-card flex h-10 w-10 items-center justify-center rounded-xl text-[color:var(--md-primary)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--md-primary)]" />
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="neo-card flex h-10 w-10 items-center justify-center rounded-xl text-[color:var(--md-on-surface-variant)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--md-primary)]"
                    aria-label="Close site navigation"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {sections.map(({ id, label }, index) => {
                  const isActive = active === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleNavigate(id)}
                      className={`flex items-center justify-between rounded-2xl px-4 py-4 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--md-primary)] ${
                        isActive ? "mobile-nav-item-active" : "mobile-nav-item"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className={`text-[15px] font-extrabold capitalize ${isActive ? "text-[color:var(--md-on-primary)]" : "text-[color:var(--md-on-surface-variant)]"}`}>{label}</span>
                      <span className={`text-[10px] font-extrabold ${isActive ? "text-[color:var(--md-on-primary)]/75" : "text-[color:var(--md-on-surface-variant)]/70"}`}>0{index + 1}</span>
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
