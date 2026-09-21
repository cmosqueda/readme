import { Download, ExternalLink } from "lucide-react";
import { Icon } from "../lib/icons";
import { identity, summaryTags } from "../data/identity";
import ProfilePhotoPreview from "./ProfilePhotoPreview";

export default function MobileProfileCard() {
  return (
    <aside className="md:hidden w-full max-w-4xl mx-auto px-4 pt-20">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-5 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

        <div className="flex items-center gap-4">
          <ProfilePhotoPreview sizeClassName="w-20 h-20" />
          <div className="min-w-0 space-y-1">
            <p className="text-lg font-bold tracking-tight text-white/90">{identity.name}</p>
            <p className="text-xs leading-relaxed text-white/50">{identity.tagline}</p>
          </div>
        </div>

        <a
          href={identity.cvHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-5 flex min-h-12 items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 shadow-[0_0_20px_rgba(16,185,129,0.05)] transition-all duration-300 hover:border-emerald-500/40 hover:bg-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          <span className="flex items-center gap-3">
            <span className="rounded-md bg-emerald-500/20 p-1.5 text-emerald-400 transition-transform group-hover:scale-110">
              <Download size={14} />
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-emerald-400">VIEW_CV</span>
          </span>
          <ExternalLink size={14} className="text-emerald-500/50 transition-colors group-hover:text-emerald-400" />
        </a>

        <div className="mt-5">
          <p className="mb-3 text-[10px] font-mono uppercase tracking-widest text-white/25">Core Tracks</p>
          <div className="flex flex-wrap gap-2">
            {summaryTags.map((tag) => (
              <div key={tag.label} className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5">
                <span className="text-emerald-500/70"><Icon name={tag.iconKey} size={10} /></span>
                <span className="text-[10px] font-medium text-white/60">{tag.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
