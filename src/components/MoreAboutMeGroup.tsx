import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function MoreAboutMeGroup() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm mt-2 underline hover:text-gray-300"
      >
        More about me
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="leading-relaxed text-justify">
          I like learning stuff about Machine Learning and AI (I'm not a pro though, the concepts genuinely just
          fascinate me). Aside from that, I like to conceptualize, ideate, and curate contents (I guess I consider those
          my niche interests). And I mostly enjoy and prefer working on areas that require my skills in graphic design,
          quality assurance testing, social media marketing, business-driven perspectives, and writing (both technical
          and academic).
          <br />
          <br />
          <i>
            ... and I really love FNaF, Harry Potter, and Kpop (currently hyperfixating on KATSEYE... I know ok they're
            not Kpop but they're still on the POP culture category, and Lara Raj...)
          </i>
        </p>
      </div>
    </div>
  );
}
