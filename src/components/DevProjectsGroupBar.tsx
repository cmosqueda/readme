const projects = [
  { name: "portfolio", url: "https://github.com/cmosqueda/portfolio", stacks: ["vite", "react"] },
  { name: "quickease-docs", url: "https://github.com/cmosqueda/quickease-docs", stacks: ["docusaurus"] },
  {
    name: "skrappr",
    url: "https://github.com/cmosqueda/skrappr",
    stacks: ["vite", "react", "express.js", "puppeteer"],
  },
  { name: "fuhnaff-lore", url: "https://github.com/cmosqueda/fuhnaff-lore", stacks: ["vite", "react"] },
];

export default function DevProjectsGroupBar() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {projects.map((project) => (
          <div
            key={project.name}
            className="flex flex-col justify-between gap-2 border border-white/25 p-2 rounded-sm backdrop-blur-md shadow-lg"
          >
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
        ))}
        {/*  */}
      </div>
    </>
  );
}
