import { memo } from "react";
import { identity } from "../data/identity";
import ProfilePhotoPreview from "./ProfilePhotoPreview";

export default memo(function MobileProfileCard() {
  return (
    <aside className="github-mobile-profile mx-auto w-full max-w-5xl md:hidden">
      <div className="flex items-start gap-4">
        <ProfilePhotoPreview sizeClassName="github-avatar h-20 w-20 shrink-0" />
        <div className="min-w-0 pt-1">
          <p className="text-xl font-semibold tracking-tight">{identity.name}</p>
          <p className="github-muted text-sm">
            {identity.systemLabel} · {identity.moniker}
          </p>
          <p className="mt-3 text-sm leading-relaxed">{identity.tagline}</p>
        </div>
      </div>
      <a
        href={identity.cvHref}
        target="_blank"
        rel="noopener noreferrer"
        className="github-button mt-4 block w-full px-3 py-1.5 text-center text-sm font-medium"
      >
        View résumé
      </a>
    </aside>
  );
});
