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
              return (
                <article className="github-experience-item" key={key}>
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                    <h3>{experience.role}</h3>
                    <time className="text-xs text-[var(--gh-muted)] shrink-0">{experience.period}</time>
                  </div>
                  <p className="font-medium text-[var(--gh-text)] flex items-center gap-1.5 flex-wrap">
                    <span>{experience.company}</span>
                    {experience.location && (
                      <span className="text-xs text-[var(--gh-muted)] inline-flex items-center gap-1 font-normal">
                        · <MapPin size={11} /> {experience.location}
                      </span>
                    )}
                  </p>
                  {experience.description && (
                    <p className="mt-2 text-xs leading-relaxed text-[var(--gh-muted)]">
                      {experience.description}
                    </p>
                  )}
                  {experience.highlights && experience.highlights.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {experience.highlights.map((tag, i) => (
                        <span key={i} className="github-badge text-[11px] py-0.5 px-2">
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
