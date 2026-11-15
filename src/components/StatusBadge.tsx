import { memo, useState } from "react";
import { useProfileStatus, type ProfileStatus } from "../data/status";
import StatusTicketModal from "./StatusTicketModal";
import { renderStatusIcon } from "../lib/statusIcons";
import { Send } from "lucide-react";

interface StatusBadgeProps {
  variant?: "desktop-corner" | "mobile-banner" | "inline";
  customStatus?: ProfileStatus;
  className?: string;
  onClick?: () => void;
  expandAlways?: boolean; // For static previews in Studio
  disableModal?: boolean;
}

export default memo(function StatusBadge({
  variant = "desktop-corner",
  customStatus,
  className = "",
  onClick,
  expandAlways = false,
  disableModal = false,
}: StatusBadgeProps) {
  const [storedStatus] = useProfileStatus();
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const status = customStatus ?? storedStatus;

  const hasEmoji = Boolean(status.emoji?.trim());
  const hasMessage = Boolean(status.message?.trim());

  if (!hasEmoji && !hasMessage) {
    return null;
  }

  const tooltip = [status.emoji, status.message].filter(Boolean).join(" ");

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    } else if (!disableModal) {
      e.stopPropagation();
      setTicketModalOpen(true);
    }
  };

  if (variant === "desktop-corner") {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          title={`${tooltip} · Click for direct contact & commissions`}
          aria-label={`Status: ${tooltip}. Click for direct contact and commission inquiries.`}
          className={`group absolute bottom-1 -right-1.5 z-20 flex h-7 items-center rounded-full border border-[var(--gh-border)] bg-[var(--gh-canvas)] shadow-md cursor-pointer select-none overflow-hidden transition-all duration-300 ease-out hover:shadow-lg hover:border-[var(--gh-link)] focus-visible:outline-2 focus-visible:outline-[var(--gh-link)] ${
            expandAlways
              ? "max-w-[220px] px-2.5"
              : "min-w-[28px] max-w-[28px] justify-center px-1.5 hover:max-w-[220px] hover:px-2.5"
          } ${className}`}
        >
          {hasEmoji && (
            <span className="flex items-center justify-center shrink-0" aria-hidden="true">
              {renderStatusIcon(status.emoji, 13, "text-[var(--gh-text)]")}
            </span>
          )}
          {hasMessage && (
            <span
              className={`whitespace-nowrap text-xs font-normal tracking-tight text-[var(--gh-text)] transition-all duration-300 ease-out ${
                expandAlways
                  ? "max-w-[180px] opacity-100 ml-1.5"
                  : "max-w-0 opacity-0 overflow-hidden group-hover:max-w-[180px] group-hover:opacity-100 group-hover:ml-1.5"
              }`}
            >
              {status.message}
            </span>
          )}
        </button>

        {!disableModal && (
          <StatusTicketModal
            open={ticketModalOpen}
            onClose={() => setTicketModalOpen(false)}
          />
        )}
      </>
    );
  }

  if (variant === "mobile-banner") {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          title={`${tooltip} · Tap to submit direct contact / commission ticket`}
          className={`w-full flex items-center justify-between gap-2.5 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] px-3 py-1.5 text-xs text-[var(--gh-text)] shadow-xs select-none transition-colors hover:border-[var(--gh-link)] cursor-pointer text-left group ${className}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {hasEmoji && (
              <span className="flex items-center justify-center shrink-0" aria-hidden="true">
                {renderStatusIcon(status.emoji, 14, "text-[var(--gh-text)]")}
              </span>
            )}
            {hasMessage && (
              <span className="truncate text-xs font-normal text-[var(--gh-text)]">
                {status.message}
              </span>
            )}
          </div>
          <span className="shrink-0 text-[10px] text-[var(--gh-muted)] flex items-center gap-1 group-hover:text-[var(--gh-link)] transition-colors">
            <span>Ticket</span>
            <Send size={10} />
          </span>
        </button>

        {!disableModal && (
          <StatusTicketModal
            open={ticketModalOpen}
            onClose={() => setTicketModalOpen(false)}
          />
        )}
      </>
    );
  }

  // Inline variant
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-[var(--gh-border)] bg-[var(--gh-canvas)] px-2.5 py-0.5 text-xs text-[var(--gh-text)] shadow-xs ${className}`}
      title={tooltip}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {hasEmoji && renderStatusIcon(status.emoji, 12, "shrink-0 text-[var(--gh-text)]")}
      {hasMessage && <span className="truncate font-normal">{status.message}</span>}
    </span>
  );
});
