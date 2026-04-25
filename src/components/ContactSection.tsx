import { Mail, Globe, Github, Send, Terminal, MapPin } from "lucide-react";
import { contactLinks } from "../data/contact";

export default function ContactSection() {
  const icons: Record<string, React.ReactNode> = {
    Email: <Mail size={14} />,
    LinkedIn: <Globe size={14} />,
    GitHub: <Github size={14} />,
  };

  return (
    <section className="w-full flex justify-center py-24 px-4">
      <div className="w-full max-w-4xl border-t border-white/5 pt-16">
        {/* HEADER */}
        <div className="mb-10 space-y-4">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-emerald-500" />
            <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-white/40">Communication_Channels</h2>
          </div>
          <h3 className="text-3xl font-bold text-white/90">Let’s elevate your next project together.</h3>
        </div>

        {/* CHIP INTERFACE */}
        <div className="flex flex-wrap gap-3 mb-16">
          {contactLinks.map((contact) => (
            <a
              key={contact.id}
              href={contact.link}
              target="_blank"
              rel="noopener noreferrer"
              className="
                group flex items-center gap-3 px-4 py-2 
                bg-white/[0.03] border border-white/10 rounded-full
                hover:bg-emerald-500/10 hover:border-emerald-500/30 
                transition-all duration-300
              "
            >
              <span className="text-emerald-500/60 group-hover:text-emerald-400 transition-colors">
                {icons[contact.platform]}
              </span>
              <span className="text-xs font-mono text-white/60 group-hover:text-white transition-colors">
                {contact.platform}
              </span>
              <div className="w-[1px] h-3 bg-white/10 group-hover:bg-emerald-500/20" />
              <span className="text-[10px] text-white/30 group-hover:text-white/50 transition-colors">
                {contact.value}
              </span>
            </a>
          ))}

          {/* STATUS CHIP (Non-clickable) */}
          {/* <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-full cursor-default">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
              Available_for_Internship
            </span>
          </div> */}
        </div>

        {/* SYSTEM FOOTER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 opacity-40">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <MapPin size={12} />
              <span className="text-[10px] font-mono uppercase tracking-tighter">CDO, Philippines</span>
            </div>
            <div className="flex items-center gap-2">
              <Send size={12} />
              <span className="text-[10px] font-mono uppercase tracking-tighter">UTC+8</span>
            </div>
          </div>

          <p className="text-[9px] font-mono uppercase tracking-[0.4em]">End_of_Transmission</p>
        </div>
      </div>
    </section>
  );
}
