import quickeaseUserManual from "../assets/proj_logos/quickease v2_cover page_user manual.png";
import radioCassetteUserManual from "../assets/proj_logos/radio cassette_cover page_user manual.png";
import quickeasePoster from "../assets/proj_logos/Poster_BSIT_Ikinamada_CITCSIBOL2026.png";

const projects = [
  // { name: "portfolio", url: "https://github.com/cmosqueda/portfolio", stacks: ["vite", "react"], proj_bg: "" },
  // { name: "quickease-docs", url: "https://github.com/cmosqueda/quickease-docs", stacks: ["docusaurus"], proj_bg: "" },
  // {
  //   name: "skrappr",
  //   url: "https://github.com/cmosqueda/skrappr",
  //   stacks: ["vite", "react", "express.js", "puppeteer"],
  //   proj_bg: "",
  // },
  // { name: "fuhnaff-lore", url: "https://github.com/cmosqueda/fuhnaff-lore", stacks: ["vite", "react"], proj_bg: "" },
  {
    name: "QuickEase 2.0 User Manual",
    url: "/readme/docu/quickease 2.0_user manual-compressed.pdf",
    stacks: ["user manual", "booklet"],
    proj_bg: quickeaseUserManual,
  },
  {
    name: "Radio Cassette User Manual",
    url: "/readme/docu/trifold_user manual_radio cassette.pdf",
    stacks: ["user manual", " trifold", "brochure"],
    proj_bg: radioCassetteUserManual,
  },
  {
    name: "QuickEase 2.0 Poster - CITCSIBOL 2026 Entry",
    url: "/readme/docu/Poster_BSIT_Ikinamada_CITCSIBOL2026.pdf",
    stacks: ["poster", "graphic design"],
    proj_bg: quickeasePoster,
  },
];

export default function WorksGroupBar() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {projects.map((project) => (
        <a
          key={project.name}
          href={project.url}
          target="_blank"
          className="group relative overflow-hidden rounded-lg border border-white/20 shadow-lg"
        >
          {/* Image */}
          <img
            src={project.proj_bg}
            alt={project.name}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-3">
            <h3 className="text-sm font-semibold">{project.name}</h3>

            <div className="flex flex-wrap gap-1 mt-1">
              {project.stacks.map((stack) => (
                <span key={stack} className="text-[10px] px-2 py-0.5 border border-white/30 rounded-md">
                  {stack}
                </span>
              ))}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
