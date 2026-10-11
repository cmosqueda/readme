import matter from "gray-matter";
import { github, session } from "../../lib/studio-auth.js";

const owner = "cmosqueda";
const repo = "readme";
const directory = "src/content/projects";
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const quote = (value) => JSON.stringify(String(value ?? ""));
const list = (values) => (Array.isArray(values) ? values : []).map((value) => `  - ${quote(value)}`).join("\n");
const stats = (values) => (Array.isArray(values) ? values : []).map((stat) => `  - label: ${quote(stat.label)}\n    value: ${quote(stat.value)}`).join("\n");

function markdown(data, body) {
  return `---\ntitle: ${quote(data.title)}\ncategory: ${quote(data.category)}\nrole: ${quote(data.role)}\nstatus: ${quote(data.status)}\ndescription: ${quote(data.description)}\ntools:\n${list(data.tools)}\nworkflow:\n${list(data.workflow)}\nstats:\n${stats(data.stats)}\norder: ${Number(data.order)}\n${data.coverImage ? `coverImage: ${quote(data.coverImage)}\n` : ""}draft: ${data.draft === true}\n---\n\n${body.trim()}\n`;
}

function decoded(item) {
  const raw = Buffer.from(item.content, "base64").toString("utf8");
  const parsed = matter(raw);
  return { slug: item.name.replace(/\.md$/, ""), ...parsed.data, body: parsed.content.trim(), sha: item.sha };
}

function validProject(slug, data, body) {
  return slugPattern.test(slug ?? "")
    && data?.title && data?.category && data?.role && data?.status && data?.description
    && Array.isArray(data.tools) && data.tools.length > 0
    && Array.isArray(data.workflow) && data.workflow.length > 0
    && Array.isArray(data.stats) && data.stats.length > 0
    && data.stats.every((stat) => stat?.label && stat?.value)
    && Number.isInteger(Number(data.order)) && Number(data.order) >= 0
    && body?.trim();
}

export default async function handler(request, response) {
  const current = session(request);
  if (!current) return response.status(401).json({ error: "Sign in required." });

  try {
    if (request.method === "GET") {
      const slug = typeof request.query.slug === "string" ? request.query.slug : null;
      if (slug) return response.status(200).json(decoded(await github(`/repos/${owner}/${repo}/contents/${directory}/${slug}.md?ref=main`, current.token)));

      const files = await github(`/repos/${owner}/${repo}/contents/${directory}?ref=main`, current.token);
      const entries = await Promise.all(files.filter((file) => file.name.endsWith(".md")).map(async (file) => decoded(await github(`/repos/${owner}/${repo}/contents/${directory}/${file.name}?ref=main`, current.token))));
      return response.status(200).json(entries.sort((a, b) => Number(a.order) - Number(b.order)));
    }

    const { slug, data, body, sha } = request.body ?? {};
    if (!validProject(slug, data, body)) return response.status(400).json({ error: "Complete all project fields, add at least one stat, and use a lowercase kebab-case slug." });

    if (request.method === "PUT") {
      const payload = {
        message: `studio: ${sha ? "update" : "publish"} project ${data.title}`,
        content: Buffer.from(markdown(data, body)).toString("base64"),
        branch: "main",
        ...(sha ? { sha } : {}),
      };
      await github(`/repos/${owner}/${repo}/contents/${directory}/${slug}.md`, current.token, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      return response.status(200).json({ ok: true });
    }

    if (request.method === "DELETE" && sha) {
      await github(`/repos/${owner}/${repo}/contents/${directory}/${slug}.md`, current.token, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: `studio: delete project ${slug}`, sha, branch: "main" }) });
      return response.status(204).end();
    }

    return response.status(405).end();
  } catch (error) {
    console.error("Studio projects failed", error);
    return response.status(502).json({ error: "GitHub could not complete that request." });
  }
}
