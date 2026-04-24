type Props = {
  onNavigate: (section: string) => void;
  active: string;
};

export default function NavigationBar({ onNavigate, active }: Props) {
  const navItems = ["profile", "featured", "workflow", "experience", "contact"];

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center p-6 pointer-events-none">
      <nav
        className="
          pointer-events-auto
          flex flex-row items-center gap-1
          p-1.5
          rounded-full
          bg-gray-900/50
          border border-white/10
          backdrop-blur-xl
          shadow-[0_8px_32px_rgba(0,0,0,0.4)]
          overflow-x-auto
          scrollbar-hide
          max-w-[95vw]
          sm:max-w-fit
        "
      >
        {navItems.map((item) => {
          const isActive = active === item;

          return (
            <button
              key={item}
              onClick={() => onNavigate(item)}
              className={`
                relative
                flex-shrink-0
                px-5 py-2
                rounded-full
                text-[11px] font-mono tracking-wider uppercase
                transition-all duration-300 ease-out
                ${isActive ? "text-emerald-400" : "text-white/40 hover:text-white/80 hover:bg-white/5"}
              `}
            >
              {/* Active Background Glow */}
              {isActive && (
                <div className="absolute inset-0 bg-emerald-500/10 rounded-full border border-emerald-500/20 z-[-1]" />
              )}

              <span className="relative">
                {isActive && <span className="mr-1.5 text-emerald-500/50">/</span>}
                {item}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
