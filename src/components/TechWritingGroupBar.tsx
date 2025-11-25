import quickeaseUserManual from "../assets/proj_logos/quickease v2_cover page_user manual.png";
import radioCassetteUserManual from "../assets/proj_logos/radio cassette_cover page_user manual.png";

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
];

export default function TechWritingGroupBar() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2  gap-3">
        {projects.map((project) => (
          <div className="flex flex-row gap-2 border border-white/25 p-2 rounded-sm backdrop-blur-md shadow-lg">
            <img src={project.proj_bg} alt={project.proj_bg} className="h-36 rounded-sm object-contain" />
            <div key={project.name} className="flex flex-col justify-between">
              <a href={project.url} target="_blank" className="w-fit hover:underline">
                {project.name}
              </a>
              <div className=" flex flex-wrap flex-row gap-1">
                {project.stacks.map((stack) => (
                  <span key={stack} className="p-1 border border-white/25 rounded-lg">
                    <p className="text-xs">{stack}</p>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        {/*  */}
      </div>
    </>
  );
}
