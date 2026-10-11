import { FileText } from "lucide-react";
import { contactLinks } from "../data/contact";
import { iconRegistry } from "../lib/iconRegistry";
import favicon from "../assets/favicon.png";

export default function ContactSection() {
  return (
    <footer className="github-footer github-footer--bleed">
      <div className="github-footer-inner">
        <div className="github-footer-brand"><img src={favicon} alt="Christine Mosqueda" className="github-footer-favicon" /><span>© {new Date().getFullYear()} Christine Mosqueda</span></div>
        <nav className="github-footer-links" aria-label="Contact links">
          {contactLinks.map((contact) => {
            const Icon = iconRegistry[contact.iconKey];
            return (
              <a
                key={contact.id}
                href={contact.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={contact.platform}
                title={contact.platform}
              >
                <Icon size={16} aria-hidden="true" />
                <span className="github-footer-link-label">{contact.platform}</span>
              </a>
            );
          })}
          <a
            href="/docu/Christine-Mosqueda_resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Résumé"
            title="Résumé"
          >
            <FileText size={16} aria-hidden="true" />
            <span className="github-footer-link-label">Résumé</span>
          </a>
        </nav>
      </div>
    </footer>
  );
}
