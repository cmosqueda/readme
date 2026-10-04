import { Download, ExternalLink } from "lucide-react";
import { memo } from "react";
import { identity } from "../data/identity";
import ProfilePhotoPreview from "./ProfilePhotoPreview";
import StrengthMarquee from "./StrengthMarquee";

export default memo(function Sidebar() {
  return (
    <aside className="github-sidebar relative z-10 hidden w-72 flex-col justify-between px-7 py-10 md:flex">
      <div className="flex flex-col gap-8">
        <div className="mx-auto"><ProfilePhotoPreview sizeClassName="github-avatar h-40 w-40" /></div>

        <div className="flex flex-col gap-5">
          <div className="space-y-1">
            <p className="text-2xl font-semibold tracking-tight">{identity.name}</p>
            <p className="github-muted text-base">{identity.systemLabel}</p>
            <p className="pt-2 text-sm leading-relaxed">{identity.tagline}</p>
          </div>

          <a href={identity.cvHref} target="_blank" rel="noopener noreferrer" className="github-button group flex items-center justify-between px-4 py-2">
            <span className="flex items-center gap-3">
              <span className="github-resume-icon rounded-md p-1.5 transition-transform group-hover:scale-110"><Download size={14} /></span>
              <span className="text-xs font-semibold tracking-wide">View résumé</span>
            </span>
            <ExternalLink size={12} className="github-muted" />
          </a>
        </div>

        <div className="space-y-4"><p className="github-side-heading">Core strengths</p><StrengthMarquee /></div>
      </div>

      <div className="flex justify-between px-1 text-[10px] github-muted"><p>{identity.systemLabel}</p><p>© {new Date().getFullYear()}</p></div>
    </aside>
  );
});
