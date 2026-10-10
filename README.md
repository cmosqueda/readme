# Christine Mosqueda Portfolio

A React + Vite portfolio with Markdown articles and a Git-backed editor.

## Publishing an article

After the one-time configuration below, open `https://cmosqueda.vercel.app/admin`, sign in with the GitHub account that can write to `cmosqueda/readme`, then create or edit an article. Publishing creates a commit on `main`; Vercel deploys that commit automatically.

New articles are saved in `src/content/blogs`. A checked **Save as draft** field keeps an article out of the website, sitemap, and SEO output while preserving it in Git.

## One-time CMS setup

1. In GitHub, create an OAuth App. Its Authorization callback URL must be `https://cmosqueda.vercel.app/api/callback`.
2. In the Vercel project's Production environment, add these variables:
   - `CMS_SITE_URL=https://cmosqueda.vercel.app`
   - `GITHUB_OAUTH_CLIENT_ID` — the OAuth App client ID
   - `GITHUB_OAUTH_CLIENT_SECRET` — the OAuth App client secret
3. Deploy this branch. Visit `/admin` and sign in with GitHub.

If the public site moves to a custom domain, update `CMS_SITE_URL`, the GitHub callback URL, and the `base_url` / `site_domain` values in `public/admin/config.yml` together.

## Development

```bash
npm install
npm run dev
npm run validate:content
npm run build
```

`npm run build` validates blog frontmatter, builds the Vite app, prerenders blog and project routes, and generates the sitemap.
