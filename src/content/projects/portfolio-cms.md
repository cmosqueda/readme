---
title: "Portfolio Custom CMS"
category: "Developer Tools • Content Workflow"
role: "Product Designer & Full-stack Developer"
status: "Live"
description: "A private, GitHub-authenticated CMS that lets me manage portfolio articles and featured projects as Markdown, then publish them through the same Vercel deployment pipeline as the site."
tools:
  - "React"
  - "TypeScript"
  - "Vite"
  - "GitHub OAuth"
  - "GitHub Contents API"
  - "Vercel"
workflow:
  - "Git-backed content"
  - "OAuth access control"
  - "Markdown rendering"
  - "Continuous deployment"
details:
  - label: "Authentication"
    value: "Github OAuth"
  - label: "File types"
    value: "Markdown"
  - label: "Publishing path"
    value: "GitHub → Vercel"
  - label: "Database required"
    value: "None"
order: 0
draft: false
---

# From a README-Inspired Portfolio to a Content Workflow

I began this portfolio as a hobby project and a way to strengthen my frontend skills. The first version borrowed from the visual language of a GitHub README. After several rounds of design exploration, I returned to that direction: it suited the repository's name, **readme**, and gave the portfolio a familiar, developer-focused personality.

As the site grew, I wanted it to do more than present static work. I enjoy writing—both creatively and for technical documentation—and I wanted a space to publish articles alongside featured projects.

## The Foundation: Markdown Content

During school, I worked with Docusaurus and appreciated how Markdown and MDX make documentation-style content straightforward to author and maintain. I carried that lesson into this portfolio by building a Markdown rendering pipeline: each article and project case study lives in its own `.md` file, with frontmatter for structured metadata such as title, category, tags, details, and publishing state.

That separated content from presentation and meant new pages did not need to be hardcoded into React components. However, the workflow still had friction: publishing meant opening my IDE, creating and formatting a file in the repository, committing it, and pushing the change.

## The Problem

Markdown removed hardcoded article bodies, but it did not remove the need to work directly inside the codebase for every post. For a personal publishing workflow, that made a simple content update feel too much like a development task.

I wanted to preserve the benefits of Git-backed Markdown without adding a database or replacing the rendering system that already powered the site.

## The Approach: a Git-Backed CMS

I explored Decap CMS, formerly Netlify CMS, as a reference for a Git-based content workflow. Its model aligned closely with the existing architecture: content remains in the repository, while an editor provides a friendlier publishing interface.

Rather than introducing a separate hosted CMS, I built **Portfolio Custom CMS**—a private, portfolio-branded dashboard designed around my own content model. It works with the existing Markdown renderer and keeps GitHub as the source of truth.

## Publishing Pipeline

1. I sign in to the private CMS dashboard with GitHub OAuth.
2. The dashboard validates the content and writes Markdown with frontmatter to the appropriate folder through the GitHub Contents API.
3. GitHub receives a commit on `main`.
4. Vercel detects the commit, rebuilds the portfolio, and deploys the updated content.

The result is a familiar editing experience without a separate database, migration layer, or duplicated content source.

## What the Portfolio CMS Supports

- **Private GitHub authentication** restricted to the portfolio owner.
- **Article management** with titles, dates, categories, summaries, tags, draft state, cover-image paths, and Markdown content.
- **Featured-project management** with roles, status, display order, tools, workflow highlights, details, draft state, and long-form case studies.
- **Git-native publishing** that creates or updates Markdown files directly in the repository.
- **Automatic deployment** through the existing GitHub-to-Vercel integration.

## Outcome

Portfolio CMS turns publishing into a focused content task rather than an IDE task. I can now draft, revise, and publish articles or projects from a single dashboard while preserving an auditable Git history and the Markdown workflow that already fits the portfolio.

## Next Iterations

The next improvements I would explore are media uploads and richer revision feedback. The foundation is intentionally lightweight: the content stays portable, the site stays database-free, and the publishing flow remains easy to understand.
