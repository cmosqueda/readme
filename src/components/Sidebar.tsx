import { Database, FileCode, CheckCircle, ShieldCheck, Download, ExternalLink } from "lucide-react";
import profilePic from "../assets/mosqueda_photo.png";

export default function Sidebar() {
  const summaryTags = [
    { label: "QA Testing", icon: <CheckCircle size={10} /> },
    { label: "Reliability", icon: <ShieldCheck size={10} /> },
    { label: "API Validation", icon: <Database size={10} /> },
    { label: "AI Evaluation", icon: <FileCode size={10} /> },
  ];

  return (
    <aside className="hidden md:flex w-72 flex-col justify-between p-8 border-r border-white/5 bg-gray-950/50 backdrop-blur-xl relative">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

      <div className="flex flex-col gap-8">
        {/* PROFILE SCANNER AREA */}
        <div className="relative group mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-b from-emerald-500/20 to-transparent rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative w-32 h-32 rounded-full border-2 border-white/5 bg-gray-900 flex items-center justify-center overflow-hidden">
            {/* <div className="w-full h-full bg-gradient-to-tr from-gray-800 to-gray-900 flex items-center justify-center text-white/10 italic text-xs">
              IMG_SCAN
            </div> */}
            <img src={profilePic} alt="Profile" />
            {/* <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500/30 shadow-[0_0_15px_emerald-500] animate-[scan_3s_ease-in-out_infinite]" /> */}
          </div>
        </div>

        {/* IDENTITY DETAILS */}
        <div className="flex flex-col gap-5">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-white/90">Tine Mosqueda</h1>
            <p className="text-xs text-white/40 leading-relaxed font-light">
              Ensuring system integrity through structured validation and edge-case analysis.
            </p>
          </div>

          {/* CV BUTTON COMPONENT */}
          <a
            href="/public/docu/Christine-Mosqueda-CV-updated.pdf"
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
          <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Skills</p>
          <div className="flex flex-wrap gap-2">
            {summaryTags.map((tag) => (
              <div
                key={tag.label}
                className="flex items-center gap-1.5 bg-white/[0.03] border border-white/10 px-3 py-1.5 rounded-md hover:border-emerald-500/30 transition-colors"
              >
                <span className="text-emerald-500/70">{tag.icon}</span>
                <span className="text-[10px] font-medium text-white/60">{tag.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER STATS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <p className="text-[10px] font-mono text-white/20 uppercase">Core_System.v2</p>
          <p className="text-[10px] font-mono text-white/20">© {new Date().getFullYear()}</p>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
      `}</style>
    </aside>
  );
}
