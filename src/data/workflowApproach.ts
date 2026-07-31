import type { IconKey } from "../lib/iconRegistry";

export const workflowPrinciples: {
  id: string;
  iconKey: IconKey;
  title: string;
  subtitle: string;
  description: string;
  meta: string;
}[] = [
  {
    id: "01",
    iconKey: "search",
    title: "Discover Before Designing",
    subtitle: "Customer Context First",
    description:
      "I start by understanding the user’s current workflow, constraints, stakeholders, and success criteria before recommending a product path or technical solution.",
    meta: "Discovery Motion",
  },
  {
    id: "02",
    iconKey: "network",
    title: "Translate Problems into Solutions",
    subtitle: "Business Need → Technical Fit",
    description:
      "I connect pain points to product capabilities, API behavior, user flows, and implementation requirements so the solution is clear to both technical and non-technical teams.",
    meta: "Solution Mapping",
  },
  {
    id: "03",
    iconKey: "presentation",
    title: "Prove Value with Evidence",
    subtitle: "Demo • PoC • Documentation",
    description:
      "I use demos, test scenarios, QA artifacts, and structured documentation to show how the proposed solution works, where it fits, and what risks need to be managed.",
    meta: "Proof of Value",
  },
];
