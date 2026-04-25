---
id: "qe-02"
title: "QuickEase 2.0"
category: "EdTech • AI Validation"
role: "Lead QA & Researcher"
status: "Stable"
description: "A capstone project featuring an AI-powered study helper platform combined with gamification and a dedicated social environment for peer-learning and knowledge-sharing."
tools: ["Gemini 2.5/2.0", "AHP", "Postman", "Jest"]
workflow: ["ISO/IEC 25010", "SUS Testing", "AHP Framework"]
stats:
  - label: "AHP Top Model"
    value: "Gemini 2.5 Flash"
  - label: "Reliability"
    value: "98.2%"
  - label: "SUS Score"
    value: "77.95"
  - label: "Test Coverage"
    value: "Iterative/Regression"
---

# Quality Assurance Strategy

QuickEase 2.0 is an AI-powered study helper platform utilizing **Document-Grounded Generation (DGG)**. My role involved architecting a multi-layered validation framework to ensure educational integrity and LLM reliability.

### Test Methodology

I implemented a hybrid testing approach to cover the full application lifecycle:

- **Integration Testing:** Automated API validation using **Postman** and backend logic verification via **Jest**.
- **Manual Rigor:** Iterative test case design derived from the Project Charter, utilizing GitHub-hosted Markdown documentation for collaborative tracking.
- **Regression Suite:** A systematic **PASS/FAIL** template used during every deployment phase to prevent feature regression.

---

# The DGG AI Validation (Human-in-the-Loop)

A critical component of this project was the comparative analysis of LLM performance within our DGG pipeline. We aimed to optimize for **Inference Quality** vs. **Cost Efficiency**.

### Evaluation Framework

We benchmarked **Gemini 2.5 Flash** and **Gemini 2.0 Flash** against **GPT-4o mini** (Baseline).

1.  **Grounding:** 13 specialized PDF study materials acted as the static knowledge base.
2.  **Task Switching:** Architected a suitability logic where complex reasoning tasks routed to **2.5 Flash**, while lightweight processing utilized **2.0 Flash**.
3.  **AHP Analysis:** Utilized the **Analytic Hierarchy Process (AHP)** to quantify qualitative human ratings (based on educational rubrics) into weighted scores.

### Key Findings & Performance Hierarchy

Based on our AHP weighted calculations, the performance hierarchy for education-grounded tasks was validated as:

> **Gemini 2.5 Flash (Winner)** > **GPT-4o mini** > **Gemini 2.0 Flash**

This verification enabled us to implement a cost-optimized switching logic without compromising the accuracy of study notes and quiz generation.

---

# System Usability & Compliance

Beyond the AI engine, I conducted comprehensive usability testing using the **System Usability Scale (SUS)**.

- **Result:** Achieved a score of **77.95**, categorizing the platform as "Acceptable/Good" under ISO/IEC 25010 standards.
- **Outcome:** Identified and resolved 4 critical UX bottlenecks in the AI-response feedback loop.
