import { Download, ExternalLink } from "lucide-react";
import { Icon } from "../lib/icons";
import { identity, summaryTags } from "../data/identity";
import ProfilePhotoPreview from "./ProfilePhotoPreview";

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-72 flex-col justify-between p-8 border-r border-white/5 bg-gray-950/50 backdrop-blur-xl relative">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

      <div className="flex flex-col gap-8">
        {/* PROFILE SCANNER AREA */}
        <div className="mx-auto">
          <ProfilePhotoPreview sizeClassName="w-36 h-36" />
        </div>

        {/* IDENTITY DETAILS */}
        <div className="flex flex-col gap-5">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-white/90">{identity.name}</h1>
            <p className="text-xs text-white/40 leading-relaxed font-light">{identity.tagline}</p>
          </div>

          {/* CV BUTTON COMPONENT */}
          <a
            href={identity.cvHref}
            target="_blank"
            rel="noopener noreferrer"
            className="
              group flex items-center justify-between px-4 py-3
              bg-emerald-500/10 border border-emerald-500/20 rounded-xl
              hover:bg-emerald-500/20 hover:border-emerald-500/40
              transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.05)]
            "
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-emerald-500/20 rounded-md text-emerald-400 group-hover:scale-110 transition-transform">
                <Download size={14} />
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider">VIEW_CV</span>
            </div>
            <ExternalLink size={12} className="text-emerald-500/40 group-hover:text-emerald-400 " />
          </a>
        </div>

        {/* SYSTEM TAGS */}
        <div className="space-y-4">
          <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Core Tracks</p>
          <div className="flex flex-wrap gap-2">
            {summaryTags.map((tag) => (
              <div
                key={tag.label}
                className="flex items-center gap-1.5 bg-white/[0.03] border border-white/10 px-3 py-1.5 rounded-md hover:border-emerald-500/30 transition-colors"
              >
                <span className="text-emerald-500/70">
                  <Icon name={tag.iconKey} size={10} />
                </span>
                <span className="text-[10px] font-medium text-white/60">{tag.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER STATS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <p className="text-[10px] font-mono text-white/20 uppercase">{identity.systemLabel}</p>
          <p className="text-[10px] font-mono text-white/20">© {new Date().getFullYear()}</p>
        </div>
      </div>
    </aside>
  );
}
