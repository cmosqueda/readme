import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import NavigationBar from "./components/NavigationBar";
import ProfileSection from "./components/ProfileSection";
import FeaturedSection from "./components/FeaturedSection";
import WorkflowSection from "./components/WorkflowSection";
import ExperienceSection from "./components/ExperienceSection";
import ContactSection from "./components/ContactSection";

const sections = ["profile", "featured", "workflow", "experience", "contact"];

function App() {
  const [active, setActive] = useState("profile");

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
        rootMargin: "-40% 0px -50% 0px", // Maintains your active section logic
        threshold: 0,
      },
    );

    // Observe elements by their ID string
    sections.forEach((id) => {
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
          <section id="profile">
            <ProfileSection />
          </section>

          <section id="featured">
            <FeaturedSection />
          </section>

          <section id="workflow">
            <WorkflowSection />
          </section>

          <section id="experience">
            <ExperienceSection />
          </section>

          <section id="contact">
            <ContactSection />
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
