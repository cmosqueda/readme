import { BriefcaseBusiness, MapPin } from "lucide-react";
import { getAllExperiences } from "../lib/content";
import { experiences as fallbackExperiences } from "../data/experiences";

export default function ExperienceSection() {
  const dynamicExperiences = getAllExperiences();
  const experiences = dynamicExperiences.length > 0 ? dynamicExperiences : fallbackExperiences;

  return (
    <section className="w-full px-4 py-12">
      <div className="mx-auto w-full max-w-5xl">
        <h2 className="github-activity-title">Experience</h2>
        <div className="github-month-divider">
          <strong>Career activity</strong>
          <i />
          <span className="text-[11px] text-[color:var(--orb-muted)]">04 // TIMELINE</span>
        </div>
        <div className="github-activity-timeline">
          <div className="github-activity-event-icon">
            <BriefcaseBusiness size={19} />
          </div>
          <div className="github-experience-list">
            {experiences.map((experience, idx) => {
              const key =
                "slug" in experience && typeof experience.slug === "string"
                  ? experience.slug
                  : "id" in experience && typeof experience.id === "string"
                  ? experience.id
                  : `exp-${idx}`;
              const isCurrent = idx === 0 || experience.period.toLowerCase().includes("present");
              return (
                <article
                  className={`github-experience-item ${isCurrent ? "github-experience-item--current" : ""}`}
                  key={key}
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <h3>{experience.role}</h3>
                    <time className="shrink-0">{experience.period}</time>
                  </div>
                  <p className="flex flex-wrap items-center gap-1.5 font-medium text-[var(--gh-text)]">
                    <span>{experience.company}</span>
                    {experience.location && (
                      <span className="inline-flex items-center gap-1 text-xs font-normal github-muted">
                        · <MapPin size={11} /> {experience.location}
                      </span>
                    )}
                  </p>
                  {experience.description && (
                    <p className="mt-2 text-xs leading-relaxed github-muted">
                      {experience.description}
                    </p>
                  )}
                  {experience.highlights && experience.highlights.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {experience.highlights.map((tag, i) => (
                        <span key={i} className="github-badge px-2 py-0.5 text-[11px]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
