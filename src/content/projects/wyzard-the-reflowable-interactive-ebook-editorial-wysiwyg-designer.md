---
title: "Wyzard: The Reflowable Interactive Ebook & Editorial WYSIWYG Designer"
category: "Digital Publishing • Creative Tools"
role: "Product Designer & Full-stack Developer"
status: "In Progress"
description: "A local-first, visual drag-and-drop designer packaged as a web-browser extension for reflowable editorial layouts and interactive ebooks, built to bridge graphic design control with multi-device responsiveness."
tools:
  - "React"
  - "TypeScript"
  - "Vite"
  - "HTML/CSS"
  - "EPUB 3"
workflow:
  - "Mobile-first design"
  - "Dual-target export"
  - "JSON AST compilation"
  - "Local-first persistence"
  - "Browser extension"
details:
  - label: "Architecture"
    value: "Local-first"
  - label: "Layout model"
    value: "Reflowable"
  - label: "Export Formats"
    value: "Web HTML5 & EPUB 3"
order: 0
draft: false
---

# The Problem with Designing for a Single Screen

I have worked on the creative side before, and one thing I noticed early on is how rigid traditional layout workflows can be. When designing for a specific medium, you immediately lock yourself into a fixed canvas size and aspect ratio before placing a single element.

Once the layout is done, almost every designer ends up asking the same question:

**"I wonder what this will look like on different devices."**

This becomes a major bottleneck for visual-heavy layouts tailored to tablets or laptops. On larger displays, smaller typography, multi-column spreads, and intricate arrangements read comfortably. Open that same static layout on a smartphone, however, and the experience falls apart—forcing readers into an endless cycle of pinching, zooming, and horizontal scrolling.

On the flip side, traditional reflowable ebook tools solve multi-device reading by stripping away visual control, leaving designers stuck with rigid, text-only templates that flatten their art direction.

## The Realization: Let the Web Solve Reflow

That tension made me ask:

**Are there existing tools that actually bridge visual art direction with true multi-device responsiveness?**

Exploring reflowable formats made the solution obvious. Modern web styling—through CSS Flexbox, Grid, and fluid typography—handles dynamic screen sizes effortlessly. Since the EPUB 3 standard is built directly on HTML5 and CSS3, the answer was clear: HTML and CSS can solve the reflowable design problem without sacrificing visual layouts.

## Introducing Wyzard: The Reflowable Interactive Ebook & Editorial WYSIWYG Designer

To test this idea, I built and released the first version of **Wyzard** ([github.com/cmosqueda/wyzard](https://github.com/cmosqueda/wyzard))—a local-first, visual drag-and-drop designer built for reflowable editorial layouts and interactive ebooks.

Instead of trapping designers on a static, fixed-pixel canvas, Wyzard takes a mobile-first, block-based approach:

- **Design for Flow, Not Fixed Coordinates:** Compose layouts using responsive editorial blocks—such as adaptive split spreads, art-directed image containers with focal-point controls, and interactive reveal cards—that naturally reflow across screen sizes.
- **Live Multi-Device Previewing:** Switch between mobile portrait, tablet, and desktop viewports inside the workspace to see how your spread adapts in real time, and apply non-destructive layout overrides for larger screens without duplicating content.
- **Local-First & Dual-Export Ready:** Built to run locally in the browser with zero backend friction, Wyzard compiles a single visual project into responsive web publications and clean, standards-compliant EPUB 3 packages.

## How to Try Wyzard

1. Go to the [Wyzard GitHub repository](https://github.com/cmosqueda/wyzard) and open the **Releases** section.
2. Download the latest `.zip` release file and extract it to a folder on your device.
3. Open your browser's **Extensions** manager (click the puzzle icon in the top-right toolbar).
4. Toggle on **Developer mode** in the top-right corner.
5. Click **Load unpacked** in the top-left corner and select the extracted folder.
6. Wyzard is now installed and ready to launch from your extensions menu.

## FAQs

- **Why "Wyzard"?** The "Wy" comes from **WYSIWYG** (*What You See Is What You Get*)—an interface that lets you design and format content visually so it looks virtually identical to the final output.
- **Does this need an internet connection?** Nope. It is local-first, so you can handle almost your entire design workflow offline—though any external online assets you link will still require an internet connection to load.
- **Why a browser extension instead of hosting it in the cloud?** Bruh, I don't want to pay for hosting services. Maintaining cloud infrastructure while broke will only break me more.
- **So it's like a desktop app, just accessible in the browser?** Yes—that's the exact idea.
- **This looks like another drag-and-drop website builder. What exactly does it solve?** It definitely feels like one—and you could even use it to build web pages—but Wyzard is purpose-built for digital publishing. Standard web builders output messy HTML/CSS that breaks inside e-readers, whereas Wyzard enforces reflowable guardrails and compiles directly into EPUB 3 packages to solve layout issues for both ebook publishers and readers.
