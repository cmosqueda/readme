// pages/Home.tsx
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import MobileProfileCard from "../components/MobileProfileCard";
import NavigationBar from "../components/NavigationBar";
import ProfileSection from "../components/ProfileSection";
import FeaturedSection from "../components/FeaturedSection";
import WorkflowSection from "../components/WorkflowSection";
import ExperienceSection from "../components/ExperienceSection";
import ContactSection from "../components/ContactSection";
import BlogSection from "../components/BlogSection";
import ThemeToggle from "../components/ThemeToggle";
import { sections } from "../data/navigation";

const sectionComponents: Record<string, React.ReactNode> = {
  profile: <ProfileSection />,
  workflow: <WorkflowSection />,
  featured: <FeaturedSection />,
  experience: <ExperienceSection />,
  blogs: <BlogSection />,
  contact: <ContactSection />,
};

export default function Home() {
  const [active, setActive] = useState(sections[0].id);
  const scrollRootRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const id = location.hash.slice(1);
    const scrollRoot = scrollRootRef.current;
    const section = document.getElementById(id);

    if (!scrollRoot || !section || !sections.some((item) => item.id === id)) return;

    const targetTop = section.getBoundingClientRect().top - scrollRoot.getBoundingClientRect().top + scrollRoot.scrollTop;
    scrollRoot.scrollTo({ top: targetTop, behavior: "smooth" });
  }, [location.hash]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive((current) => current === entry.target.id ? current : entry.target.id);
        });
      },
      {
        root: scrollRootRef.current,
        rootMargin: "-40% 0px -50% 0px",
        threshold: 0,
      },
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="app-shell flex h-screen">
      <Sidebar />
      <ThemeToggle />

      <div className="flex-1 flex flex-col overflow-hidden">
        <NavigationBar
          active={active}
          onNavigate={(id) => navigate({ pathname: "/", hash: `#${id}` })}
        />

        <main ref={scrollRootRef} className="flex-1 overflow-y-auto px-4 py-10 space-y-20 sm:px-6 scrollbar-hide">
          <MobileProfileCard />
          {sections.map(({ id }, index) => (
            <section key={id} id={id} className={index === 0 ? "mt-5" : undefined}>
              {sectionComponents[id]}
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
