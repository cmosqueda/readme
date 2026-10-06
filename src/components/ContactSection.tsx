import { contactLinks } from "../data/contact";
import favicon from "../assets/favicon.png";

export default function ContactSection() {
  return (
    <footer className="github-footer github-footer--bleed">
      <div className="github-footer-inner">
        <div className="github-footer-brand"><img src={favicon} alt="Christine Mosqueda" className="github-footer-favicon" /><span>© {new Date().getFullYear()} Christine Mosqueda</span></div>
        <nav className="github-footer-links" aria-label="Contact links">
          {contactLinks.map((contact) => <a key={contact.id} href={contact.link} target="_blank" rel="noopener noreferrer">{contact.platform}</a>)}
          <a href="/docu/Christine-Mosqueda_resume.pdf" target="_blank" rel="noopener noreferrer">Résumé</a>
        </nav>
      </div>
    </footer>
  );
}
