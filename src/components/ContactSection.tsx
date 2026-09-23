import { motion } from "framer-motion";
import { Send, MessageCircle, MapPin } from "lucide-react";
import { Icon } from "../lib/icons";
import { contactLinks } from "../data/contact";
import { fadeInUp, staggerContainer } from "../lib/motion";

export default function ContactSection() {
  return (
    <section className="w-full flex justify-center py-24 px-4">
      <motion.div
        className="w-full max-w-4xl border-t border-[#d5dde5] pt-16"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div variants={fadeInUp} className="mb-10 space-y-4">
          <div className="flex items-center gap-2">
            <MessageCircle size={16} className="text-[#496b86]" />
            <h2 className="section-kicker">Get in touch</h2>
          </div>
          <h3 className="font-[Manrope] text-3xl font-bold tracking-[-0.04em] text-[#2d3b4c]">
            Let&apos;s turn validated needs into a buildable product system.
          </h3>
          <p className="max-w-2xl text-sm leading-relaxed text-[#617388]">
            Open to early-career product systems opportunities and scoped product discovery, workflow design, and
            requirements consulting.
          </p>
        </motion.div>

        {/* CHIP INTERFACE */}
        <motion.div variants={staggerContainer} className="flex flex-wrap gap-3 mb-16">
          {contactLinks.map((contact) => (
            <motion.a
              variants={fadeInUp}
              key={contact.id}
              href={contact.link}
              target="_blank"
              rel="noopener noreferrer"
              className="
                neo-card-interactive group flex items-center gap-3 rounded-full px-4 py-2
              "
            >
              <span className="text-[#496b86]">
                <Icon name={contact.iconKey} size={14} />
              </span>
              <span className="text-xs font-semibold text-[#43556a]">
                {contact.platform}
              </span>
              <div className="h-3 w-px bg-[#c6d1db]" />
              <span className="text-[10px] text-[#718194]">
                {contact.value}
              </span>
            </motion.a>
          ))}

          {/* STATUS CHIP (Non-clickable) */}
          {/* <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-full cursor-default">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
              Available_for_Internship
            </span>
          </div> */}
        </motion.div>

        {/* SYSTEM FOOTER */}
        <div className="flex flex-col items-start justify-between gap-6 text-[#718194] sm:flex-row sm:items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <MapPin size={12} />
              <span className="text-[10px] font-semibold uppercase tracking-wide">CDO, Philippines</span>
            </div>
            <div className="flex items-center gap-2">
              <Send size={12} />
              <span className="text-[10px] font-semibold uppercase tracking-wide">UTC+8</span>
            </div>
          </div>

          <p className="text-[9px] font-semibold uppercase tracking-[0.2em]">Let’s collaborate</p>
        </div>
      </motion.div>
    </section>
  );
}
