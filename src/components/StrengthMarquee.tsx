import { Icon } from "../lib/icons";
import { summaryTags } from "../data/identity";

export default function StrengthMarquee() {
  return (
    <div className="strength-marquee" aria-label="Core strengths">
      <div className="strength-marquee-track">
        <StrengthItems />
        <div aria-hidden="true"><StrengthItems /></div>
      </div>
    </div>
  );
}

function StrengthItems() {
  return (
    <div className="flex shrink-0 gap-2 pr-2">
      {summaryTags.map((tag) => (
        <span key={tag.label} className="orbital-strength-chip flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5">
          <span className="text-[color:var(--orb-ice)]"><Icon name={tag.iconKey} size={11} /></span>
          <span className="whitespace-nowrap text-[11px] font-medium text-[color:var(--orb-secondary)]">{tag.label}</span>
        </span>
      ))}
    </div>
  );
}
