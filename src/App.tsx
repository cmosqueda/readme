import { useRef, useState, useEffect } from "react";
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

  const refs: Record<string, React.RefObject<HTMLDivElement | null>> = {
    profile: useRef<HTMLDivElement>(null),
    featured: useRef<HTMLDivElement>(null),
    workflow: useRef<HTMLDivElement>(null),
    experience: useRef<HTMLDivElement>(null),
    contact: useRef<HTMLDivElement>(null),
  };
  const scrollTo = (key: string) => {
    refs[key]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
        rootMargin: "-40% 0px -50% 0px", // controls when section becomes "active"
        threshold: 0,
      },
    );

    sections.forEach((key) => {
      const el = refs[key]?.current;
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar></Sidebar>

      <div className="flex-1 flex flex-col overflow-hidden">
        <NavigationBar onNavigate={scrollTo} active={active} />

        <main className="flex-1 overflow-y-auto px-6 py-10 space-y-20 scrollbar-hide">
          {/* ABOUT */}
          <section id="profile" ref={refs.profile} className="mt-5">
            {/* <h2>Profile</h2> */}
            <ProfileSection></ProfileSection>
          </section>

          {/* FEATURED */}
          <section id="featured" ref={refs.featured}>
            {/* <h2>Featured</h2> */}
            <FeaturedSection></FeaturedSection>
          </section>

          {/* WORKFLOW */}
          <section id="workflow" ref={refs.workflow}>
            {/* <h2>Workflow</h2> */}
            <WorkflowSection></WorkflowSection>
          </section>

          {/* EXPERIENCE */}
          <section id="experience" ref={refs.experience}>
            {/* <h2>Experience</h2> */}
            <ExperienceSection></ExperienceSection>
          </section>

          {/* CONTACT */}
          <section id="contact" ref={refs.contact}>
            {/* <h2>Contact</h2> */}
            <ContactSection></ContactSection>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
