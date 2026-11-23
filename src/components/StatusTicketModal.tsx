import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  Code2,
  Copy,
  ExternalLink,
  Mail,
  MessageSquare,
  Rocket,
  Send,
  Ticket,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";
import { useProfileStatus } from "../data/status";
import { identity } from "../data/identity";
import { contactLinks } from "../data/contact";
import profilePic from "../assets/glorious-goat.jpg";
import { renderStatusIcon } from "../lib/statusIcons";

interface StatusTicketModalProps {
  open: boolean;
  onClose: () => void;
}

type TicketType = "commission" | "workflow" | "development" | "general";

interface TicketOption {
  id: TicketType;
  label: string;
  icon: LucideIcon;
  iconColor: string;
  desc: string;
}

const ticketTypes: TicketOption[] = [
  {
    id: "commission",
    label: "Project Commission",
    icon: Rocket,
    iconColor: "text-sky-400",
    desc: "End-to-end product design, prototyping, or custom systems",
  },
  {
    id: "workflow",
    label: "System & Workflow Analysis",
    icon: Workflow,
    iconColor: "text-amber-400",
    desc: "Workflow mapping, QA systems, and requirement architecture",
  },
  {
    id: "development",
    label: "Full-Stack Development",
    icon: Code2,
    iconColor: "text-emerald-400",
    desc: "React, TypeScript, automation, and modern web apps",
  },
  {
    id: "general",
    label: "General Chat / Question",
    icon: MessageSquare,
    iconColor: "text-purple-400",
    desc: "Quick question, collaboration inquiry, or greeting",
  },
];

export default function StatusTicketModal({ open, onClose }: StatusTicketModalProps) {
  const [status] = useProfileStatus();
  const [type, setType] = useState<TicketType>("commission");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [copied, setCopied] = useState(false);
  const [draftOpened, setDraftOpened] = useState(false);

  const directEmail =
    contactLinks.find((l) => l.platform.toLowerCase() === "email")?.value ||
    "mosqueda.christinereisa04@gmail.com";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const currentType = ticketTypes.find((t) => t.id === type) || ticketTypes[0];

  const formattedTicket = `[COMMISSION / INQUIRY TICKET]
To: ${identity.name} (${identity.systemLabel})
Inquiry Type: ${currentType.label}
From: ${name || "Anonymous / Client"} (${email || "No email provided"})
Subject: ${subject || "(No subject)"}

--- Message Details ---
${details || "(No additional details provided)"}

---
Sent via ${identity.name}'s Portfolio Status Ticket Portal`;

  const mailSubject = `[${currentType.label}] ${subject || "Commission / Inquiry Ticket"}`;

  const mailtoLink = `mailto:${directEmail}?subject=${encodeURIComponent(
    mailSubject
  )}&body=${encodeURIComponent(formattedTicket)}`;

  const gmailWebLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    directEmail
  )}&su=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(formattedTicket)}`;

  const handleCopyTicket = async () => {
    try {
      await navigator.clipboard.writeText(formattedTicket);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // ignore
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Open the user's default desktop/mobile email client prefilled
    window.location.href = mailtoLink;
    setDraftOpened(true);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#02060e]/75 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ticket-modal-title"
    >
      <div
        className="relative flex w-full max-w-xl flex-col max-h-[90vh] overflow-hidden rounded-2xl border border-[var(--orb-rim)] bg-[var(--gh-canvas)] text-[var(--gh-text)] shadow-[0_24px_64px_rgba(0,0,0,0.65),0_0_36px_-8px_var(--orb-glow)] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar: Clean title with ticket icon, NO redundant emoji circle */}
        <div className="flex items-center justify-between border-b border-[var(--gh-border)] bg-[var(--gh-subtle)] px-4 py-3.5">
          <div className="flex items-center gap-2">
            <Ticket size={16} className="text-[var(--orb-ice)]" />
            <h2 id="ticket-modal-title" className="text-sm font-bold tracking-tight">
              Status & Direct Commission Ticket
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[var(--gh-muted)] hover:bg-[var(--gh-canvas)] hover:text-[var(--gh-text)] transition-colors"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal body (scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Status banner: Avatar has the corner icon chip; sub-text has NO redundant emoji */}
          <div className="rounded-lg border border-[var(--gh-border)] bg-[var(--gh-subtle)] p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={profilePic}
                  alt={identity.name}
                  className="h-11 w-11 rounded-full border border-[var(--gh-border)] object-cover"
                />
                <span
                  className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-[var(--gh-border)] bg-[var(--gh-canvas)] text-[var(--gh-text)] shadow-xs"
                  title="Current status icon"
                >
                  {renderStatusIcon(status.emoji, 11)}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm truncate">{identity.name}</p>
                  <span className="text-xs text-[var(--gh-muted)] hidden sm:inline">
                    {identity.systemLabel}
                  </span>
                </div>
                {/* Clean status sub-text without duplicate emoji */}
                <p className="text-xs text-[var(--gh-muted)] font-mono mt-0.5 truncate">
                  {status.message || "Active and available"}
                </p>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Open for inquiries
              </span>
            </div>
          </div>

          {/* Submission Feedback */}
          {draftOpened && (
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-[var(--gh-text)] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <Check size={16} className="shrink-0" />
                  <span>Pre-filled email draft opened in your email client!</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDraftOpened(false)}
                  className="text-[11px] text-[var(--gh-muted)] hover:text-[var(--gh-text)]"
                >
                  Dismiss
                </button>
              </div>
              <p className="text-[11px] text-[var(--gh-muted)] leading-relaxed">
                If your default mail app didn&apos;t open automatically, you can open directly in web Gmail or copy the draft:
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <a
                  href={gmailWebLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] px-2.5 py-1 text-[11px] font-medium text-[var(--gh-text)] hover:bg-[var(--gh-subtle)] hover:border-[var(--gh-muted)] transition-colors"
                >
                  <ExternalLink size={12} className="text-red-400" />
                  <span>Open in Gmail Web</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyTicket}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] px-2.5 py-1 text-[11px] font-medium text-[var(--gh-text)] hover:bg-[var(--gh-subtle)] hover:border-[var(--gh-muted)] transition-colors"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copied ? "Draft Copied!" : "Copy Draft Text"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Inquiry type selection with Lucide icon pack */}
            <div>
              <label className="block text-xs font-semibold text-[var(--gh-text)] mb-1.5">
                Inquiry Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ticketTypes.map((item) => {
                  const selected = item.id === type;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setType(item.id)}
                      className={`flex flex-col text-left p-2.5 rounded-lg border text-xs transition-all ${
                        selected
                          ? "border-[var(--gh-link)] bg-[var(--gh-canvas)] ring-1 ring-[var(--gh-link)]"
                          : "border-[var(--gh-border)] bg-[var(--gh-subtle)] hover:border-[var(--gh-muted)]"
                      }`}
                    >
                      <span className="font-semibold flex items-center gap-2">
                        <Icon size={14} className={item.iconColor} />
                        <span>{item.label}</span>
                      </span>
                      <span className="text-[11px] text-[var(--gh-muted)] mt-1 line-clamp-1">
                        {item.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Client info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--gh-text)] mb-1">
                  Your Name / Handle
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Doe or @janedoe"
                  className="w-full rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] px-3 py-1.5 text-xs outline-none focus:border-[var(--gh-link)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--gh-text)] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] px-3 py-1.5 text-xs outline-none focus:border-[var(--gh-link)]"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-[var(--gh-text)] mb-1">
                Ticket Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Workflow system overhaul / Product commission"
                className="w-full rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] px-3 py-1.5 text-xs outline-none focus:border-[var(--gh-link)]"
              />
            </div>

            {/* Details */}
            <div>
              <label className="block text-xs font-semibold text-[var(--gh-text)] mb-1">
                Project Details / Specifications
              </label>
              <textarea
                required
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Tell me about what you'd like to build, timeline, target deliverables, or any questions..."
                className="w-full rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] px-3 py-2 text-xs outline-none focus:border-[var(--gh-link)] font-mono resize-y"
              />
            </div>

            {/* Direct Line Note */}
            <div className="flex items-center justify-between text-[11px] text-[var(--gh-muted)] pt-1">
              <span className="flex items-center gap-1.5">
                <Mail size={13} />
                <span>Direct line: <strong className="text-[var(--gh-text)]">{directEmail}</strong></span>
              </span>
              <button
                type="button"
                onClick={handleCopyTicket}
                className="inline-flex items-center gap-1 text-[var(--gh-link)] hover:underline"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? "Ticket Copied!" : "Copy Raw Ticket"}</span>
              </button>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--gh-border)]">
              <span className="text-[11px] text-[var(--gh-muted)] hidden sm:inline">
                Prefills a ready-to-send draft in your mail app
              </span>
              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] px-3.5 py-1.5 text-xs font-medium text-[var(--gh-text)] hover:bg-[var(--gh-subtle)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--orb-cobalt)] hover:brightness-110 text-white px-4 py-1.5 text-xs font-semibold shadow-[0_4px_16px_-4px_rgba(59,130,246,0.55)] transition-all cursor-pointer"
                >
                  <Send size={13} />
                  <span>Open Email Draft</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
