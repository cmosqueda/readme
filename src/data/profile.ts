import type { IconKey } from "../lib/iconRegistry";

export const profile = {
  eyebrow: "Business Operations. System Design.",
  titleLine1: "Product Systems",
  titleAccent: "Analyst",
  bioParagraphs: [
    "I research how people, teams, and businesses work before helping shape the product around them. By validating user needs and mapping real workflows, I turn ambiguous problems into practical requirements, system designs, and delivery plans.",
    "My work sits between product and engineering: I partner with product leads on direction, translate findings for technical teams, and support quality validation so what ships reflects the original user need.",
  ],
  focusLine: "// Focus: User research, workflow design, product requirements, system mapping, and QA validation.",
};

export const specCards: { iconKey: IconKey; label: string; value: string }[] = [
  {
    iconKey: "terminal",
    label: "User & Workflow Discovery",
    value: "User Validation • Stakeholder Context • Process Mapping",
  },
  {
    iconKey: "presentation",
    label: "Requirements & System Design",
    value: "User Flows • Functional Requirements • Technical Specifications",
  },
  {
    iconKey: "network",
    label: "Quality & Delivery Support",
    value: "Test Scenarios • E2E Validation • Technical Documentation",
  },
];
