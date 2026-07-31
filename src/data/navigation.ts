// Single source of truth for section ids/labels — consumed by both
// NavigationBar (nav pills) and Home (scroll-spy + section wrappers).
// The workflow section is built (see WorkflowSection.tsx) but intentionally
// left out here; add { id: "workflow", label: "workflow" } to re-enable it.
export const sections = [
  { id: "profile", label: "profile" },
  { id: "featured", label: "featured" },
  { id: "experience", label: "experience" },
  { id: "blogs", label: "blogs" },
  { id: "contact", label: "contact" },
];
