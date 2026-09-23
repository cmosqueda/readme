import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { memo, useEffect, useRef, useState } from "react";

type Theme = "light" | "dark";

type ViewTransitionDocument = Document & {
  startViewTransition?: (updateCallback: () => void) => { finished: Promise<void> };
};

function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem("portfolio-theme");
  if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default memo(function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const themeRef = useRef(theme);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    themeRef.current = theme;
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("portfolio-theme", theme);
  }, [theme]);

  const isDark = theme === "dark";

  const applyTheme = (nextTheme: Theme) => {
    themeRef.current = nextTheme;
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("portfolio-theme", nextTheme);
    setTheme(nextTheme);
  };

  const toggleTheme = () => {
    // Keep this outside React's render cycle so rapid clicks cannot use a stale theme.
    const nextTheme: Theme = themeRef.current === "dark" ? "light" : "dark";
    const viewTransitionDocument = document as ViewTransitionDocument;

    if (!prefersReducedMotion && viewTransitionDocument.startViewTransition) {
      viewTransitionDocument.startViewTransition(() => applyTheme(nextTheme));
      return;
    }

    applyTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle neo-card fixed right-[4.5rem] top-4 z-[60] flex h-11 w-11 items-center justify-center rounded-full text-[#496b86] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#496b86] md:right-5 md:top-5"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-pressed={isDark}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={theme}
          aria-hidden="true"
          initial={{ opacity: 0, rotate: -90, scale: 0.75 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.75 }}
          transition={{
            duration: 0.2,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="flex"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
});
