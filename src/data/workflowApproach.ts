import type { IconKey } from "../lib/iconRegistry";

export const workflowPrinciples: {
  id: string;
  iconKey: IconKey;
  title: string;
  subtitle: string;
  description: string;
  meta: string;
  signal: string;
  deliverables: string[];
}[] = [
  {
    id: "01",
    iconKey: "search",
    title: "Discover the Real Workflow",
    subtitle: "Research & Validation",
    description:
      "I learn how users, stakeholders, and operations work today, then validate the constraints, pain points, and success criteria before recommending a solution.",
    meta: "Discover",
    signal: "User needs, stakeholder context, operational constraints, and existing workflow friction.",
    deliverables: ["Research notes", "Workflow map", "Validated problem"],
  },
  {
    id: "02",
    iconKey: "network",
    title: "Define a Buildable System",
    subtitle: "Requirements & Design",
    description:
      "I translate validated needs into user flows, functional requirements, system behavior, and technical documentation that align product and engineering teams.",
    meta: "Define",
    signal: "Validated needs and workflow findings that need a clear, feasible product response.",
    deliverables: ["User flows", "Requirements", "System blueprint"],
  },
  {
    id: "03",
    iconKey: "presentation",
    title: "Validate What Ships",
    subtitle: "Quality & Delivery Support",
    description:
      "I support implementation with test scenarios, QA artifacts, demos, and documentation to verify that the delivered experience still meets the validated need.",
    meta: "Validate",
    signal: "A build in progress and the original user need it is meant to solve.",
    deliverables: ["Test scenarios", "QA findings", "Delivery notes"],
  },
];
