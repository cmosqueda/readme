import matter from "gray-matter";
import { github, session } from "../../lib/studio-auth.js";

const owner = "cmosqueda";
const repo = "readme";
const directory = "src/content/blogs";
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const quote = (value) => JSON.stringify(String(value ?? ""));
const list = (values) => (Array.isArray(values) ? values : []).map((value) => `  - ${quote(value)}`).join("\n");
function markdown(data, body) {
  return `---\ntitle: ${quote(data.title)}\ndate: ${quote(data.date)}\ncategory: ${quote(data.category)}\nreadTime: ${quote(data.readTime)}\nsummary: ${quote(data.summary)}\ntags:\n${list(data.tags)}\n${data.coverImage ? `coverImage: ${quote(data.coverImage)}\n` : ""}${data.updatedAt ? `updatedAt: ${quote(data.updatedAt)}\n` : ""}draft: ${data.draft === true}\n---\n\n${body.trim()}\n`;
}
function decoded(item) { const raw = Buffer.from(item.content, "base64").toString("utf8"); const parsed = matter(raw); return { slug: item.name.replace(/\.md$/, ""), ...parsed.data, body: parsed.content.trim(), sha: item.sha }; }

export default async function handler(request, response) {
  const current = session(request);
  if (!current) return response.status(401).json({ error: "Sign in required." });
  try {
    if (request.method === "GET") {
      const slug = typeof request.query.slug === "string" ? request.query.slug : null;
      if (slug) return response.status(200).json(decoded(await github(`/repos/${owner}/${repo}/contents/${directory}/${slug}.md?ref=main`, current.token)));
      const files = await github(`/repos/${owner}/${repo}/contents/${directory}?ref=main`, current.token);
      const entries = await Promise.all(files.filter((file) => file.name.endsWith(".md")).map(async (file) => decoded(await github(`/repos/${owner}/${repo}/contents/${directory}/${file.name}?ref=main`, current.token))));
      return response.status(200).json(entries.sort((a, b) => String(b.date).localeCompare(String(a.date))));
    }
    const { slug, originalSlug, data, body, sha } = request.body ?? {};
    // Deletes carry only a file reference — never gate them on content validation.
    if (request.method === "DELETE") {
      if (!slugPattern.test(slug ?? "") || !sha) return response.status(400).json({ error: "Missing file reference for deletion." });
      await github(`/repos/${owner}/${repo}/contents/${directory}/${slug}.md`, current.token, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: `studio: delete ${slug}`, sha, branch: "main" }) });
      return response.status(204).end();
    }
    if (!slugPattern.test(slug ?? "") || (originalSlug !== undefined && !slugPattern.test(originalSlug ?? "")) || !data?.title || !data?.date || !data?.category || !data?.readTime || !data?.summary || !Array.isArray(data.tags) || !body?.trim()) return response.status(400).json({ error: "Complete all required fields and use a lowercase kebab-case slug." });
    if (request.method === "PUT") {
      // A changed slug on an existing file is a rename: write the new path
      // (without the old blob sha, which belongs to the old path), then
      // remove the old file so no duplicate is left behind.
      const renaming = Boolean(sha && originalSlug && originalSlug !== slug);
      const payload = { message: `studio: ${renaming ? "rename" : sha ? "update" : "publish"} ${data.title}`, content: Buffer.from(markdown(data, body)).toString("base64"), branch: "main", ...(sha && !renaming ? { sha } : {}) };
      await github(`/repos/${owner}/${repo}/contents/${directory}/${slug}.md`, current.token, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (renaming) {
        try {
          await github(`/repos/${owner}/${repo}/contents/${directory}/${originalSlug}.md`, current.token, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: `studio: rename ${originalSlug} to ${slug}`, sha, branch: "main" }) });
        } catch (cleanupError) { console.error("Studio blogs rename cleanup failed", cleanupError); return response.status(200).json({ ok: true, warning: "Saved under the new slug, but the old file could not be removed. Delete it manually." }); }
      }
      return response.status(200).json({ ok: true });
    }
    return response.status(405).end();
  } catch (error) { console.error("Studio blogs failed", error); return response.status(502).json({ error: "GitHub could not complete that request." }); }
}
