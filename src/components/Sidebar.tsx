import { memo } from "react";
import { identity } from "../data/identity";
import ProfilePhotoPreview from "./ProfilePhotoPreview";
import StatusBadge from "./StatusBadge";
import StrengthMarquee from "./StrengthMarquee";

export default memo(function Sidebar() {
  return (
    <aside className="github-sidebar relative z-10 hidden w-72 flex-col justify-between px-7 py-10 md:flex">
      <div className="flex flex-col gap-8">
        <div className="relative mx-auto inline-block">
          <ProfilePhotoPreview sizeClassName="github-avatar h-40 w-40" />
          <StatusBadge variant="desktop-corner" />
        </div>

        <div className="space-y-1">
          <p className="text-2xl font-semibold tracking-tight">{identity.name}</p>
          <p className="github-muted text-base">
            {identity.systemLabel} · {identity.moniker}
          </p>
          <p className="pt-2 text-sm leading-relaxed">{identity.tagline}</p>
        </div>

        <div className="space-y-4">
          <p className="github-side-heading">Core strengths</p>
          <StrengthMarquee />
        </div>
      </div>

      <div className="flex justify-between px-1 text-[10px] github-muted">
        <p>{identity.systemLabel}</p>
        <p>© {new Date().getFullYear()}</p>
      </div>
    </aside>
  );
});
