// pages/Home.tsx
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import MobileProfileCard from "../components/MobileProfileCard";
import NavigationBar from "../components/NavigationBar";
import ProfileSection from "../components/ProfileSection";
import FeaturedSection from "../components/FeaturedSection";
import WorkflowSection from "../components/WorkflowSection";
import ExperienceSection from "../components/ExperienceSection";
import ContactSection from "../components/ContactSection";
import BlogSection from "../components/BlogSection";
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      {
        root: null,
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
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <NavigationBar active={active} />

        <main className="flex-1 overflow-y-auto px-6 py-10 space-y-20 scrollbar-hide">
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
