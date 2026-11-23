import matter from "gray-matter";
import { github, session } from "../../lib/studio-auth.js";
import { isReorderValidationError, reorderContent } from "../../lib/studio-reorder.js";

const owner = "cmosqueda";
const repo = "readme";
const directory = "src/content/experiences";
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const quote = (value) => JSON.stringify(String(value ?? ""));
const list = (values) => (Array.isArray(values) ? values : []).map((value) => `  - ${quote(value)}`).join("\n");

function markdown(data, body) {
  return `---\ncompany: ${quote(data.company)}\nrole: ${quote(data.role)}\nperiod: ${quote(data.period)}\nlocation: ${quote(data.location)}\norder: ${Number(data.order)}\nhighlights:\n${list(data.highlights)}\ndraft: ${data.draft === true}\n---\n\n${body.trim()}\n`;
}

function decoded(item) {
  const raw = Buffer.from(item.content, "base64").toString("utf8");
  const parsed = matter(raw);
  return {
    slug: item.name.replace(/\.md$/, ""),
    ...parsed.data,
    body: parsed.content.trim(),
    sha: item.sha,
  };
}

function validExperience(slug, data, body) {
  return (
    slugPattern.test(slug ?? "") &&
    data?.company &&
    data?.role &&
    data?.period &&
    Number.isInteger(Number(data.order)) &&
    Number(data.order) >= 0 &&
    Array.isArray(data.highlights) &&
    body?.trim()
  );
}

export default async function handler(request, response) {
  const current = session(request);
  if (!current) return response.status(401).json({ error: "Sign in required." });

  try {
    if (request.method === "GET") {
      const slug = typeof request.query.slug === "string" ? request.query.slug : null;
      if (slug) {
        return response.status(200).json(
          decoded(
            await github(
              `/repos/${owner}/${repo}/contents/${directory}/${slug}.md?ref=main`,
              current.token
            )
          )
        );
      }

      try {
        const files = await github(
          `/repos/${owner}/${repo}/contents/${directory}?ref=main`,
          current.token
        );
        const entries = await Promise.all(
          files
            .filter((file) => file.name.endsWith(".md"))
            .map(async (file) =>
              decoded(
                await github(
                  `/repos/${owner}/${repo}/contents/${directory}/${file.name}?ref=main`,
                  current.token
                )
              )
            )
        );
        return response.status(200).json(entries.sort((a, b) => Number(a.order) - Number(b.order)));
      } catch (err) {
        // Fallback for local development or if directory is newly initialized
        const fs = await import("node:fs/promises");
        const path = await import("node:path");
        const localDir = path.resolve(process.cwd(), directory);
        const fileNames = await fs.readdir(localDir).catch(() => []);
        const localEntries = await Promise.all(
          fileNames
            .filter((file) => file.endsWith(".md"))
            .map(async (file) => {
              const raw = await fs.readFile(path.join(localDir, file), "utf8");
              const parsed = matter(raw);
              return {
                slug: file.replace(/\.md$/, ""),
                ...parsed.data,
                body: parsed.content.trim(),
              };
            })
        );
        return response.status(200).json(localEntries.sort((a, b) => Number(a.order) - Number(b.order)));
      }
    }

    if (request.method === "PATCH") {
      const result = await reorderContent({
        directory,
        kind: "experiences",
        slugs: request.body?.slugs,
        token: current.token,
        formatMarkdown: markdown,
        syncLocal: true,
      });
      return response.status(200).json(result);
    }

    const { slug, originalSlug, data, body, sha } = request.body ?? {};

    if (request.method === "DELETE") {
      if (!slugPattern.test(slug ?? "") || !sha) {
        return response.status(400).json({ error: "Missing file reference for deletion." });
      }
      await github(
        `/repos/${owner}/${repo}/contents/${directory}/${slug}.md`,
        current.token,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `studio: delete experience ${slug}`,
            sha,
            branch: "main",
          }),
        }
      );
      try {
        const fs = await import("node:fs/promises");
        const path = await import("node:path");
        await fs.unlink(path.resolve(process.cwd(), directory, `${slug}.md`));
      } catch {}
      return response.status(204).end();
    }

    if (!validExperience(slug, data, body) || (originalSlug !== undefined && !slugPattern.test(originalSlug ?? ""))) {
      return response.status(400).json({
        error: "Complete all experience fields (role, company, period, order, body) and use a lowercase kebab-case slug.",
      });
    }

    if (request.method === "PUT") {
      const renaming = Boolean(sha && originalSlug && originalSlug !== slug);
      const markdownContent = markdown(data, body);
      const payload = {
        message: `studio: ${renaming ? "rename" : sha ? "update" : "publish"} experience ${data.role} at ${data.company}`,
        content: Buffer.from(markdownContent).toString("base64"),
        branch: "main",
        ...(sha && !renaming ? { sha } : {}),
      };

      await github(
        `/repos/${owner}/${repo}/contents/${directory}/${slug}.md`,
        current.token,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      // Local write in dev environment
      try {
        const fs = await import("node:fs/promises");
        const path = await import("node:path");
        const localDir = path.resolve(process.cwd(), directory);
        await fs.mkdir(localDir, { recursive: true });
        await fs.writeFile(path.join(localDir, `${slug}.md`), markdownContent, "utf8");
        if (renaming) {
          await fs.unlink(path.join(localDir, `${originalSlug}.md`)).catch(() => {});
        }
      } catch {}

      if (renaming) {
        try {
          await github(
            `/repos/${owner}/${repo}/contents/${directory}/${originalSlug}.md`,
            current.token,
            {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                message: `studio: rename experience ${originalSlug} to ${slug}`,
                sha,
                branch: "main",
              }),
            }
          );
        } catch (cleanupError) {
          console.error("Studio experience rename cleanup failed", cleanupError);
          return response.status(200).json({
            ok: true,
            warning: "Saved under the new slug, but the old file could not be removed. Delete it manually.",
          });
        }
      }

      return response.status(200).json({ ok: true });
    }

    return response.status(405).end();
  } catch (error) {
    if (isReorderValidationError(error)) return response.status(400).json({ error: error.message });
    console.error("Studio experiences failed", error);
    return response.status(502).json({ error: "GitHub could not complete that request." });
  }
}
