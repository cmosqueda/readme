import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const siteUrl = "https://cmosqueda.vercel.app";
const root = process.cwd();
const dist = path.join(root, "dist");

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

function markdownToHtml(markdown) {
  const lines = markdown.trim().split(/\r?\n/);
  const output = [];
  let paragraph = [];
  let listOpen = false;
  const flushParagraph = () => {
    if (paragraph.length) {
      output.push(`<p>${escapeHtml(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };
  const closeList = () => {
    if (listOpen) output.push("</ul>");
    listOpen = false;
  };

  for (const line of lines) {
    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    const list = line.match(/^[-*]\s+(.+)$/);
    if (heading) {
      flushParagraph(); closeList();
      const level = heading[1].length;
      output.push(`<h${level}>${escapeHtml(heading[2])}</h${level}>`);
    } else if (list) {
      flushParagraph();
      if (!listOpen) { output.push("<ul>"); listOpen = true; }
      output.push(`<li>${escapeHtml(list[1])}</li>`);
    } else if (!line.trim()) {
      flushParagraph(); closeList();
    } else if (!line.startsWith("---")) {
      paragraph.push(line.trim());
    }
  }
  flushParagraph(); closeList();
  return output.join("\n");
}

function replaceMeta(head, matcher, replacement) {
  return matcher.test(head) ? head.replace(matcher, replacement) : head.replace("</head>", `  ${replacement}\n</head>`);
}

function pageHtml(template, { title, description, pathname, type = "website", body, schema, publishedTime }) {
  const url = `${siteUrl}${pathname}`;
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(description)}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escapeHtml(description)}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta property="og:type" content="[^"]*"\s*\/>/, `<meta property="og:type" content="${type}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${escapeHtml(description)}" />`);
  html = replaceMeta(html, /<meta name="twitter:url"[^>]*>/, `<meta name="twitter:url" content="${url}" />`);
  if (publishedTime) html = replaceMeta(html, /<meta property="article:published_time"[^>]*>/, `<meta property="article:published_time" content="${publishedTime}" />`);
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(schema)}</script>`);
  // `hidden` keeps this SEO-only fallback out of the first paint so real visitors never see
  // unstyled text before React mounts; crawlers still read it from the raw HTML.
  return html.replace('<div id="root"></div>', `<div id="root"><div hidden>${body}</div></div>`);
}

async function getContent(directory) {
  const files = await readdir(path.join(root, "src", "content", directory));
  return Promise.all(files.filter((file) => file.endsWith(".md")).map(async (file) => {
    const raw = await readFile(path.join(root, "src", "content", directory, file), "utf8");
    const parsed = matter(raw);
    return { slug: file.replace(/\.md$/, ""), ...parsed.data, content: parsed.content };
  }));
}

async function writePage(relativePath, html) {
  const target = path.join(dist, relativePath, "index.html");
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, html);
}

const template = await readFile(path.join(dist, "index.html"), "utf8");
const [blogs, projects] = await Promise.all([getContent("blogs"), getContent("projects")]);
const person = {
  "@type": "Person", name: "Tine Mosqueda", url: `${siteUrl}/`, jobTitle: "Product Systems Analyst",
  image: `${siteUrl}/og-image.png`, sameAs: ["https://www.linkedin.com/in/christine-mosqueda-ba202b333/", "https://github.com/cmosqueda"],
};
const personSchema = {
  "@context": "https://schema.org", "@type": "Person", name: "Tine Mosqueda", url: `${siteUrl}/`,
  jobTitle: "Product Systems Analyst", image: `${siteUrl}/og-image.png`,
  sameAs: ["https://www.linkedin.com/in/christine-mosqueda-ba202b333/", "https://github.com/cmosqueda"],
};

const homeBody = `<main><h1>Tine Mosqueda — Product Systems Analyst</h1><p>Portfolio focused on user research, workflow design, system requirements, QA validation, and product delivery.</p><h2>Featured work</h2><ul>${projects.map((project) => `<li><a href="/projects/${project.slug}">${escapeHtml(project.title)}</a>: ${escapeHtml(project.description)}</li>`).join("")}</ul><h2>Notes and articles</h2><ul>${blogs.map((blog) => `<li><a href="/blogs/${blog.slug}">${escapeHtml(blog.title)}</a>: ${escapeHtml(blog.summary)}</li>`).join("")}</ul></main>`;
await writeFile(path.join(dist, "index.html"), pageHtml(template, {
  title: "Tine Mosqueda | Product Systems Analyst Portfolio",
  description: "Product systems analyst portfolio featuring user research, workflow design, system requirements, QA validation, and product delivery.",
  pathname: "/", body: homeBody, schema: personSchema,
}));

for (const blog of blogs) {
  const pathname = `/blogs/${blog.slug}`;
  const schema = { "@context": "https://schema.org", "@type": "BlogPosting", headline: blog.title, description: blog.summary, datePublished: blog.date, author: person, mainEntityOfPage: `${siteUrl}${pathname}`, image: `${siteUrl}/og-image.png`, keywords: blog.tags };
  await writePage(path.join("blogs", blog.slug), pageHtml(template, {
    title: `${blog.title} | Tine Mosqueda`, description: blog.summary, pathname, type: "article", publishedTime: blog.date,
    body: `<main><article><p>QA and product systems note</p><h1>${escapeHtml(blog.title)}</h1><p>${escapeHtml(blog.summary)}</p><p>Published ${escapeHtml(blog.date)} · ${escapeHtml(blog.readTime)}</p>${markdownToHtml(blog.content)}</article></main>`, schema,
  }));
}

for (const project of projects) {
  const pathname = `/projects/${project.slug}`;
  const schema = { "@context": "https://schema.org", "@type": "CreativeWork", name: project.title, description: project.description, author: person, url: `${siteUrl}${pathname}`, image: `${siteUrl}/og-image.png`, keywords: project.tools };
  await writePage(path.join("projects", project.slug), pageHtml(template, {
    title: `${project.title} Case Study | Tine Mosqueda`, description: project.description, pathname,
    body: `<main><article><p>Case study · ${escapeHtml(project.category)}</p><h1>${escapeHtml(project.title)}</h1><p>${escapeHtml(project.description)}</p><h2>Role</h2><p>${escapeHtml(project.role)}</p>${markdownToHtml(project.content)}</article></main>`, schema,
  }));
}

const today = new Date().toISOString().slice(0, 10);
const sitemapEntries = [
  { pathname: "/", lastmod: today },
  ...blogs.map((blog) => ({ pathname: `/blogs/${blog.slug}`, lastmod: blog.date })),
  ...projects.map((project) => ({ pathname: `/projects/${project.slug}`, lastmod: today })),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.map(({ pathname, lastmod }) => `  <url><loc>${siteUrl}${pathname}</loc><lastmod>${lastmod}</lastmod></url>`).join("\n")}\n</urlset>\n`;
await writeFile(path.join(dist, "sitemap.xml"), sitemap);
