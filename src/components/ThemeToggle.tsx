import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { memo, useEffect, useRef, useState } from "react";

type Theme = "light" | "dark";

type ViewTransition = {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition: () => void;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (updateCallback: () => void) => ViewTransition;
};

// M3 motion tokens (https://m3.material.io/styles/motion/easing-and-duration).
// Emphasized-decelerate: fast start, slow settle — used for elements expanding into view.
const M3_EMPHASIZED_DECELERATE = "cubic-bezier(0.05, 0.7, 0.1, 1)";
// Emphasized: the general-purpose curve for attention-worthy transitions (framer-motion needs the bezier as an array).
const M3_EMPHASIZED = [0.2, 0, 0, 1] as const;
const M3_DURATION_REVEAL = 600; // "long2" token
const M3_DURATION_ICON = 200; // "short4" token

function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem("portfolio-theme");
  if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

type Props = {
  className?: string;
};

const defaultClassName =
  "theme-toggle neo-card fixed right-5 top-5 z-[60] flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--md-primary)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--md-primary)]";

export default memo(function ThemeToggle({ className }: Props) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const themeRef = useRef(theme);
  const buttonRef = useRef<HTMLButtonElement>(null);
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
    const button = buttonRef.current;

    if (prefersReducedMotion || !viewTransitionDocument.startViewTransition || !button) {
      applyTheme(nextTheme);
      return;
    }

    // Anchor the reveal on the button itself so it works the same for a
    // mouse click, a tap, or a keyboard activation.
    const { left, top, width, height } = button.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const transition = viewTransitionDocument.startViewTransition(() => applyTheme(nextTheme));

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
        },
        {
          duration: M3_DURATION_REVEAL,
          easing: M3_EMPHASIZED_DECELERATE,
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggleTheme}
      className={className ?? defaultClassName}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-pressed={isDark}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={theme}
          aria-hidden="true"
          initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
          transition={{
            duration: M3_DURATION_ICON / 1000,
            ease: M3_EMPHASIZED,
          }}
          className="flex"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
});
