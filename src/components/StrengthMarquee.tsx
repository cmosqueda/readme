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
        <span key={tag.label} className="neo-pressed flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5">
          <span className="text-[#4b7355]"><Icon name={tag.iconKey} size={11} /></span>
          <span className="whitespace-nowrap text-[10px] font-medium text-[#52657a]">{tag.label}</span>
        </span>
      ))}
    </div>
  );
}
