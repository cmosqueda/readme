import { Briefcase, Calendar, MapPin, ChevronRight } from "lucide-react";
import { experiences } from "../data/experiences";

export default function ExperienceSection() {
  return (
    <section className="w-full flex justify-center py-10 px-4">
      <div className="w-full max-w-4xl">
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-12">
          <Briefcase className="text-emerald-500" size={20} />
          <h2 className="text-2xl font-bold tracking-tight uppercase font-mono text-white/90">Professional_Logs</h2>
        </div>

        {/* TIMELINE LIST */}
        <div className="space-y-12">
          {experiences.map((exp, index) => (
            <div key={exp.id} className="relative pl-8 group">
              {/* Vertical Line Connector */}
              {index !== experiences.length - 1 && (
                <div className="absolute left-[11px] top-8 w-[1px] h-full bg-gradient-to-b from-emerald-500/30 to-transparent" />
              )}

              {/* Timeline Node */}
              <div className="absolute left-0 top-1 w-6 h-6 rounded-full border border-white/10 bg-gray-950 flex items-center justify-center group-hover:border-emerald-500/50 transition-colors">
                <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-emerald-500 animate-pulse" />
              </div>

              {/* CONTENT */}
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Dates & Location */}
                <div className="w-full md:w-48 shrink-0 space-y-2 mt-1">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase">
                    <Calendar size={12} className="text-emerald-500/50" />
                    {exp.period}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase">
                    <MapPin size={12} className="text-white/20" />
                    {exp.location}
                  </div>
                </div>

                {/* Role & Company Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white/90 group-hover:text-emerald-400 transition-colors">
                      {exp.role}
                    </h3>
                    <p className="text-sm font-medium text-white/60">{exp.company}</p>
                  </div>

                  <p className="text-sm text-white/40 leading-relaxed max-w-2xl">{exp.description}</p>

                  {/* Highlights/Skills Tags */}
                  <div className="flex flex-wrap gap-2">
                    {exp.highlights.map((skill) => (
                      <span
                        key={skill}
                        className="flex items-center gap-1 text-[9px] font-mono text-emerald-500/70 bg-emerald-500/5 border border-emerald-500/10 px-2 py-1 rounded"
                      >
                        <ChevronRight size={10} />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RECENT STATUS FOOTER */}
        <div className="mt-16 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-transparent border border-white/5">
          <p className="text-xs text-white/60 italic leading-relaxed">
            Active Internship: Currently documenting industry-standard QA workflows and refining system layout integrity
            at CK Children’s Publishing.
          </p>
        </div>
      </div>
    </section>
  );
}
