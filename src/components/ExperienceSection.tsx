import { BriefcaseBusiness } from "lucide-react";
import { experiences } from "../data/experiences";

export default function ExperienceSection() {
  return (
    <section className="w-full px-4 py-12">
      <div className="mx-auto w-full max-w-5xl">
        <h2 className="github-activity-title">Experience</h2>
        <div className="github-month-divider"><strong>Career activity</strong><i /></div>
        <div className="github-activity-timeline">
          <div className="github-activity-event-icon"><BriefcaseBusiness size={19} /></div>
          <div className="github-experience-list">
            {experiences.map((experience) => (
              <article className="github-experience-item" key={experience.id}>
                <h3>{experience.role}</h3>
                <p>{experience.company}</p>
                <time>{experience.period}</time>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
