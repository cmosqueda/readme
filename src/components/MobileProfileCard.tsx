import { memo } from "react";
import { identity } from "../data/identity";
import ProfilePhotoPreview from "./ProfilePhotoPreview";
import StatusBadge from "./StatusBadge";

export default memo(function MobileProfileCard() {
  return (
    <aside className="github-mobile-profile orbital-mobile-profile mx-auto w-full max-w-5xl md:hidden">
      <div className="flex items-center gap-4">
        <ProfilePhotoPreview sizeClassName="github-avatar h-20 w-20 shrink-0" />
        <div className="min-w-0">
          <span className="orbital-sys-pill mb-1.5">
            <span className="orbital-live-dot" aria-hidden="true" />
            SYS.ANALYST
          </span>
          <p className="text-xl font-bold tracking-tight">{identity.name}</p>
          <p className="github-muted font-mono text-xs">
            {identity.systemLabel} · {identity.moniker}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <StatusBadge variant="mobile-banner" />
      </div>

      <p className="mt-3 text-sm leading-relaxed github-muted">{identity.tagline}</p>
    </aside>
  );
});
