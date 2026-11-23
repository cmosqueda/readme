import { memo } from "react";
import { identity } from "../data/identity";
import ProfilePhotoPreview from "./ProfilePhotoPreview";
import StatusBadge from "./StatusBadge";
import StrengthMarquee from "./StrengthMarquee";

export default memo(function Sidebar() {
  return (
    <aside className="github-sidebar relative z-10 hidden w-72 flex-col justify-between px-7 py-9 md:flex">
      <div className="flex flex-col gap-6">
        <div className="orbital-avatar-stage">
          <div className="orbital-avatar-orbit" aria-hidden="true" />
          <ProfilePhotoPreview sizeClassName="github-avatar h-40 w-40" />
          <StatusBadge variant="desktop-corner" />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 pb-0.5">
            <span className="orbital-sys-pill">
              <span className="orbital-live-dot" aria-hidden="true" />
              SYS.ANALYST
            </span>
            <span className="font-mono text-[10px] github-muted">PH · UTC+8</span>
          </div>
          <p className="text-[1.42rem] font-bold leading-tight tracking-tight">{identity.name}</p>
          <p className="github-muted font-mono text-xs">
            {identity.systemLabel} · {identity.moniker}
          </p>
          <p className="pt-1.5 text-sm leading-relaxed github-muted">{identity.tagline}</p>
        </div>

        <div className="space-y-3">
          <p className="github-side-heading flex items-center justify-between">
            <span>Core strengths</span>
            <span className="font-mono text-[10px] text-[color:var(--orb-ice)]">04</span>
          </p>
          <StrengthMarquee />
        </div>
      </div>

      <div className="flex justify-between border-t border-[color:var(--gh-border)] px-1 pt-4 font-mono text-[11px] github-muted">
        <p>{identity.systemLabel}</p>
        <p>© {new Date().getFullYear()}</p>
      </div>
    </aside>
  );
});
