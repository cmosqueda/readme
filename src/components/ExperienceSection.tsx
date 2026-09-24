import { motion } from "framer-motion";
import { Briefcase, Calendar, MapPin, ChevronRight } from "lucide-react";
import { experiences } from "../data/experiences";
import { fadeInUp, staggerContainer } from "../lib/motion";

export default function ExperienceSection() {
  return (
    <section className="w-full flex justify-center py-10 px-4">
      <div className="w-full max-w-4xl">
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-12">
          <span className="neo-icon h-10 w-10"><Briefcase size={19} /></span>
          <h2 className="section-title">Experience</h2>
        </div>

        {/* TIMELINE LIST */}
        <motion.div
          className="space-y-12"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {experiences.map((exp, index) => (
            <motion.div key={exp.id} variants={fadeInUp} className="relative pl-8 group">
              {/* Vertical Line Connector */}
              {index !== experiences.length - 1 && (
                <div className="absolute left-[11px] top-8 h-full w-[2px] bg-[#c6d1db]" />
              )}

              {/* Timeline Node */}
              <div className="neo-card absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full">
                <div className="h-2 w-2 rounded-full bg-[#6f9376]" />
              </div>

              {/* CONTENT */}
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Dates & Location */}
                <div className="w-full md:w-48 shrink-0 space-y-2 mt-1">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-[#718194]">
                    <Calendar size={12} className="text-[#6f9376]" />
                    {exp.period}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-[#718194]">
                    <MapPin size={12} className="text-[#91a6b8]" />
                    {exp.location}
                  </div>
                </div>

                {/* Role & Company Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="font-[Fraunces] text-xl font-bold text-[#2d3b4c]">
                      {exp.role}
                    </h3>
                    <p className="text-sm font-medium text-[#617388]">{exp.company}</p>
                  </div>

                  <p className="max-w-2xl text-sm leading-relaxed text-[#617388]">{exp.description}</p>

                  {/* Highlights/Skills Tags */}
                  <div className="flex flex-wrap gap-2">
                    {exp.highlights.map((skill) => (
                      <span
                        key={skill}
                        className="neo-pressed flex items-center gap-1 rounded-md px-2 py-1 text-[9px] font-medium text-[#52657a]"
                      >
                        <ChevronRight size={10} />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* RECENT STATUS FOOTER */}
        {/* <div className="mt-16 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-transparent border border-white/5">
          <p className="text-xs text-white/60 italic leading-relaxed">
            Active Internship: Currently practicing as a layout artist and QA intern at CK Children’s Publishing.
          </p>
        </div> */}
      </div>
    </section>
  );
}
