import { Download, ExternalLink } from "lucide-react";
import { identity } from "../data/identity";
import ProfilePhotoPreview from "./ProfilePhotoPreview";
import StrengthMarquee from "./StrengthMarquee";

export default function MobileProfileCard() {
  return (
    <aside className="mx-auto w-full max-w-4xl px-4 pt-24 md:hidden">
      <div className="profile-card relative overflow-hidden rounded-[2rem] p-6">

        <div className="profile-card-identity flex items-center gap-4 rounded-2xl p-4">
          <ProfilePhotoPreview sizeClassName="h-24 w-24" />
          <div className="min-w-0 space-y-1">
            <p className="font-[Manrope] text-xl font-bold tracking-tight text-[#2d3b4c]">{identity.name}</p>
            <p className="text-xs leading-relaxed text-[#617388]">{identity.tagline}</p>
          </div>
        </div>

        <a
          href={identity.cvHref}
          target="_blank"
          rel="noopener noreferrer"
          className="profile-card-action neo-button-primary group mt-5 flex min-h-14 items-center justify-between rounded-2xl px-5 py-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#496b86]"
        >
          <span className="flex items-center gap-3">
            <span className="rounded-lg bg-white/15 p-1.5 text-white transition-transform group-hover:scale-110">
              <Download size={14} />
            </span>
            <span className="text-xs font-bold tracking-wide">Download résumé</span>
          </span>
          <ExternalLink size={14} className="text-white/70" />
        </a>

        <div className="profile-card-strengths mt-5 rounded-2xl p-4">
          <p className="section-kicker mb-3">Core strengths</p>
          <StrengthMarquee />
        </div>
      </div>
    </aside>
  );
}
