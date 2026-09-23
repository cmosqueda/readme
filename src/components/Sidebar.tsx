import { Download, ExternalLink } from "lucide-react";
import { identity } from "../data/identity";
import ProfilePhotoPreview from "./ProfilePhotoPreview";
import StrengthMarquee from "./StrengthMarquee";

export default function Sidebar() {
  return (
    <aside className="neo-surface hidden md:flex w-72 flex-col justify-between p-8 relative z-10">

      <div className="flex flex-col gap-8">
        <div className="mx-auto">
          <ProfilePhotoPreview sizeClassName="w-36 h-36" />
        </div>

        {/* IDENTITY DETAILS */}
        <div className="flex flex-col gap-5">
          <div className="space-y-1">
            <p className="font-[Manrope] text-xl font-bold tracking-tight text-[#2d3b4c]">{identity.name}</p>
            <p className="text-xs text-[#617388] leading-relaxed">{identity.tagline}</p>
          </div>

          <a
            href={identity.cvHref}
            target="_blank"
            rel="noopener noreferrer"
            className="
              resume-button neo-button-primary group flex items-center justify-between rounded-2xl px-4 py-3
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#496b86]
            "
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white/15 p-1.5 text-white transition-transform group-hover:scale-110">
                <Download size={14} />
              </div>
              <span className="text-xs font-bold tracking-wide">Download résumé</span>
            </div>
            <ExternalLink size={12} className="text-white/70" />
          </a>
        </div>

        <div className="space-y-4">
          <p className="section-kicker">Core strengths</p>
          <StrengthMarquee />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <p className="text-[10px] text-[#8090a0]">{identity.systemLabel}</p>
          <p className="text-[10px] text-[#8090a0]">© {new Date().getFullYear()}</p>
        </div>
      </div>
    </aside>
  );
}
