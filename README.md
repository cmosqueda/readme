# Christine Mosqueda Portfolio

A React + Vite portfolio with Markdown articles and a Git-backed editor.

## Publishing content

After the one-time configuration below, open `https://cmosqueda.vercel.app/studio`, sign in with the authorized GitHub account, then create or edit an article or featured project. Publishing creates a commit on `main`; Vercel deploys that commit automatically.

New articles are saved in `src/content/blogs`; featured projects are saved in `src/content/projects`. A checked **Save as draft** field keeps either content type out of the website, sitemap, and SEO output while preserving it in Git.

## One-time Studio setup

1. In GitHub, create an OAuth App. Its Authorization callback URL must be `https://cmosqueda.vercel.app/api/studio/callback`.
2. In the Vercel project's Production environment, add these variables:
   - `CMS_SITE_URL=https://cmosqueda.vercel.app`
   - `GITHUB_OAUTH_CLIENT_ID` — the OAuth App client ID
   - `GITHUB_OAUTH_CLIENT_SECRET` — the OAuth App client secret
   - `CMS_ADMIN_GITHUB_LOGIN=cmosqueda`
   - `CMS_SESSION_SECRET` — a long, randomly generated secret
3. Deploy this branch. Visit `/studio` and sign in with GitHub.

## Custom Studio

`/studio` is the portfolio-branded editor for blog articles and featured projects, with separate **Articles** and **Projects** workspaces. Project editing includes metadata, display order, tools, workflow highlights, editable details, draft state, an optional cover-image path, and the Markdown case study. Each save commits directly to `main`, triggering the normal Vercel deployment.

The repo header carries a deploy-status pill (`/api/studio/status`, session-guarded). Every build writes `dist/content-manifest.json` with its commit SHA, so the Studio can compare repo `main` against what's actually deployed: **Live** (SHAs match), **Behind** (Vercel hasn't finished), **Deploying…** / **Failed** (only when the optional `VERCEL_TOKEN` + `VERCEL_PROJECT_ID` variables are set — plus `VERCEL_TEAM_ID` for team projects). It refreshes after every save or delete, polls every 30 seconds, and the pill opens a popover with the repo SHA, latest content commit, deployed SHA and build time.

If the public site moves to a custom domain, update `CMS_SITE_URL` and the GitHub callback URL together.

## Development

```bash
npm install
npm run dev
npm run validate:content
npm run build
```

`npm run build` validates blog frontmatter, builds the Vite app, prerenders blog and project routes, and generates the sitemap.
